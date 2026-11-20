/**
 * Controlador del Microservicio Desacoplado de Proyectos (servicio-proyectos).
 * Valida la integridad referencial vía HTTP REST contra servicio-catalogos
 * antes de crear o actualizar un proyecto de asesoría.
 */
const Proyecto = require('../models/Proyecto');
const { AppError } = require('../middlewares/errorHandler');
const { validarReferenciasEnCatalogos } = require('../services/catalogosClient');

const CAMPOS_POPULATE = [
  { path: 'cliente', select: 'nombre email' },
  { path: 'tipoProyecto', select: 'nombre' },
  { path: 'universidad', select: 'nombre direccion telefono' },
  { path: 'etapa', select: 'nombre' },
];

/**
 * Lista todos los proyectos registrados con sus 4 relaciones pobladas.
 */
const listarProyectos = async (_req, res, next) => {
  try {
    const proyectos = await Proyecto.find()
      .populate(CAMPOS_POPULATE)
      .sort({ fechaCreacion: -1 });

    return res.status(200).json({
      ok: true,
      servicio: 'servicio-proyectos',
      total: proyectos.length,
      data: proyectos,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Obtiene un proyecto por su ObjectId con sus 4 relaciones pobladas.
 */
const obtenerProyectoPorId = async (req, res, next) => {
  try {
    const proyecto = await Proyecto.findById(req.params.id).populate(CAMPOS_POPULATE);
    if (!proyecto) {
      throw new AppError(`No se encontró el proyecto con ID '${req.params.id}'.`, 404);
    }
    return res.status(200).json({
      ok: true,
      servicio: 'servicio-proyectos',
      data: proyecto,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Crea un proyecto consultando primero a servicio-catalogos vía HTTP REST.
 */
const crearProyecto = async (req, res, next) => {
  try {
    const {
      numero,
      titulo,
      fechaIniciacion,
      fechaEntrega,
      valor,
      cliente,
      tipoProyecto,
      universidad,
      etapa,
    } = req.body;

    if (!cliente || !tipoProyecto || !universidad || !etapa) {
      throw new AppError(
        'Los campos cliente, tipoProyecto, universidad y etapa son obligatorios.',
        400
      );
    }

    // Validación inter-servicio vía HTTP REST contra servicio-catalogos
    await validarReferenciasEnCatalogos({ cliente, tipoProyecto, universidad, etapa });

    const nuevoProyecto = await Proyecto.create({
      numero: numero !== undefined ? String(numero) : undefined,
      titulo,
      fechaIniciacion,
      fechaEntrega,
      valor,
      cliente,
      tipoProyecto,
      universidad,
      etapa,
    });

    const proyectoPoblado = await Proyecto.findById(nuevoProyecto._id).populate(CAMPOS_POPULATE);

    return res.status(201).json({
      ok: true,
      servicio: 'servicio-proyectos',
      mensaje: 'Proyecto de asesoría creado y validado con servicio-catalogos exitosamente.',
      data: proyectoPoblado,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Actualiza un proyecto existente validando las referencias modificadas contra servicio-catalogos.
 */
const actualizarProyecto = async (req, res, next) => {
  try {
    const proyectoExistente = await Proyecto.findById(req.params.id);
    if (!proyectoExistente) {
      throw new AppError(`No se encontró el proyecto con ID '${req.params.id}'.`, 404);
    }

    const {
      numero,
      titulo,
      fechaIniciacion,
      fechaEntrega,
      valor,
      cliente,
      tipoProyecto,
      universidad,
      etapa,
    } = req.body;

    // Si se envían referencias foráneas a actualizar, validarlas en servicio-catalogos
    if (
      cliente !== undefined ||
      tipoProyecto !== undefined ||
      universidad !== undefined ||
      etapa !== undefined
    ) {
      await validarReferenciasEnCatalogos({ cliente, tipoProyecto, universidad, etapa });
    }

    const fechaInicioFinal =
      fechaIniciacion !== undefined ? new Date(fechaIniciacion) : proyectoExistente.fechaIniciacion;
    const fechaEntregaFinal =
      fechaEntrega !== undefined ? new Date(fechaEntrega) : proyectoExistente.fechaEntrega;

    if (fechaEntregaFinal <= fechaInicioFinal) {
      throw new AppError(
        'La fecha de entrega debe ser estrictamente posterior a la fecha de iniciación.',
        400
      );
    }

    if (numero !== undefined) proyectoExistente.numero = String(numero);
    if (titulo !== undefined) proyectoExistente.titulo = titulo;
    if (fechaIniciacion !== undefined) proyectoExistente.fechaIniciacion = fechaIniciacion;
    if (fechaEntrega !== undefined) proyectoExistente.fechaEntrega = fechaEntrega;
    if (valor !== undefined) proyectoExistente.valor = valor;
    if (cliente !== undefined) proyectoExistente.cliente = cliente;
    if (tipoProyecto !== undefined) proyectoExistente.tipoProyecto = tipoProyecto;
    if (universidad !== undefined) proyectoExistente.universidad = universidad;
    if (etapa !== undefined) proyectoExistente.etapa = etapa;

    await proyectoExistente.save();

    const proyectoActualizado = await Proyecto.findById(proyectoExistente._id).populate(
      CAMPOS_POPULATE
    );

    return res.status(200).json({
      ok: true,
      servicio: 'servicio-proyectos',
      mensaje: 'Proyecto de asesoría actualizado exitosamente.',
      data: proyectoActualizado,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listarProyectos,
  obtenerProyectoPorId,
  crearProyecto,
  actualizarProyecto,
};
