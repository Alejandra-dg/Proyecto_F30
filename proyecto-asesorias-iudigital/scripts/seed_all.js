/**
 * Script global de carga de datos iniciales (scripts/seed_all.js).
 * Invoca el seed idempotente del sistema para poblar la base de datos MongoDB
 * utilizada tanto por el Monolito como por la Arquitectura Desacoplada.
 */
const { ejecutarSeed } = require('../backend-monolito/src/seed');

ejecutarSeed();
