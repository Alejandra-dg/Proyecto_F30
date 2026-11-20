#!/usr/bin/env bash
# ==============================================================================
# Script de pruebas manuales con cURL para EA2: API CRUD con MongoDB
# Secuencia: POST -> GET (todos) -> GET (filtrado) -> PUT -> GET -> DELETE -> GET
# Requisito previo: tener corriendo el servidor en http://localhost:8000
# ==============================================================================

set -u

BASE_URL="http://localhost:8000"

# En entornos Windows/WSL usa curl.exe del host si esta disponible para alcanzar localhost:8000
if command -v curl.exe >/dev/null 2>&1; then
  CURL_BIN="curl.exe"
else
  CURL_BIN="curl"
fi

echo "=================================================================="
echo " INICIANDO SECUENCIA DE PRUEBAS CURL - EA2 API SENSORES"
echo "=================================================================="

# 1. POST /sensores/ - Crear un nuevo sensor de temperatura valido (espera HTTP 201)
echo -e "\n[1/7] POST /sensores/ -> Creando un nuevo sensor de temperatura..."
${CURL_BIN} -i -s -X POST "${BASE_URL}/sensores/" \
  -H "Content-Type: application/json" \
  -d '{"tipo":"temperatura","valor":72.4,"ubicacion":"Reactor Quimico Planta 1","fecha":"2026-11-20T10:30:00"}'
echo -e "\n"

# 2. GET /sensores/ - Listar todos los sensores registrados en la base de datos (espera HTTP 200)
echo -e "\n[2/7] GET /sensores/ -> Consultando todos los sensores registrados..."
${CURL_BIN} -i -s -X GET "${BASE_URL}/sensores/"
echo -e "\n"

# 3. GET /sensores/?tipo=temperatura - Filtrar unicamente sensores de tipo temperatura (espera HTTP 200)
echo -e "\n[3/7] GET /sensores/?tipo=temperatura -> Filtrando sensores por tipo 'temperatura'..."
${CURL_BIN} -i -s -X GET "${BASE_URL}/sensores/?tipo=temperatura"
echo -e "\n"

# 4. PUT /sensores/temperatura - Actualizar el primer sensor de tipo temperatura (espera HTTP 200)
echo -e "\n[4/7] PUT /sensores/temperatura -> Actualizando el primer sensor de tipo 'temperatura'..."
${CURL_BIN} -i -s -X PUT "${BASE_URL}/sensores/temperatura" \
  -H "Content-Type: application/json" \
  -d '{"valor":85.0,"ubicacion":"Reactor Quimico Planta 1 - Sensor Reemplazado","fecha":"2026-11-20T11:15:00"}'
echo -e "\n"

# 5. GET /sensores/?tipo=temperatura - Verificar que los cambios del PUT se guardaron (espera HTTP 200)
echo -e "\n[5/7] GET /sensores/?tipo=temperatura -> Verificando actualizacion del sensor..."
${CURL_BIN} -i -s -X GET "${BASE_URL}/sensores/?tipo=temperatura"
echo -e "\n"

# 6. DELETE /sensores/temperatura - Eliminar el primer sensor de tipo temperatura (espera HTTP 204)
echo -e "\n[6/7] DELETE /sensores/temperatura -> Eliminando el primer sensor de tipo 'temperatura'..."
${CURL_BIN} -i -s -X DELETE "${BASE_URL}/sensores/temperatura"
echo -e "\n"

# 7. GET /sensores/ - Consultar nuevamente todos los sensores tras la eliminacion (espera HTTP 200)
echo -e "\n[7/7] GET /sensores/ -> Listando sensores restantes tras la eliminacion..."
${CURL_BIN} -i -s -X GET "${BASE_URL}/sensores/"
echo -e "\n"

echo "=================================================================="
echo " SECUENCIA DE PRUEBAS FINALIZADA"
echo "=================================================================="
