/**
 * Rutas REST para el módulo Cliente (/api/clientes).
 */
const { Router } = require('express');
const {
  listarClientes,
  obtenerClientePorId,
  crearCliente,
  actualizarCliente,
} = require('../controllers/clienteController');

const router = Router();

router.get('/', listarClientes);
router.get('/:id', obtenerClientePorId);
router.post('/', crearCliente);
router.put('/:id', actualizarCliente);

module.exports = router;
