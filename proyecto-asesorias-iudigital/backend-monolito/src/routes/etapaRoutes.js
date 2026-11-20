/**
 * Rutas REST para el módulo Etapa (/api/etapas).
 */
const { Router } = require('express');
const {
  listarEtapas,
  obtenerEtapaPorId,
  crearEtapa,
  actualizarEtapa,
} = require('../controllers/etapaController');

const router = Router();

router.get('/', listarEtapas);
router.get('/:id', obtenerEtapaPorId);
router.post('/', crearEtapa);
router.put('/:id', actualizarEtapa);

module.exports = router;
