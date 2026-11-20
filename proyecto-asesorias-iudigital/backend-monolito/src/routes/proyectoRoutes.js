/**
 * Rutas REST para el módulo Proyecto (/api/proyectos).
 */
const { Router } = require('express');
const {
  listarProyectos,
  obtenerProyectoPorId,
  crearProyecto,
  actualizarProyecto,
} = require('../controllers/proyectoController');

const router = Router();

router.get('/', listarProyectos);
router.get('/:id', obtenerProyectoPorId);
router.post('/', crearProyecto);
router.put('/:id', actualizarProyecto);

module.exports = router;
