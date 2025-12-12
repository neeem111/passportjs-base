import { ROL } from "../model/proxy.mjs";

const USUARIO_ID = 'USUARIO_ID';
const USUARIO_ROL = 'USUARIO_ROL';
const TOKEN_ID = 'TOKEN_ID'; // <--- AÑADIDO: Clave para guardar el token

class LibreriaSession {

  formatoMoneda;

  constructor() {
    this.formatoMoneda = Intl.NumberFormat('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits:2,
      currencySign: "accounting",
    });
  }

    // NUEVO MÉTODO: Guardar el token
    setToken(token) { sessionStorage.setItem(TOKEN_ID, token) } // [cite: 174]

    // NUEVO MÉTODO: Obtener el token
    getToken() { return sessionStorage.getItem(TOKEN_ID); } // [cite: 174]


  ingreso(usuario) {
    this.setUsuarioId(usuario._id);
    this.setUsuarioRol(usuario.rol);
  }

  setUsuarioId(id) { sessionStorage.setItem(USUARIO_ID, id); }
  getUsuarioId() {
    if (this.esInvitado()) throw new Error('Es un invitado');
    return sessionStorage.getItem(USUARIO_ID);
  }

  setUsuarioRol(rol) { sessionStorage.setItem(USUARIO_ROL, rol); }
  getUsuarioRol() { return sessionStorage.getItem(USUARIO_ROL); }

  salir() {
    sessionStorage.removeItem(USUARIO_ID);
    sessionStorage.removeItem(USUARIO_ROL);
    sessionStorage.removeItem(TOKEN_ID); // <--- MODIFICADO: Eliminar el token [cite: 178]
  }

  esInvitado() { return !this.getUsuarioRol(); }
  esCliente() { return !this.esInvitado() && this.getUsuarioRol() == ROL.CLIENTE; }
  esAdmin() { return !this.esInvitado() && this.getUsuarioRol() == ROL.ADMIN; }

  formatearMoneda(valor) {

    return this.formatoMoneda.format(valor);
  }

}

export let libreriaSession = new LibreriaSession();