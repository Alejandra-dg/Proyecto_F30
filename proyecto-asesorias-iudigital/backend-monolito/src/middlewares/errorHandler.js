/**
 * Middleware centralizado para el manejo de errores y excepciones HTTP en Express.
 * Estandariza las respuestas JSON para errores de validación de Mongoose (400),
 * formatos de ObjectId inválidos (400), claves únicas duplicadas (409),
 * recursos no encontrados (404) y fallos internos (500).
 */

/**
 * Clase auxiliar para lanzar errores HTTP con código de estado personalizado.
 */
class AppError extends Error {
  /**
   * @param {string} mensaje - Mensaje descriptivo en español.
   * @param {number} statusCode - Código de estado HTTP (400, 404, 409, 503, etc.).
   * @param {Array<string>} [detalles] - Detalles adicionales opcionales.
   */
  constructor(mensaje, statusCode = 400, detalles = []) {
    super(mensaje);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.detalles = detalles;
  }
}

/**
 * Middleware para rutas inexistentes (404 Not Found).
 */
const rutaNoEncontrada = (req, res, _next) => {
  res.status(404).json({
    ok: false,
    error: 'Ruta no encontrada',
    mensaje: `No existe el endpoint ${req.method} ${req.originalUrl}`,
  });
};

/**
 * Middleware global de captura de errores de Express (4 argumentos).
 */
const manejadorErrores = (err, _req, res, _next) => {
  // 1. Errores controlados de la aplicación (AppError)
  if (err instanceof AppError || err.statusCode) {
    return res.status(err.statusCode || 400).json({
      ok: false,
      error: err.name === 'AppError' ? 'Error en la solicitud' : err.name,
      mensaje: err.message,
      ...(err.detalles && err.detalles.length > 0 ? { detalles: err.detalles } : {}),
    });
  }

  // 2. Error de validación de esquemas Mongoose (ValidationError -> HTTP 400)
  if (err.name === 'ValidationError') {
    const detalles = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      ok: false,
      error: 'Error de validación de datos',
      mensaje: detalles.join(' | '),
      detalles,
    });
  }

  // 3. Error de conversión de ObjectId en Mongoose (CastError -> HTTP 400)
  if (err.name === 'CastError') {
    return res.status(400).json({
      ok: false,
      error: 'Identificador inválido',
      mensaje: `El valor '${err.value}' no es un identificador válido para el campo '${err.path}'.`,
    });
  }

  // 4. Error de índice único duplicado en MongoDB (code: 11000 -> HTTP 409 Conflict)
  if (err.code === 11000) {
    const campo = Object.keys(err.keyPattern || err.keyValue || {})[0] || 'registro';
    const valor = err.keyValue ? err.keyValue[campo] : '';
    return res.status(409).json({
      ok: false,
      error: 'Conflicto de duplicidad',
      mensaje: `Ya existe un registro con el mismo valor en el campo único '${campo}' (${valor}).`,
    });
  }

  // 5. Error de sintaxis en el cuerpo JSON enviado por el cliente
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      ok: false,
      error: 'JSON mal formado',
      mensaje: 'El cuerpo de la petición no contiene un formato JSON válido.',
    });
  }

  // 6. Error interno no previsto (HTTP 500 - sin exponer stacktrace sensible)
  console.error('[Error Interno]:', err);
  return res.status(500).json({
    ok: false,
    error: 'Error interno del servidor',
    mensaje: 'Ocurrió un error inesperado al procesar la solicitud.',
  });
};

module.exports = {
  AppError,
  rutaNoEncontrada,
  manejadorErrores,
};
