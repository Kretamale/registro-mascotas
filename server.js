const express = require("express");
const path = require("path");
const fs = require("fs").promises;

const app = express();

const PORT = process.env.PORT || 3000;

const ARCHIVO_MASCOTAS = path.join(
  __dirname,
  "data",
  "mascotas.json"
);

// Permite recibir información en formato JSON.
app.use(express.json());

// Permite mostrar los archivos del frontend.
app.use(express.static(path.join(__dirname, "public")));

// Permite utilizar Axios desde node_modules en el navegador.
app.use(
  "/vendor",
  express.static(path.join(__dirname, "node_modules", "axios", "dist"))
);

/**
 * Captura errores producidos en funciones asíncronas.
 */
const asyncHandler = (funcion) => {
  return (req, res, next) => {
    Promise.resolve(funcion(req, res, next)).catch(next);
  };
};

/**
 * Elimina espacios al comienzo y al final de un texto.
 */
function limpiarTexto(valor) {
  if (typeof valor !== "string") {
    return "";
  }

  return valor.trim();
}

/**
 * Convierte un texto a minúsculas para realizar comparaciones.
 */
function normalizarTexto(valor) {
  return limpiarTexto(valor).toLocaleLowerCase("es");
}

/**
 * Elimina puntos y espacios del RUT para facilitar la búsqueda.
 */
function normalizarRut(rut) {
  return limpiarTexto(rut)
    .replace(/\./g, "")
    .replace(/\s/g, "")
    .toUpperCase();
}

/**
 * Lee el archivo mascotas.json.
 */
async function leerMascotas() {
  await fs.mkdir(path.dirname(ARCHIVO_MASCOTAS), {
    recursive: true,
  });

  try {
    const contenido = await fs.readFile(
      ARCHIVO_MASCOTAS,
      "utf8"
    );

    if (!contenido.trim()) {
      return [];
    }

    const mascotas = JSON.parse(contenido);

    if (!Array.isArray(mascotas)) {
      throw new Error(
        "El archivo mascotas.json debe contener un arreglo."
      );
    }

    return mascotas;
  } catch (error) {
    if (error.code === "ENOENT") {
      await fs.writeFile(
        ARCHIVO_MASCOTAS,
        "[]",
        "utf8"
      );

      return [];
    }

    throw error;
  }
}

/**
 * Guarda las mascotas en el archivo JSON.
 */
async function guardarMascotas(mascotas) {
  const contenido = JSON.stringify(mascotas, null, 2);

  await fs.writeFile(
    ARCHIVO_MASCOTAS,
    contenido,
    "utf8"
  );
}

/**
 * GET /api/mascotas
 *
 * Sin parámetros:
 * devuelve todas las mascotas.
 *
 * Con ?nombre=:
 * devuelve la mascota que tenga ese nombre.
 *
 * Con ?rut=:
 * devuelve todas las mascotas asociadas al RUT.
 */
app.get(
  "/api/mascotas",
  asyncHandler(async (req, res) => {
    const nombre = limpiarTexto(req.query.nombre);
    const rut = limpiarTexto(req.query.rut);

    if (nombre && rut) {
      return res.status(400).json({
        error:
          "Debes buscar solamente por nombre o solamente por RUT.",
      });
    }

    const mascotas = await leerMascotas();

    if (nombre) {
      const mascotaEncontrada = mascotas.find(
        (mascota) =>
          normalizarTexto(mascota.nombre) ===
          normalizarTexto(nombre)
      );

      if (!mascotaEncontrada) {
        return res.status(404).json({
          error: `No existe una mascota llamada ${nombre}.`,
        });
      }

      return res.status(200).json(mascotaEncontrada);
    }

    if (rut) {
      const mascotasEncontradas = mascotas.filter(
        (mascota) =>
          normalizarRut(mascota.rut) ===
          normalizarRut(rut)
      );

      if (mascotasEncontradas.length === 0) {
        return res.status(404).json({
          error:
            "No existen mascotas asociadas al RUT ingresado.",
        });
      }

      return res.status(200).json(mascotasEncontradas);
    }

    return res.status(200).json(mascotas);
  })
);

