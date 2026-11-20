/**
 * Configuración de la conexión a MongoDB para el Microservicio de Proyectos.
 */
const mongoose = require('mongoose');

const MONGO_URI_DEFAULT = 'mongodb://localhost:27017/asesorias_iudigital';

const conectarBD = async (uri) => {
  const mongoUri = uri || process.env.MONGO_URI || MONGO_URI_DEFAULT;

  mongoose.connection.on('connected', () => {
    console.log(`[Servicio-Proyectos][MongoDB] Conectado a: ${mongoose.connection.name}`);
  });

  mongoose.connection.on('error', (err) => {
    console.error(`[Servicio-Proyectos][MongoDB] Error: ${err.message}`);
  });

  return mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });
};

const desconectarBD = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
};

module.exports = { conectarBD, desconectarBD };
