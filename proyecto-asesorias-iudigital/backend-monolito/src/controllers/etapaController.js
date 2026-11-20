/**
 * Controlador para el módulo Etapa.
 * Implementa listado, consulta por ID, creación y actualización.
 */
const Etapa = require('../models/Etapa');
const { AppError } = require('../middlewares/errorHandler');

/**
 * Lista todas las etapas académicas registradas.
 */
const listarEtapas = async (_req, res, next) => {
  try {
    const etapas = await Etapa.find().sort({ fechaCreacion: 1 });
    return res.status(200).json({
      ok: true,
      total: etapas.length,
      data: etapas,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Obtiene una etapa por su ObjectId.
 */
const obtenerEtapaPorId = async (req, res, next) => {
  try {
    const etapa = await Etapa.findById(req.params.id);
    if (!etapa) {
      throw new AppError(`No se encontró la etapa con ID '${req.params.id}'.`, 404);
    }
    return res.status(200).json({
      ok: true,
      data: etapa,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Crea una nueva etapa validando el enum estricto.
 */
const crearEtapa = async (req, res, next) => {
  try {
    const nuevaEtapa = await Etapa.create({
      nombre: req.body.nombre,
    });
    return res.status(201).json({
      ok: true,
      mensaje: 'Etapa creada exitosamente.',
      data: nuevaEtapa,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Actualiza una etapa existente por ID.
 */
const actualizarEtapa = async (req, res, next) => {
  try {
    const actualizada = await Etapa.findByIdAndUpdate(
      req.params.id,
      { nombre: req.body.nombre },
      { new: true, runValidators: true }
    );
    if (!actualizada) {
      throw new AppError(`No se encontró la etapa con ID '${req.params.id}'.`, 404);
    }
    return res.status(200).json({
      ok: true,
      mensaje: 'Etapa actualizada exitosamente.',
      data: actualizada,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listarEtapas,
  obtenerEtapaPorId,
  crearEtapa,
  actualizarEtapa,
};
