/**
 * Controlador para el módulo Proyecto (Monolito).
 * Verifica la existencia real de las 4 referencias foráneas en MongoDB
 * y utiliza .populate() para enriquecer las consultas.
 */
const Proyecto = require('../models/Proyecto');
const Cliente = require('../models/Cliente');
const TipoProyecto = require('../models/TipoProyecto');
const Universidad = require('../models/Universidad');
const Etapa = require('../models/Etapa');
const { AppError } = require('../middlewares/errorHandler');

const CAMPOS_POPULATE = [
  { path: 'cliente', select: 'nombre email' },
  { path: 'tipoProyecto', select: 'nombre' },
  { path: 'universidad', select: 'nombre direccion telefono' },
  { path: 'etapa', select: 'nombre' },
];

/**
 * Verifica que los ObjectIds proporcionados existan realmente en sus colecciones.
 * @param {object} refs - Objeto con cliente, tipoProyecto, universidad, etapa.
 */
const verificarReferenciasLocales = async ({ cliente, tipoProyecto, universidad, etapa }) => {
  const promesas = [];

  if (cliente !== undefined) {
    promesas.push(
      Cliente.findById(cliente).then((doc) => {
        if (!doc) throw new AppError(`El cliente con ID '${cliente}' no existe.`, 404);
      })
    );
  }
  if (tipoProyecto !== undefined) {
    promesas.push(
      TipoProyecto.findById(tipoProyecto).then((doc) => {
        if (!doc) throw new AppError(`El tipo de proyecto con ID '${tipoProyecto}' no existe.`, 404);
      })
    );
  }
  if (universidad !== undefined) {
    promesas.push(
      Universidad.findById(universidad).then((doc) => {
        if (!doc) throw new AppError(`La universidad con ID '${universidad}' no existe.`, 404);
      })
    );
  }
  if (etapa !== undefined) {
    promesas.push(
      Etapa.findById(etapa).then((doc) => {
        if (!doc) throw new AppError(`La etapa con ID '${etapa}' no existe.`, 404);
      })
    );
  }

  await Promise.all(promesas);
};

/**
 * Lista todos los proyectos poblando sus referencias foráneas.
 */
const listarProyectos = async (_req, res, next) => {
  try {
    const proyectos = await Proyecto.find()
      .populate(CAMPOS_POPULATE)
      .sort({ fechaCreacion: -1 });

    return res.status(200).json({
      ok: true,
      total: proyectos.length,
      data: proyectos,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Obtiene un proyecto por ID con sus relaciones pobladas.
 */
const obtenerProyectoPorId = async (req, res, next) => {
  try {
    const proyecto = await Proyecto.findById(req.params.id).populate(CAMPOS_POPULATE);
    if (!proyecto) {
      throw new AppError(`No se encontró el proyecto con ID '${req.params.id}'.`, 404);
    }
    return res.status(200).json({
      ok: true,
      data: proyecto,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Crea un nuevo proyecto validando previamente las 4 llaves foráneas y el rango de fechas.
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

    await verificarReferenciasLocales({ cliente, tipoProyecto, universidad, etapa });

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
      mensaje: 'Proyecto de asesoría creado exitosamente.',
      data: proyectoPoblado,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Actualiza un proyecto existente validando integridad referencial y lógica de fechas.
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

    await verificarReferenciasLocales({ cliente, tipoProyecto, universidad, etapa });

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
