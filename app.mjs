import express from 'express';
import path from 'path';
import url from 'url';
import { model } from './model/model.mjs';
import { Usuario } from './model/usuario.mjs';
import mongoose from 'mongoose';
// NUEVOS IMPORTS PARA AUTENTICACIÓN
import passport from 'passport';
import { Strategy as JWTStrategy, ExtractJwt } from 'passport-jwt';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// CLAVE SECRETA (USAR VARIABLE DE ENTORNO EN PRODUCCIÓN)
const SECRET_KEY = 'YOUR_SECRET_KEY_HERE';

async function connect() {
// ... (código de conexión a Mongoose)
  var uri = 'mongodb://127.0.0.1/libreria';
  mongoose.Promise = global.Promise;
  var db = mongoose.connection;
  db.on('connecting', function () { console.log('Connecting to ', uri); });
  db.on('connected', function () { console.log('Connected to ', uri); });
  db.on('disconnecting', function () { console.log('Disconnecting from ', uri); });
  db.on('disconnected', function () { console.log('Disconnected from ', uri); });
  db.on('error', function (err) { console.error('Error ', err.message); });
  return await mongoose.connect(uri);
}

await connect();

const STATIC_DIR = url.fileURLToPath(new URL('.', import.meta.url));
const PORT = 3000;
export const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CONFIGURACIÓN DE PASSPORT CON ESTRATEGIA JWT
passport.use(
    new JWTStrategy(
        {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: SECRET_KEY,
        },
        async function (jwtPayload, cb) {
            try {
                let user = await Usuario.findById(jwtPayload.id);
                if (!user) {
                    return cb(null, false);
                }
                cb(null, user);
            } catch (err) {
                return cb(err);
            }
        }
    )
);

app.use(passport.initialize());
// FIN CONFIGURACIÓN DE PASSPORT

app.get('/api/libros', async function (req, res, next) {
  res.json(await model.getLibros());
})

// RUTA AUTENTICAR (SIGNIN): GENERACIÓN DE TOKEN (MODIFICADA)
app.post('/api/autenticar',
    async function (req, res, next) {
        try {
            // 1. Verifico que el usuario existe
            const userExists = await Usuario.findOne({ email: req.body.email });
            if (!userExists) return res.status(400).json({ message: "El usuario no existe" });

            // 2. Verifico la contraseña (usando bcrypt)
            let ok = await bcrypt.compare(req.body.password, userExists.password);
            if (!ok) return res.status(400).json({ message: "Contraseña incorrecta" });

            // 3. Creo un token con expiración de 1 minuto (ACTIVIDAD)
            const accessToken = jwt.sign({ id: userExists._id }, SECRET_KEY, { expiresIn: "1m" });
            return res.status(200).json({ token: accessToken });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: error.message });
        }
    }
);

// RUTA PRIVADA: OBTENER USUARIO ACTUAL (AÑADIDA)
app.get('/api/usuarios/actual',
    passport.authenticate("jwt", { session: false }),
    function (req, res, next) {
        try {
            // req.user contiene el usuario cargado por el middleware de Passport
            let usuario = req.user;
            if (!usuario) res.status(404).json({ message: "Usuario no encontrado" });
            res.json(usuario);
        } catch (err) {
             console.error(err);
             res.status(500).json({ message: err.message });
        }
    }
);


// RUTA PRIVADA: OBTENER USUARIO POR ID (PROTEGIDA)
app.get('/api/usuarios/:id',
    passport.authenticate("jwt", { session: false }),
    async function (req, res, next) {
      try {
         let usuario = await Usuario.findById(req.params.id);
         if (!usuario) res.status(404).json({ message: 'Usuario no encotnrado' })
         res.json(usuario);
      } catch (err) {
         console.error(err);
         res.status(500).json({ message: err.message });
      }
    }
);

// RUTA PÚBLICA: REGISTRO (SIN CAMBIOS)
app.post('/api/usuarios',
  async function (req, res, next) {
    try {
      let usuario = await model.addUsuario(req.body);
      res.json(usuario);
    } catch (err) {
      console.error(err);
      res.status(401).json({ message: err.message })
    }
  });


// RUTA PRIVADA: MODIFICAR PERFIL (PROTEGIDA)
app.put('/api/usuarios/:id',
    passport.authenticate("jwt", { session: false }),
    async function (req, res, next) {
      try {
            // Se comprueba que el ID en la ruta sea el mismo que el del usuario autenticado
            if (req.params.id !== req.user._id.toString()) {
                return res.status(403).json({ message: 'No autorizado para modificar este perfil' });
            }

          let obj = req.body;
          obj._id = req.user._id; // Aseguramos que solo se actualice el ID del usuario autenticado
          let usuario = await model.updateUsuario(obj);
          res.json(usuario);
      } catch (err) {
         console.error(err);
         res.status(500).json({ message: err.message })
      }
    }
);


app.use('/', express.static(path.join(STATIC_DIR, 'public')));

app.use('/libreria*', (req, res) => {
  res.sendFile(path.join(STATIC_DIR, 'public/libreria/index.html'));
});


app.all('*', function (req, res, next) {
  console.error(`${req.originalUrl} not found!`);
  res.status(404).send('<html><head><title>Not Found</title></head><body><h1>Not found!</h1></body></html>')
})

app.listen(PORT, function () {
  console.log(`Static HTTP server listening on ${PORT}`)
})