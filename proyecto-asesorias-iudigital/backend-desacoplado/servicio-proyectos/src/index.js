/**
 * Punto de entrada del Microservicio Desacoplado de Proyectos (puerto 4002).
 * Componente de mayor demanda transaccional desacoplado de la aplicación monolítica.
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');

const { conectarBD, desconectarBD } = require('./config/db');
const proyectoRoutes = require('./routes/proyectoRoutes');
const { rutaNoEncontrada, manejadorErrores } = require('./middlewares/errorHandler');
const { obtenerUrlCatalogos, verificarSaludCatalogos } = require('./services/catalogosClient');

const app = express();
const PORT = Number(process.env.PORT) || 4002;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', async (_req, res) => {
  const dbActiva = mongoose.connection.readyState === 1;
  const catalogosActivo = await verificarSaludCatalogos();

  res.status(dbActiva ? 200 : 503).json({
    ok: dbActiva,
    servicio: 'iudigital-servicio-proyectos',
    arquitectura: 'microservicios',
    modulo: 'proyectos',
    estadoBD: dbActiva ? 'conectado' : 'desconectado',
    catalogosServiceUrl: obtenerUrlCatalogos(),
    estadoServicioCatalogos: catalogosActivo ? 'disponible' : 'no_verificado',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/proyectos', proyectoRoutes);

app.use(rutaNoEncontrada);
app.use(manejadorErrores);

const iniciarServidor = async () => {
  try {
    await conectarBD();
    const server = app.listen(PORT, () => {
      console.log(
        `[Servicio-Proyectos] Escuchando en http://localhost:${PORT} (Catálogos: ${obtenerUrlCatalogos()})`
      );
    });

    const cierreControlado = async (senal) => {
      console.log(`\n[Servicio-Proyectos] Señal ${senal} recibida. Cerrando...`);
      server.close(async () => {
        await desconectarBD();
        process.exit(0);
      });
    };

    process.on('SIGINT', () => cierreControlado('SIGINT'));
    process.on('SIGTERM', () => cierreControlado('SIGTERM'));
  } catch (error) {
    console.error('[Servicio-Proyectos] Error crítico al iniciar:', error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  iniciarServidor();
}

module.exports = app;
