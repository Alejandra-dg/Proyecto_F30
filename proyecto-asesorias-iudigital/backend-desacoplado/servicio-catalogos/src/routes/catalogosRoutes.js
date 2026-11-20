/**
 * Rutas REST del Microservicio de Catálogos Maestros (/api/*).
 */
const { Router } = require('express');
const {
  tipoProyectoCtrl,
  clienteCtrl,
  universidadCtrl,
  etapaCtrl,
  validarReferencias,
} = require('../controllers/catalogosController');

const crearRouterCatalogo = (ctrl) => {
  const r = Router();
  r.get('/', ctrl.listar);
  r.get('/:id', ctrl.obtenerPorId);
  r.post('/', ctrl.crear);
  r.put('/:id', ctrl.actualizar);
  return r;
};

const apiRouter = Router();

apiRouter.use('/tipos-proyecto', crearRouterCatalogo(tipoProyectoCtrl));
apiRouter.use('/clientes', crearRouterCatalogo(clienteCtrl));
apiRouter.use('/universidades', crearRouterCatalogo(universidadCtrl));
apiRouter.use('/etapas', crearRouterCatalogo(etapaCtrl));
apiRouter.post('/catalogos/validar-referencias', validarReferencias);

module.exports = apiRouter;
