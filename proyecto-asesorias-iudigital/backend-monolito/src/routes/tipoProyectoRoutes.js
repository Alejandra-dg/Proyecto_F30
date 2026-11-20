/**
 * Rutas REST para el módulo TipoProyecto (/api/tipos-proyecto).
 */
const { Router } = require('express');
const {
  listarTiposProyecto,
  obtenerTipoProyectoPorId,
  crearTipoProyecto,
  actualizarTipoProyecto,
} = require('../controllers/tipoProyectoController');

const router = Router();

router.get('/', listarTiposProyecto);
router.get('/:id', obtenerTipoProyectoPorId);
router.post('/', crearTipoProyecto);
router.put('/:id', actualizarTipoProyecto);

module.exports = router;