/**
 * POST /api/mascotas
 *
 * Registra una mascota nueva.
 */
app.post(
  "/api/mascotas",
  asyncHandler(async (req, res) => {
    const nombre = limpiarTexto(req.body.nombre);
    const rut = limpiarTexto(req.body.rut);

    if (!nombre || !rut) {
      return res.status(400).json({
        error:
          "El nombre de la mascota y el RUT del dueño son obligatorios.",
      });
    }

    const mascotas = await leerMascotas();

    const mascotaExistente = mascotas.some(
      (mascota) =>
        normalizarTexto(mascota.nombre) ===
        normalizarTexto(nombre)
    );

    if (mascotaExistente) {
      return res.status(409).json({
        error:
          "Ya existe una mascota registrada con ese nombre.",
      });
    }

    const nuevaMascota = {
      nombre,
      rut,
    };

    mascotas.push(nuevaMascota);

    await guardarMascotas(mascotas);

    return res.status(201).json({
      mensaje: "Mascota registrada correctamente.",
      mascota: nuevaMascota,
    });
  })
);

/**
 * DELETE /api/mascotas?nombre=
 *
 * Elimina una mascota por nombre.
 *
 * DELETE /api/mascotas?rut=
 *
 * Elimina todas las mascotas asociadas a un RUT.
 */
app.delete(
  "/api/mascotas",
  asyncHandler(async (req, res) => {
    const nombre = limpiarTexto(req.query.nombre);
    const rut = limpiarTexto(req.query.rut);

    if (!nombre && !rut) {
      return res.status(400).json({
        error:
          "Debes indicar el nombre de la mascota o el RUT del dueño.",
      });
    }

    if (nombre && rut) {
      return res.status(400).json({
        error:
          "Debes eliminar solamente por nombre o solamente por RUT.",
      });
    }

    const mascotas = await leerMascotas();

    if (nombre) {
      const posicion = mascotas.findIndex(
        (mascota) =>
          normalizarTexto(mascota.nombre) ===
          normalizarTexto(nombre)
      );

      if (posicion === -1) {
        return res.status(404).json({
          error: `No existe una mascota llamada ${nombre}.`,
        });
      }

      const mascotaEliminada = mascotas.splice(
        posicion,
        1
      )[0];

      await guardarMascotas(mascotas);

      return res.status(200).json({
        mensaje: "Mascota eliminada correctamente.",
        mascota: mascotaEliminada,
      });
    }

    const mascotasEliminadas = mascotas.filter(
      (mascota) =>
        normalizarRut(mascota.rut) ===
        normalizarRut(rut)
    );

    if (mascotasEliminadas.length === 0) {
      return res.status(404).json({
        error:
          "No existen mascotas asociadas al RUT ingresado.",
      });
    }

    const mascotasRestantes = mascotas.filter(
      (mascota) =>
        normalizarRut(mascota.rut) !==
        normalizarRut(rut)
    );

    await guardarMascotas(mascotasRestantes);

    return res.status(200).json({
      mensaje: `${mascotasEliminadas.length} mascota(s) eliminada(s) correctamente.`,
      mascotasEliminadas,
    });
  })
);

/**
 * Manejo de rutas de API inexistentes.
 */
app.use("/api", (req, res) => {
  res.status(404).json({
    error: "La ruta solicitada no existe.",
  });
});

/**
 * Capa general de captura y manejo de errores.
 */
app.use((error, req, res, next) => {
  console.error("Error detectado:", error);

  if (
    error instanceof SyntaxError &&
    error.status === 400 &&
    "body" in error
  ) {
    return res.status(400).json({
      error:
        "El cuerpo de la solicitud contiene un JSON inválido.",
    });
  }

  return res.status(500).json({
    error:
      "Ocurrió un error interno en el servidor.",
  });
});

app.listen(PORT, () => {
  console.log("---------------------------------------");
  console.log("Registro Civil de Mascotas iniciado");
  console.log(`Servidor: http://localhost:${PORT}`);
  console.log("---------------------------------------");
});
