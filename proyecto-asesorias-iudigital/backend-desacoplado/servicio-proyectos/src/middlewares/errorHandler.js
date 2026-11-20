/**
 * Middleware centralizado de manejo de errores para el Microservicio de Proyectos.
 */
class AppError extends Error {
  constructor(mensaje, statusCode = 400, detalles = []) {
    super(mensaje);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.detalles = detalles;
  }
}

const rutaNoEncontrada = (req, res, _next) => {
  res.status(404).json({
    ok: false,
    servicio: 'servicio-proyectos',
    error: 'Ruta no encontrada',
    mensaje: `No existe el endpoint ${req.method} ${req.originalUrl}`,
  });
};

const manejadorErrores = (err, _req, res, _next) => {
  if (err instanceof AppError || err.statusCode) {
    return res.status(err.statusCode || 400).json({
      ok: false,
      servicio: 'servicio-proyectos',
      error: err.name === 'AppError' ? 'Error en la solicitud' : err.name,
      mensaje: err.message,
      ...(err.detalles && err.detalles.length > 0 ? { detalles: err.detalles } : {}),
    });
  }

  if (err.name === 'ValidationError') {
    const detalles = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      ok: false,
      servicio: 'servicio-proyectos',
      error: 'Error de validación de datos',
      mensaje: detalles.join(' | '),
      detalles,
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      ok: false,
      servicio: 'servicio-proyectos',
      error: 'Identificador inválido',
      mensaje: `El valor '${err.value}' no es un identificador válido para '${err.path}'.`,
    });
  }

  if (err.code === 11000) {
    const campo = Object.keys(err.keyPattern || err.keyValue || {})[0] || 'numero';
    const valor = err.keyValue ? err.keyValue[campo] : '';
    return res.status(409).json({
      ok: false,
      servicio: 'servicio-proyectos',
      error: 'Conflicto de duplicidad',
      mensaje: `Ya existe un proyecto con el mismo valor en '${campo}' (${valor}).`,
    });
  }

  console.error('[Servicio-Proyectos][Error Interno]:', err);
  return res.status(500).json({
    ok: false,
    servicio: 'servicio-proyectos',
    error: 'Error interno del servidor',
    mensaje: 'Ocurrió un error interno inesperado en el microservicio de proyectos.',
  });
};

module.exports = { AppError, rutaNoEncontrada, manejadorErrores };
