import { Libro } from './libro.mjs';
import { Usuario } from './usuario.mjs';
import bcrypt from 'bcrypt'; // NUEVO IMPORT PARA ENCRIPTACIÓN

export const ROL = {
// ... (mismo código)
  ADMIN: "ADMIN",
  CLIENTE: "CLIENTE",
};

export class Libreria {

  constructor() { }

  /**
   * Libros
   */

// ... (métodos setLibros y getLibros sin cambios)

  /**
   * Usuario
   */

// ... (método setClientes sin cambios)

  async addCliente(obj) {
    let cliente = await this.getClientePorEmail(obj.email);
    if (cliente) throw new Error('Correo electrónico registrado');
    // ENCRIPTACIÓN DE CONTRASEÑA (ACTIVIDAD)
    obj.password = await bcrypt.hash(obj.password, 10);
    return await new Usuario(obj).save();
  }

  async addUsuario(obj) {
// ... (mismo código)
    if (obj.rol == ROL.CLIENTE)
      return await this.addCliente(obj);
    else if (obj.rol == ROL.ADMIN)
      return await this.addAdmin(obj);
    else throw new Error('Rol desconocido');
  }


  async getClientePorEmail(email) {
// ... (mismo código)
    return await Usuario.findOne({ rol: ROL.CLIENTE, email: email });
  }

  async getAdministradorPorEmail(email) {
// ... (mismo código, ajustado si el original estaba duplicado)
    return await Usuario.findOne({ rol: ROL.ADMIN, email: email });
  }


  async updateUsuario(obj) {
    let usuario = await Usuario.findById(obj._id);
    usuario.nombres = obj.nombres;
    usuario.apellidos = obj.apellidos;
    usuario.email = obj.email;
    usuario.direccion = obj.direccion;
    // ENCRIPTACIÓN DE CONTRASEÑA SI SE MODIFICA (ACTIVIDAD)
    if (obj.password) {
      usuario.password = await bcrypt.hash(obj.password, 10);
    }
    usuario.dni = obj.dni;
    return await usuario.save();
  }

  async autenticar(obj) {
    // Se mantiene solo la lógica de búsqueda por rol/email.
    // La comparación de contraseña con bcrypt se realiza ahora en app.mjs.
    let email = obj.email;
    let usuario;

    if (obj.rol == ROL.CLIENTE) usuario = await this.getClientePorEmail(email);
    else if (obj.rol == ROL.ADMIN) usuario = await this.getAdministradorPorEmail(email);
    else throw new Error('Rol no encontrado');

    return usuario;
  }
}

export const model = new Libreria();