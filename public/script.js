const API_URL = "/api/mascotas";

const formularioRegistro =
  document.getElementById("form-registro");

const formularioBuscarNombre =
  document.getElementById("form-buscar-nombre");

const formularioBuscarRut =
  document.getElementById("form-buscar-rut");

const formularioEliminarNombre =
  document.getElementById("form-eliminar-nombre");

const formularioEliminarRut =
  document.getElementById("form-eliminar-rut");

const botonListar =
  document.getElementById("btn-listar");

const mensaje =
  document.getElementById("mensaje");

const tabla =
  document.getElementById("tabla");

const tablaMascotas =
  document.getElementById("tabla-mascotas");

const estadoVacio =
  document.getElementById("estado-vacio");

/**
 * Obtiene y limpia el valor de un input.
 */
function obtenerValor(id) {
  return document.getElementById(id).value.trim();
}

/**
 * Muestra mensajes de éxito o error.
 */
function mostrarMensaje(texto, tipo = "exito") {
  mensaje.textContent = texto;

  mensaje.className =
    tipo === "error"
      ? "mensaje mensaje-error"
      : "mensaje mensaje-exito";
}

/**
 * Muestra las mascotas dentro de la tabla.
 */
function mostrarMascotas(datos) {
  const mascotas = Array.isArray(datos)
    ? datos
    : [datos];

  tablaMascotas.replaceChildren();

  const existenMascotas = mascotas.length > 0;

  tabla.hidden = !existenMascotas;
  estadoVacio.hidden = existenMascotas;

  mascotas.forEach((mascota, indice) => {
    const fila = document.createElement("tr");

    const celdaNumero = document.createElement("td");
    const celdaNombre = document.createElement("td");
    const celdaRut = document.createElement("td");

    celdaNumero.textContent = indice + 1;
    celdaNombre.textContent = mascota.nombre;
    celdaRut.textContent = mascota.rut;

    fila.append(
      celdaNumero,
      celdaNombre,
      celdaRut
    );

    tablaMascotas.appendChild(fila);
  });
}

/**
 * Captura errores enviados por el servidor
 * o problemas de conexión.
 */
function manejarError(error) {
  console.error("Error capturado:", error);

  let textoError =
    "No fue posible completar la operación.";

  if (error.response) {
    textoError =
      error.response.data?.error ||
      `Error del servidor: ${error.response.status}`;
  } else if (error.request) {
    textoError =
      "No se recibió respuesta del servidor. Revisa que Node.js esté ejecutándose.";
  } else if (error.message) {
    textoError = error.message;
  }

  mostrarMensaje(textoError, "error");
}

/**
 * Consulta todas las mascotas.
 */
async function listarMascotas(mostrarAviso = false) {
  try {
    const respuesta = await axios.get(API_URL);

    mostrarMascotas(respuesta.data);

    if (mostrarAviso) {
      mostrarMensaje(
        "Listado actualizado correctamente."
      );
    }
  } catch (error) {
    mostrarMascotas([]);
    manejarError(error);
  }
}

/**
 * Registra una mascota.
 */
formularioRegistro.addEventListener(
  "submit",
  async (evento) => {
    evento.preventDefault();

    const nombre = obtenerValor(
      "nombre-registro"
    );

    const rut = obtenerValor("rut-registro");

    if (!nombre || !rut) {
      mostrarMensaje(
        "Completa el nombre y el RUT.",
        "error"
      );

      return;
    }

    try {
      const respuesta = await axios.post(
        API_URL,
        {
          nombre,
          rut,
        }
      );

      formularioRegistro.reset();

      await listarMascotas(false);

      mostrarMensaje(respuesta.data.mensaje);
    } catch (error) {
      manejarError(error);
    }
  }
);

/**
 * Busca una mascota por nombre.
 */
formularioBuscarNombre.addEventListener(
  "submit",
  async (evento) => {
    evento.preventDefault();

    const nombre = obtenerValor(
      "nombre-buscar"
    );

    try {
      const respuesta = await axios.get(
        API_URL,
        {
          params: {
            nombre,
          },
        }
      );

      mostrarMascotas(respuesta.data);

      mostrarMensaje(
        `Mascota "${nombre}" encontrada correctamente.`
      );
    } catch (error) {
      mostrarMascotas([]);
      manejarError(error);
    }
  }
);

/**
 * Busca mascotas por RUT.
 */
formularioBuscarRut.addEventListener(
  "submit",
  async (evento) => {
    evento.preventDefault();

    const rut = obtenerValor("rut-buscar");

    try {
      const respuesta = await axios.get(
        API_URL,
        {
          params: {
            rut,
          },
        }
      );

      mostrarMascotas(respuesta.data);

      mostrarMensaje(
        `${respuesta.data.length} mascota(s) encontrada(s).`
      );
    } catch (error) {
      mostrarMascotas([]);
      manejarError(error);
    }
  }
);

/**
 * Elimina una mascota por nombre.
 */
formularioEliminarNombre.addEventListener(
  "submit",
  async (evento) => {
    evento.preventDefault();

    const nombre = obtenerValor(
      "nombre-eliminar"
    );

    const confirmacion = window.confirm(
      `¿Seguro que deseas eliminar a ${nombre}?`
    );

    if (!confirmacion) {
      return;
    }

    try {
      const respuesta = await axios.delete(
        API_URL,
        {
          params: {
            nombre,
          },
        }
      );

      formularioEliminarNombre.reset();

      await listarMascotas(false);

      mostrarMensaje(respuesta.data.mensaje);
    } catch (error) {
      manejarError(error);
    }
  }
);

/**
 * Elimina todas las mascotas de un RUT.
 */
formularioEliminarRut.addEventListener(
  "submit",
  async (evento) => {
    evento.preventDefault();

    const rut = obtenerValor("rut-eliminar");

    const confirmacion = window.confirm(
      `¿Seguro que deseas eliminar todas las mascotas asociadas al RUT ${rut}?`
    );

    if (!confirmacion) {
      return;
    }

    try {
      const respuesta = await axios.delete(
        API_URL,
        {
          params: {
            rut,
          },
        }
      );

      formularioEliminarRut.reset();

      await listarMascotas(false);

      mostrarMensaje(respuesta.data.mensaje);
    } catch (error) {
      manejarError(error);
    }
  }
);

botonListar.addEventListener("click", () => {
  listarMascotas(true);
});

/**
 * Muestra las mascotas automáticamente
 * al abrir la página.
 */
document.addEventListener(
  "DOMContentLoaded",
  () => {
    listarMascotas(false);
  }
);