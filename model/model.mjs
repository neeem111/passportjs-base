import { Libro } from './libro.mjs';
import { Usuario } from './usuario.mjs';
import bcrypt from 'bcrypt';

export const ROL = {
  ADMIN: "ADMIN",
  CLIENTE: "CLIENTE",
};

export class Libreria {

  constructor() { }

  /**
   * Libros
   */

  async setLibros(libros) {
    await Libro.deleteMany({});
    for (let libro of libros) {
      await new Libro(libro).save();
    }
  }

  async getLibros() {
    return await Libro.find({});
  }

  /**
   * Usuario
   */

  async setClientes(clientes) {
    await Usuario.deleteMany({});
    for (let cliente of clientes) {
      if (cliente.password) {
        cliente.password = await bcrypt.hash(cliente.password, 10);
      }
      await new Usuario(cliente).save();
    }
  }

  async addCliente(obj) {
    let cliente = await this.getClientePorEmail(obj.email);
    if (cliente) throw new Error('Correo electrónico registrado');
    obj.password = await bcrypt.hash(obj.password, 10);
    return await new Usuario(obj).save();
  }

  async addAdmin(obj) {
    let admin = await this.getAdministradorPorEmail(obj.email);
    if (admin) throw new Error('Correo electrónico registrado');
    obj.password = await bcrypt.hash(obj.password, 10);
    return await new Usuario(obj).save();
  }

  async addUsuario(obj) {
    if (obj.rol == ROL.CLIENTE)
      return await this.addCliente(obj);
    else if (obj.rol == ROL.ADMIN)
      return await this.addAdmin(obj);
    else throw new Error('Rol desconocido');
  }

  async getClientePorEmail(email) {
    return await Usuario.findOne({ rol: ROL.CLIENTE, email: email });
  }

  async getAdministradorPorEmail(email) {
    return await Usuario.findOne({ rol: ROL.ADMIN, email: email });
  }

  async updateUsuario(obj) {
    if (!obj._id) {
      throw new Error('ID de usuario requerido');
    }
    let usuario = await Usuario.findById(obj._id);
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }
    usuario.nombres = obj.nombres;
    usuario.apellidos = obj.apellidos;
    usuario.email = obj.email;
    usuario.direccion = obj.direccion;
    if (obj.password) {
      usuario.password = await bcrypt.hash(obj.password, 10);
    }
    usuario.dni = obj.dni;
    return await usuario.save();
  }

  async autenticar(obj) {
    let email = obj.email;
    let usuario;

    if (obj.rol == ROL.CLIENTE) usuario = await this.getClientePorEmail(email);
    else if (obj.rol == ROL.ADMIN) usuario = await this.getAdministradorPorEmail(email);
    else throw new Error('Rol no encontrado');

    return usuario;
  }
}

export const model = new Libreria();
