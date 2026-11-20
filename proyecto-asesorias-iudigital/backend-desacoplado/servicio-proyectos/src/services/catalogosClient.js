/**
 * Cliente HTTP REST resiliente para la comunicación entre microservicios:
 * servicio-proyectos (4002) ---> servicio-catalogos (4001)
 *
 * Utiliza fetch nativo de Node.js con control de timeout (AbortSignal.timeout)
 * para evitar bloqueos en cascada si el servicio de catálogos no responde.
 */
const { AppError } = require('../middlewares/errorHandler');

const obtenerUrlCatalogos = () =>
  (process.env.CATALOGOS_SERVICE_URL || 'http://localhost:4001').replace(/\/+$/, '');

const obtenerTimeoutMs = () => Number(process.env.CATALOGOS_TIMEOUT_MS) || 4000;

/**
 * Valida la existencia de cliente, tipoProyecto, universidad y etapa
 * consultando el endpoint de validación del microservicio servicio-catalogos.
 *
 * @param {object} referencias - IDs a verificar { cliente, tipoProyecto, universidad, etapa }.
 * @returns {Promise<object>} Documentos validados retornados por servicio-catalogos.
 */
const validarReferenciasEnCatalogos = async (referencias) => {
  const baseUrl = obtenerUrlCatalogos();
  const timeoutMs = obtenerTimeoutMs();
  const endpoint = `${baseUrl}/api/catalogos/validar-referencias`;

  let respuesta;
  try {
    respuesta = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(referencias),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    const esTimeout = error.name === 'TimeoutError' || error.name === 'AbortError';
    throw new AppError(
      esTimeout
        ? `Tiempo de espera agotado (${timeoutMs}ms) al contactar a servicio-catalogos (${baseUrl}).`
        : `No fue posible comunicarse con servicio-catalogos en ${baseUrl}: ${error.message}`,
      503
    );
  }

  let cuerpo = {};
  try {
    cuerpo = await respuesta.json();
  } catch (_err) {
    throw new AppError('Respuesta inválida recibida desde servicio-catalogos.', 502);
  }

  if (!respuesta.ok) {
    throw new AppError(
      cuerpo.mensaje || 'Una o más referencias foráneas no existen en servicio-catalogos.',
      respuesta.status
    );
  }

  return cuerpo.data || {};
};

/**
 * Verifica el estado de salud de servicio-catalogos desde servicio-proyectos.
 */
const verificarSaludCatalogos = async () => {
  const baseUrl = obtenerUrlCatalogos();
  try {
    const res = await fetch(`${baseUrl}/health`, {
      signal: AbortSignal.timeout(2000),
    });
    return res.ok;
  } catch (_err) {
    return false;
  }
};

module.exports = {
  validarReferenciasEnCatalogos,
  verificarSaludCatalogos,
  obtenerUrlCatalogos,
};
