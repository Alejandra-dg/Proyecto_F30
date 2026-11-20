/**
 * Punto de entrada principal del Sistema Monolítico - Asesorías Académicas IUDigital.
 * Expone los 5 módulos de negocio bajo /api/* y el endpoint de verificación /health.
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');

const { conectarBD, desconectarBD } = require('./config/db');
const tipoProyectoRoutes = require('./routes/tipoProyectoRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const universidadRoutes = require('./routes/universidadRoutes');
const etapaRoutes = require('./routes/etapaRoutes');
const proyectoRoutes = require('./routes/proyectoRoutes');
const { rutaNoEncontrada, manejadorErrores } = require('./middlewares/errorHandler');

const app = express();
const PORT = Number(process.env.PORT) || 4000;

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Endpoint de salud (Healthcheck) para Docker Compose y Jenkins Smoke Tests
app.get('/health', (_req, res) => {
  const dbActiva = mongoose.connection.readyState === 1;
  res.status(dbActiva ? 200 : 503).json({
    ok: dbActiva,
    servicio: 'iudigital-monolito',
    arquitectura: 'monolitica',
    estadoBD: dbActiva ? 'conectado' : 'desconectado',
    timestamp: new Date().toISOString(),
  });
});

// Montaje de rutas de los 5 módulos del caso de estudio
app.use('/api/tipos-proyecto', tipoProyectoRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/universidades', universidadRoutes);
app.use('/api/etapas', etapaRoutes);
app.use('/api/proyectos', proyectoRoutes);

// Middlewares de rutas no encontradas (404) y manejo centralizado de errores
app.use(rutaNoEncontrada);
app.use(manejadorErrores);

/**
 * Inicializa la conexión a MongoDB y arranca el servidor HTTP.
 */
const iniciarServidor = async () => {
  try {
    await conectarBD();
    const server = app.listen(PORT, () => {
      console.log(`[Monolito IUDigital] Servidor escuchando en http://localhost:${PORT}`);
    });

    const cierreControlado = async (senal) => {
      console.log(`\n[Monolito IUDigital] Señal ${senal} recibida. Cerrando servidor...`);
      server.close(async () => {
        await desconectarBD();
        process.exit(0);
      });
    };

    process.on('SIGINT', () => cierreControlado('SIGINT'));
    process.on('SIGTERM', () => cierreControlado('SIGTERM'));
  } catch (error) {
    console.error('[Monolito IUDigital] Fallo crítico al iniciar el servidor:', error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  iniciarServidor();
}

module.exports = app;
