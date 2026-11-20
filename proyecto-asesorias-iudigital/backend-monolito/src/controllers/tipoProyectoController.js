/**
 * Controlador para el módulo TipoProyecto.
 * Implementa listado, consulta por ID, creación y actualización.
 */
const TipoProyecto = require('../models/TipoProyecto');
const { AppError } = require('../middlewares/errorHandler');

/**
 * Lista todos los tipos de proyecto registrados.
 */
const listarTiposProyecto = async (_req, res, next) => {
  try {
    const tipos = await TipoProyecto.find().sort({ fechaCreacion: 1 });
    return res.status(200).json({
      ok: true,
      total: tipos.length,
      data: tipos,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Obtiene un tipo de proyecto por su ObjectId.
 */
const obtenerTipoProyectoPorId = async (req, res, next) => {
  try {
    const tipo = await TipoProyecto.findById(req.params.id);
    if (!tipo) {
      throw new AppError(`No se encontró el tipo de proyecto con ID '${req.params.id}'.`, 404);
    }
    return res.status(200).json({
      ok: true,
      data: tipo,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Crea un nuevo tipo de proyecto validando el enum estricto.
 */
const crearTipoProyecto = async (req, res, next) => {
  try {
    const nuevoTipo = await TipoProyecto.create({
      nombre: req.body.nombre,
    });
    return res.status(201).json({
      ok: true,
      mensaje: 'Tipo de proyecto creado exitosamente.',
      data: nuevoTipo,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Actualiza un tipo de proyecto existente por ID.
 */
const actualizarTipoProyecto = async (req, res, next) => {
  try {
    const actualizado = await TipoProyecto.findByIdAndUpdate(
      req.params.id,
      { nombre: req.body.nombre },
      { new: true, runValidators: true }
    );
    if (!actualizado) {
      throw new AppError(`No se encontró el tipo de proyecto con ID '${req.params.id}'.`, 404);
    }
    return res.status(200).json({
      ok: true,
      mensaje: 'Tipo de proyecto actualizado exitosamente.',
      data: actualizado,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listarTiposProyecto,
  obtenerTipoProyectoPorId,
  crearTipoProyecto,
  actualizarTipoProyecto,
};
