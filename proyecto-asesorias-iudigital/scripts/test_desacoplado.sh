#!/usr/bin/env bash
# ==============================================================================
# Suite de Pruebas Funcionales con cURL para la Arquitectura Desacoplada
# Servicio Catálogos (4001) + Servicio Proyectos Desacoplado (4002)
# ==============================================================================
set -u

CATALOGOS_URL="${CATALOGOS_URL:-http://localhost:4001}"
PROYECTOS_URL="${PROYECTOS_URL:-http://localhost:4002}"

if command -v curl.exe >/dev/null 2>&1; then
  CURL_BIN="curl.exe"
else
  CURL_BIN="curl"
fi

echo "=================================================================="
echo " SUITE DE PRUEBAS - ARQUITECTURA DESACOPLADA IUDIGITAL"
echo " Catálogos : ${CATALOGOS_URL}"
echo " Proyectos : ${PROYECTOS_URL}"
echo "=================================================================="

echo -e "\n[1/5] GET /health en Servicio Catálogos (4001)..."
${CURL_BIN} -i -s "${CATALOGOS_URL}/health"
echo -e "\n"

echo -e "\n[2/5] GET /health en Servicio Proyectos Desacoplado (4002)..."
${CURL_BIN} -i -s "${PROYECTOS_URL}/health"
echo -e "\n"

echo -e "\n[3/5] GET /api/clientes en Servicio Catálogos (4001)..."
${CURL_BIN} -i -s "${CATALOGOS_URL}/api/clientes"
echo -e "\n"

echo -e "\n[4/5] GET /api/proyectos en Servicio Proyectos Desacoplado (4002)..."
${CURL_BIN} -i -s "${PROYECTOS_URL}/api/proyectos"
echo -e "\n"

echo -e "\n[5/5] POST /api/proyectos con referencia inexistente -> Validación inter-servicio (HTTP 404)..."
${CURL_BIN} -i -s -X POST "${PROYECTOS_URL}/api/proyectos" \
  -H "Content-Type: application/json" \
  -d '{"numero":"RAD-9999","titulo":"Proyecto con Referencia Inexistente","fechaIniciacion":"2026-03-01","fechaEntrega":"2026-08-01","valor":1500000,"cliente":"000000000000000000000000","tipoProyecto":"000000000000000000000000","universidad":"000000000000000000000000","etapa":"000000000000000000000000"}'
echo -e "\n"

echo "=================================================================="
echo " PRUEBAS DE MICROSERVICIOS DESACOPLADOS FINALIZADAS"
echo "=================================================================="
