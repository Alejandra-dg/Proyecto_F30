/**
 * Controladores unificados para el Microservicio de Catálogos Maestros:
 * TipoProyecto, Cliente, Universidad, Etapa y endpoint de validación agregada.
 */
const mongoose = require('mongoose');
const TipoProyecto = require('../models/TipoProyecto');
const Cliente = require('../models/Cliente');
const Universidad = require('../models/Universidad');
const Etapa = require('../models/Etapa');
const { AppError } = require('../middlewares/errorHandler');

/**
 * Genera controladores CRUD estándar (Listar, Obtener por ID, Crear, Actualizar) para un modelo.
 */
const crearControladorCatalogo = (Modelo, nombreEntidad, camposPermitidos) => ({
  listar: async (_req, res, next) => {
    try {
      const registros = await Modelo.find().sort({ fechaCreacion: 1 });
      return res.status(200).json({ ok: true, total: registros.length, data: registros });
    } catch (err) {
      return next(err);
    }
  },
  obtenerPorId: async (req, res, next) => {
    try {
      const registro = await Modelo.findById(req.params.id);
      if (!registro) {
        throw new AppError(`No se encontró ${nombreEntidad} con ID '${req.params.id}'.`, 404);
      }
      return res.status(200).json({ ok: true, data: registro });
    } catch (err) {
      return next(err);
    }
  },
  crear: async (req, res, next) => {
    try {
      const payload = {};
      camposPermitidos.forEach((c) => {
        if (req.body[c] !== undefined) payload[c] = req.body[c];
      });
      const creado = await Modelo.create(payload);
      return res.status(201).json({
        ok: true,
        mensaje: `${nombreEntidad} creado exitosamente.`,
        data: creado,
      });
    } catch (err) {
      return next(err);
    }
  },
  actualizar: async (req, res, next) => {
    try {
      const payload = {};
      camposPermitidos.forEach((c) => {
        if (req.body[c] !== undefined) payload[c] = req.body[c];
      });
      const actualizado = await Modelo.findByIdAndUpdate(req.params.id, payload, {
        new: true,
        runValidators: true,
      });
      if (!actualizado) {
        throw new AppError(`No se encontró ${nombreEntidad} con ID '${req.params.id}'.`, 404);
      }
      return res.status(200).json({
        ok: true,
        mensaje: `${nombreEntidad} actualizado exitosamente.`,
        data: actualizado,
      });
    } catch (err) {
      return next(err);
    }
  },
});

const tipoProyectoCtrl = crearControladorCatalogo(TipoProyecto, 'Tipo de proyecto', ['nombre']);
const clienteCtrl = crearControladorCatalogo(Cliente, 'Cliente', ['nombre', 'email']);
const universidadCtrl = crearControladorCatalogo(Universidad, 'Universidad', [
  'nombre',
  'direccion',
  'telefono',
]);
const etapaCtrl = crearControladorCatalogo(Etapa, 'Etapa', ['nombre']);

/**
 * Endpoint interno de alta eficiencia para que servicio-proyectos valide
 * en una sola llamada HTTP la existencia de las 4 referencias foráneas.
 */
const validarReferencias = async (req, res, next) => {
  try {
    const { cliente, tipoProyecto, universidad, etapa } = req.body;
    const resultado = {};

    const verificarId = async (Modelo, id, etiqueta) => {
      if (id === undefined) return null;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError(`El ID '${id}' para '${etiqueta}' no tiene formato ObjectId válido.`, 400);
      }
      const doc = await Modelo.findById(id);
      if (!doc) {
        throw new AppError(`No existe ${etiqueta} con ID '${id}' en servicio-catalogos.`, 404);
      }
      return doc;
    };

    const [docCliente, docTipo, docUni, docEtapa] = await Promise.all([
      verificarId(Cliente, cliente, 'cliente'),
      verificarId(TipoProyecto, tipoProyecto, 'tipoProyecto'),
      verificarId(Universidad, universidad, 'universidad'),
      verificarId(Etapa, etapa, 'etapa'),
    ]);

    if (docCliente) resultado.cliente = docCliente;
    if (docTipo) resultado.tipoProyecto = docTipo;
    if (docUni) resultado.universidad = docUni;
    if (docEtapa) resultado.etapa = docEtapa;

    return res.status(200).json({
      ok: true,
      mensaje: 'Referencias validadas exitosamente en servicio-catalogos.',
      data: resultado,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  tipoProyectoCtrl,
  clienteCtrl,
  universidadCtrl,
  etapaCtrl,
  validarReferencias,
};
