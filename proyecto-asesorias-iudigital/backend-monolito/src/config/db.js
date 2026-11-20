/**
 * Configuración de la conexión a MongoDB mediante Mongoose.
 * Incluye gestión de eventos de conexión, reconexión y cierre limpio (graceful shutdown).
 */
const mongoose = require('mongoose');

const MONGO_URI_DEFAULT = 'mongodb://localhost:27017/asesorias_iudigital';

/**
 * Establece la conexión asíncrona con la base de datos MongoDB.
 * @param {string} [uri] - URI de conexión opcional; si no se provee, usa process.env.MONGO_URI.
 * @returns {Promise<typeof mongoose>} Instancia de Mongoose conectada.
 */
const conectarBD = async (uri) => {
  const mongoUri = uri || process.env.MONGO_URI || MONGO_URI_DEFAULT;

  mongoose.connection.on('connected', () => {
    console.log(`[MongoDB] Conexión establecida exitosamente en: ${mongoose.connection.name}`);
  });

  mongoose.connection.on('error', (err) => {
    console.error(`[MongoDB] Error en la conexión: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[MongoDB] Conexión a la base de datos cerrada o desconectada.');
  });

  const conexion = await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });

  return conexion;
};

/**
 * Cierra de forma controlada la conexión activa con MongoDB.
 * @returns {Promise<void>}
 */
const desconectarBD = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
};

module.exports = {
  conectarBD,
  desconectarBD,
  MONGO_URI_DEFAULT,
};
