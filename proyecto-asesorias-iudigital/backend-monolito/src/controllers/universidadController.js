/**
 * Controlador para el módulo Universidad.
 * Implementa listado, consulta por ID, creación y actualización.
 */
const Universidad = require('../models/Universidad');
const { AppError } = require('../middlewares/errorHandler');

/**
 * Lista todas las universidades registradas.
 */
const listarUniversidades = async (_req, res, next) => {
  try {
    const universidades = await Universidad.find().sort({ nombre: 1 });
    return res.status(200).json({
      ok: true,
      total: universidades.length,
      data: universidades,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Obtiene una universidad por su ObjectId.
 */
const obtenerUniversidadPorId = async (req, res, next) => {
  try {
    const universidad = await Universidad.findById(req.params.id);
    if (!universidad) {
      throw new AppError(`No se encontró la universidad con ID '${req.params.id}'.`, 404);
    }
    return res.status(200).json({
      ok: true,
      data: universidad,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Crea una nueva universidad.
 */
const crearUniversidad = async (req, res, next) => {
  try {
    const nuevaUniversidad = await Universidad.create({
      nombre: req.body.nombre,
      direccion: req.body.direccion,
      telefono: req.body.telefono,
    });
    return res.status(201).json({
      ok: true,
      mensaje: 'Universidad creada exitosamente.',
      data: nuevaUniversidad,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Actualiza una universidad existente por ID.
 */
const actualizarUniversidad = async (req, res, next) => {
  try {
    const campos = {};
    if (req.body.nombre !== undefined) campos.nombre = req.body.nombre;
    if (req.body.direccion !== undefined) campos.direccion = req.body.direccion;
    if (req.body.telefono !== undefined) campos.telefono = req.body.telefono;

    const actualizada = await Universidad.findByIdAndUpdate(req.params.id, campos, {
      new: true,
      runValidators: true,
    });

    if (!actualizada) {
      throw new AppError(`No se encontró la universidad con ID '${req.params.id}'.`, 404);
    }

    return res.status(200).json({
      ok: true,
      mensaje: 'Universidad actualizada exitosamente.',
      data: actualizada,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listarUniversidades,
  obtenerUniversidadPorId,
  crearUniversidad,
  actualizarUniversidad,
};
