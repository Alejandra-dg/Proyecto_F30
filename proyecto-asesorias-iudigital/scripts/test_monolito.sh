#!/usr/bin/env bash
# ==============================================================================
# Suite de Pruebas Funcionales con cURL para la Arquitectura Monolítica (4000)
# Verifica: Healthcheck, GET/POST/PUT de los 5 módulos y validaciones (400/409)
# ==============================================================================
set -u

BASE_URL="${BASE_URL:-http://localhost:4000}"

if command -v curl.exe >/dev/null 2>&1; then
  CURL_BIN="curl.exe"
else
  CURL_BIN="curl"
fi

echo "=================================================================="
echo " SUITE DE PRUEBAS FUNCIONALES - MONOLITO IUDIGITAL (${BASE_URL})"
echo "=================================================================="

echo -e "\n[1/8] GET /health -> Verificando estado de salud del Monolito..."
${CURL_BIN} -i -s "${BASE_URL}/health"
echo -e "\n"

echo -e "\n[2/8] GET /api/tipos-proyecto -> Listando catálogo de Tipos de Proyecto..."
${CURL_BIN} -i -s "${BASE_URL}/api/tipos-proyecto"
echo -e "\n"

echo -e "\n[3/8] POST /api/tipos-proyecto (Enum Inválido) -> Debe rechazar con HTTP 400..."
${CURL_BIN} -i -s -X POST "${BASE_URL}/api/tipos-proyecto" \
  -H "Content-Type: application/json" \
  -d '{"nombre":"tesis doctoral no permitida"}'
echo -e "\n"

echo -e "\n[4/8] POST /api/clientes -> Creando un nuevo cliente válido (HTTP 201)..."
${CURL_BIN} -i -s -X POST "${BASE_URL}/api/clientes" \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Laura Sofía Gómez","email":"laura.gomez@est.iudigital.edu.co"}'
echo -e "\n"

echo -e "\n[5/8] POST /api/clientes (Email Duplicado) -> Debe rechazar con HTTP 409..."
${CURL_BIN} -i -s -X POST "${BASE_URL}/api/clientes" \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Laura Duplicada","email":"laura.gomez@est.iudigital.edu.co"}'
echo -e "\n"

echo -e "\n[6/8] GET /api/universidades -> Listando Universidades..."
${CURL_BIN} -i -s "${BASE_URL}/api/universidades"
echo -e "\n"

echo -e "\n[7/8] GET /api/etapas -> Listando Etapas..."
${CURL_BIN} -i -s "${BASE_URL}/api/etapas"
echo -e "\n"

echo -e "\n[8/8] GET /api/proyectos -> Listando Proyectos con .populate() de las 4 referencias..."
${CURL_BIN} -i -s "${BASE_URL}/api/proyectos"
echo -e "\n"

echo "=================================================================="
echo " PRUEBAS DEL MONOLITO FINALIZADAS"
echo "=================================================================="
