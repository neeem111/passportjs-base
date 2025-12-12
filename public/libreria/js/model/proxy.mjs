import { libreriaSession } from "../commons/libreria-session.mjs";

export const ROL = {
// ... (mismo código)
  ADMIN: "ADMIN",
  CLIENTE: "CLIENTE",
};


export class LibreriaProxy {

  constructor() { }

  /**
   * Libros
   */

// ... (método getLibros sin cambios)

  /**
   * Usuario
   */


// ... (método addUsuario sin cambios)


  async getUsuarioById(id) {
    let response = await fetch('/api/usuarios/'+id, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        // AÑADIR TOKEN (ACTIVIDAD)
        Authorization: `bearer ${libreriaSession.getToken()}`,
      }
    });
    if (response.ok) {
      return await response.json();
    } else {
      let body = await response.json();
      throw new Error(`Error ${response.status}: ${response.statusText}\n ${body.message}`);
    }
  }

  // NUEVA FUNCIÓN: OBTENER USUARIO ACTUAL (RUTA PRIVADA)
    async getUsuarioActual() {
        let response = await fetch('/api/usuarios/actual', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                // AÑADIR TOKEN (ACTIVIDAD)
                Authorization: `bearer ${libreriaSession.getToken()}`,
            }
        });
        if (response.ok) {
            return await response.json();
        } else {
            let body = await response.json();
            throw new Error(`Error ${response.status}: ${response.statusText}\n ${body.message}`);
        }
    }


  async updateUsuario(obj) {    
    let response = await fetch('/api/usuarios/'+obj._id, {
      method: 'PUT',
      body: JSON.stringify(obj),
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        // AÑADIR TOKEN (ACTIVIDAD)
        Authorization: `bearer ${libreriaSession.getToken()}`,
      },
    });
    if (response.ok) {
      return await response.json();
    } else {
      let body = await response.json();
      throw new Error(`Error ${response.status}: ${response.statusText}\n ${body.message}`);
    }
  }

  async autenticar(obj) {
    let response = await fetch('/api/autenticar', {
      method: 'POST',
      body: JSON.stringify(obj),
      headers: { 'Content-Type': 'application/json;charset=utf-8' }
    });
    if (response.ok) {
      return await response.json(); // Devuelve el objeto { token: '...' }
    } else {
      let body = await response.json();
      throw new Error(`Error ${response.status}: ${response.statusText}\n ${body.message}`);
    }
  }

}

export const proxy = new LibreriaProxy();