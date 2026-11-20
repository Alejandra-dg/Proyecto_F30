/**
 * Rutas REST para el módulo Universidad (/api/universidades).
 */
const { Router } = require('express');
const {
  listarUniversidades,
  obtenerUniversidadPorId,
  crearUniversidad,
  actualizarUniversidad,
} = require('../controllers/universidadController');

const router = Router();

router.get('/', listarUniversidades);
router.get('/:id', obtenerUniversidadPorId);
router.post('/', crearUniversidad);
router.put('/:id', actualizarUniversidad);

module.exports = router;
