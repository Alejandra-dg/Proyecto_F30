/**
 * Punto de entrada del Microservicio de Catálogos Maestros (puerto 4001).
 * Gestiona Tipos de Proyecto, Clientes, Universidades y Etapas.
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');

const { conectarBD, desconectarBD } = require('./config/db');
const catalogosRoutes = require('./routes/catalogosRoutes');
const { rutaNoEncontrada, manejadorErrores } = require('./middlewares/errorHandler');

const app = express();
const PORT = Number(process.env.PORT) || 4001;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  const dbActiva = mongoose.connection.readyState === 1;
  res.status(dbActiva ? 200 : 503).json({
    ok: dbActiva,
    servicio: 'iudigital-servicio-catalogos',
    arquitectura: 'microservicios',
    modulos: ['tipos-proyecto', 'clientes', 'universidades', 'etapas'],
    estadoBD: dbActiva ? 'conectado' : 'desconectado',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api', catalogosRoutes);

app.use(rutaNoEncontrada);
app.use(manejadorErrores);

const iniciarServidor = async () => {
  try {
    await conectarBD();
    const server = app.listen(PORT, () => {
      console.log(`[Servicio-Catalogos] Escuchando en http://localhost:${PORT}`);
    });

    const cierreControlado = async (senal) => {
      console.log(`\n[Servicio-Catalogos] Señal ${senal} recibida. Cerrando...`);
      server.close(async () => {
        await desconectarBD();
        process.exit(0);
      });
    };

    process.on('SIGINT', () => cierreControlado('SIGINT'));
    process.on('SIGTERM', () => cierreControlado('SIGTERM'));
  } catch (error) {
    console.error('[Servicio-Catalogos] Error crítico al iniciar:', error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  iniciarServidor();
}

module.exports = app;
