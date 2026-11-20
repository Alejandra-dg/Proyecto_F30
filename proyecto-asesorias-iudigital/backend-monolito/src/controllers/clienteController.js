/**
 * Controlador para el módulo Cliente.
 * Implementa listado, consulta por ID, creación y actualización.
 */
const Cliente = require('../models/Cliente');
const { AppError } = require('../middlewares/errorHandler');

/**
 * Lista todos los clientes registrados.
 */
const listarClientes = async (_req, res, next) => {
  try {
    const clientes = await Cliente.find().sort({ fechaCreacion: -1 });
    return res.status(200).json({
      ok: true,
      total: clientes.length,
      data: clientes,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Obtiene un cliente por su ObjectId.
 */
const obtenerClientePorId = async (req, res, next) => {
  try {
    const cliente = await Cliente.findById(req.params.id);
    if (!cliente) {
      throw new AppError(`No se encontró el cliente con ID '${req.params.id}'.`, 404);
    }
    return res.status(200).json({
      ok: true,
      data: cliente,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Crea un nuevo cliente validando nombre y email único.
 */
const crearCliente = async (req, res, next) => {
  try {
    const nuevoCliente = await Cliente.create({
      nombre: req.body.nombre,
      email: req.body.email,
    });
    return res.status(201).json({
      ok: true,
      mensaje: 'Cliente registrado exitosamente.',
      data: nuevoCliente,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Actualiza un cliente existente por ID.
 */
const actualizarCliente = async (req, res, next) => {
  try {
    const campos = {};
    if (req.body.nombre !== undefined) campos.nombre = req.body.nombre;
    if (req.body.email !== undefined) campos.email = req.body.email;

    const actualizado = await Cliente.findByIdAndUpdate(req.params.id, campos, {
      new: true,
      runValidators: true,
    });

    if (!actualizado) {
      throw new AppError(`No se encontró el cliente con ID '${req.params.id}'.`, 404);
    }

    return res.status(200).json({
      ok: true,
      mensaje: 'Cliente actualizado exitosamente.',
      data: actualizado,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listarClientes,
  obtenerClientePorId,
  crearCliente,
  actualizarCliente,
};
