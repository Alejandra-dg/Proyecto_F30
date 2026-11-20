# 🧪 Guía de Pruebas Manuales y Automáticas (`PRUEBAS.md`)

Este documento detalla cómo verificar el funcionamiento completo de la API mediante **4 estrategias complementarias**:
1. Pruebas manuales desde terminal con `curl` (`scripts/pruebas_curl.sh`).
2. Pruebas manuales gráficas con **Postman** paso a paso.
3. Pruebas automatizadas con **Pytest + HTTPX** (`tests/test_api.py`).
4. Pruebas específicas de casos de error (`422` y `404`).

---

## Sección 1: Pruebas Manuales con `curl`

El script [`scripts/pruebas_curl.sh`](../scripts/pruebas_curl.sh) automatiza una secuencia completa de 7 pasos (`POST` → `GET` todos → `GET` filtrado → `PUT` → `GET` verificación → `DELETE` → `GET` final).

### Cómo ejecutar el script completo
1. Asegúrate de tener el servidor Uvicorn corriendo en otra terminal (`uvicorn app.main:app --reload`).
2. (Opcional) Carga los datos iniciales: `python scripts/seed_data.py`.
3. Ejecuta el script desde Git Bash, WSL, macOS o Linux:
   ```bash
   bash scripts/pruebas_curl.sh
   ```

### Detalle de los 7 comandos de `pruebas_curl.sh`

#### Paso 1 — Crear un sensor de temperatura (`POST /sensores/`)
Inserta una nueva lectura válida de temperatura (`72.4 °C`) y espera un código **`201 Created`**:
```bash
curl -i -s -X POST "http://localhost:8000/sensores/" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "temperatura",
    "valor": 72.4,
    "ubicacion": "Reactor Químico Planta 1",
    "fecha": "2026-11-20T10:30:00"
  }'
```

#### Paso 2 — Listar todos los sensores (`GET /sensores/`)
Recupera todos los documentos existentes en la colección `sensores` y espera **`200 OK`**:
```bash
curl -i -s -X GET "http://localhost:8000/sensores/"
```

#### Paso 3 — Filtrar sensores por tipo (`GET /sensores/?tipo=temperatura`)
Consulta únicamente los sensores cuyo campo `tipo` sea `"temperatura"` y espera **`200 OK`**:
```bash
curl -i -s -X GET "http://localhost:8000/sensores/?tipo=temperatura"
```

#### Paso 4 — Actualizar el primer sensor de temperatura (`PUT /sensores/temperatura`)
Modifica el valor, ubicación y fecha del primer sensor de tipo `temperatura` encontrado, esperando **`200 OK`**:
```bash
curl -i -s -X PUT "http://localhost:8000/sensores/temperatura" \
  -H "Content-Type: application/json" \
  -d '{
    "valor": 85.0,
    "ubicacion": "Reactor Químico Planta 1 - Sensor Reemplazado",
    "fecha": "2026-11-20T11:15:00"
  }'
```

#### Paso 5 — Verificar la actualización (`GET /sensores/?tipo=temperatura`)
Vuelve a consultar los sensores de `temperatura` para confirmar que el cambio de `85.0 °C` se persistió en MongoDB:
```bash
curl -i -s -X GET "http://localhost:8000/sensores/?tipo=temperatura"
```

#### Paso 6 — Eliminar el primer sensor de temperatura (`DELETE /sensores/temperatura`)
Elimina el primer documento de tipo `temperatura` y espera **`204 No Content`** (sin cuerpo de respuesta):
```bash
curl -i -s -X DELETE "http://localhost:8000/sensores/temperatura"
```

#### Paso 7 — Consultar el listado final tras la eliminación (`GET /sensores/`)
Verifica que el sensor eliminado ya no aparece en la colección:
```bash
curl -i -s -X GET "http://localhost:8000/sensores/"
```

---

## Sección 2: Pruebas Manuales con Postman Paso a Paso

Si deseas probar la API desde **Postman** y generar las evidencias para tu informe académico, sigue estos pasos:

### 1. Crear una Colección en Postman
1. Abre **Postman** y haz clic en **Collections** (barra lateral izquierda) → botón **`+` (Create new collection)**.
2. Nombra la colección: **`EA2 - API Sensores Industriales`**.
3. En la pestaña **Variables** de la colección, crea una variable llamada `base_url` con el valor inicial y actual `http://localhost:8000`.

### 2. Crear o Importar las Requests
Puedes importar cualquiera de los comandos `curl` anteriores haciendo clic en **Import** (arriba a la izquierda) y pegando el comando `curl`, o crear manualmente estas 5 peticiones dentro de la colección:

1. **`1. Crear Sensor (POST)`**
   - Método: `POST` | URL: `{{base_url}}/sensores/`
   - Pestaña **Body** → selecciona **raw** → formato **JSON**:
     ```json
     {
       "tipo": "presion",
       "valor": 250.5,
       "ubicacion": "Tubería Principal Vapor",
       "fecha": "2026-11-20T14:00:00"
     }
     ```
2. **`2. Listar Todos (GET)`**
   - Método: `GET` | URL: `{{base_url}}/sensores/`
3. **`3. Filtrar por Tipo (GET)`**
   - Método: `GET` | URL: `{{base_url}}/sensores/?tipo=presion`
4. **`4. Actualizar Sensor (PUT)`**
   - Método: `PUT` | URL: `{{base_url}}/sensores/presion`
   - Pestaña **Body** → **raw** → **JSON**:
     ```json
     {
       "valor": 310.0,
       "ubicacion": "Tubería Principal Vapor - Ajustada",
       "fecha": "2026-11-20T15:00:00"
     }
     ```
5. **`5. Eliminar Sensor (DELETE)`**
   - Método: `DELETE` | URL: `{{base_url}}/sensores/presion`

### 3. Capturas Recomendadas a Tomar en Postman y MongoDB Compass
Para documentar la entrega universitaria, toma las siguientes capturas de pantalla:
1. **Captura 1 (`POST 201 Created`)**: Petición `POST /sensores/` en Postman mostrando el estado verde `201 Created` y el campo `"id"` generado.
2. **Captura 2 (MongoDB Compass)**: Vista de la colección `monitoreo_industrial.sensores` en MongoDB Compass mostrando los documentos almacenados con su `_id`.
3. **Captura 3 (`GET 200 OK` y filtro)**: Petición `GET /sensores/?tipo=temperatura` mostrando solo los sensores filtrados.
4. **Captura 4 (`PUT 200 OK`)**: Petición `PUT /sensores/temperatura` mostrando los campos actualizados en la respuesta.
5. **Captura 5 (`DELETE 204 No Content`)**: Petición `DELETE /sensores/temperatura` mostrando el código `204 No Content`.
6. **Captura 6 (`422 Unprocessable Entity` y `404 Not Found`)**: Peticiones con datos fuera de rango y eliminación de tipo inexistente.

---

## Sección 3: Pruebas Automáticas con Pytest (`pytest tests/ -v`)

La suite [`tests/test_api.py`](../tests/test_api.py) contiene **9 pruebas automatizadas** construidas con `pytest` y `fastapi.testclient.TestClient` (impulsado por `httpx`). No necesitas levantar `uvicorn` manualmente para correrlas, ya que `TestClient` ejecuta la aplicación ASGI en memoria contra la base de datos local.

### Comando de ejecución
```bash
pytest tests/ -v
```

### Explicación de cada uno de los 9 tests
1. **`test_crear_sensor_valido`**: Envía un `POST /sensores/` con un sensor de `temperatura` válido (`42.5 °C`). Verifica que el código sea `201`, que retorne un `id` de 24 caracteres hexadecimales y que los campos coincidan.
2. **`test_crear_sensor_tipo_invalido`**: Envía un `POST /sensores/` con `tipo="humedad"`. Verifica que Pydantic lo rechace con código **`422`** y devuelva la clave `"error"`.
3. **`test_crear_sensor_fuera_de_rango`**: Envía un `POST /sensores/` con `tipo="presion"` y `valor=999.0` (superando el máximo de `500 kPa`). Verifica que el `@field_validator("valor")` responda **`422`**.
4. **`test_listar_sensores`**: Ejecuta `GET /sensores/` sobre el fixture inicial de 3 sensores y verifica que devuelva código `200` y una lista de longitud 3.
5. **`test_filtrar_por_tipo`**: Ejecuta `GET /sensores/?tipo=vibracion` y comprueba que responda `200` devolviendo únicamente el sensor de vibración (`valor == 1.8`).
6. **`test_actualizar_sensor_existente`**: Ejecuta `PUT /sensores/temperatura` con nuevos datos válidos (`78.9 °C`) y verifica que retorne `200` con el documento actualizado.
7. **`test_actualizar_sensor_inexistente`**: Ejecuta `PUT /sensores/tipo_inexistente` y comprueba que retorne **`404 Not Found`**.
8. **`test_eliminar_sensor_existente`**: Ejecuta `DELETE /sensores/presion`, verifica que devuelva **`204 No Content`** sin cuerpo (`b""`) y confirma con un `GET` posterior que ya no quedan sensores de presión.
9. **`test_eliminar_sensor_inexistente`**: Ejecuta `DELETE /sensores/tipo_inexistente` y verifica que retorne **`404 Not Found`**.

---

## Sección 4: Casos de Error a Probar Manualmente

A continuación tienes los comandos `curl` exactos para probar manualmente las validaciones y el manejo de errores:

### Caso A — Error `422` por tipo de sensor inválido (`"humedad"`)
```bash
curl -i -X POST "http://localhost:8000/sensores/" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "humedad",
    "valor": 50.0,
    "ubicacion": "Almacén Central",
    "fecha": "2026-11-20T12:00:00"
  }'
```
**Respuesta esperada (`HTTP/1.1 422 Unprocessable Entity`):**
```json
{
  "error": "Datos de entrada inválidos",
  "detalle": "Uno o más campos no cumplen con las reglas de validación.",
  "errores": [
    {
      "campo": "body -> tipo",
      "mensaje": "Input should be 'temperatura', 'presion' or 'vibracion'",
      "tipo_error": "literal_error"
    }
  ]
}
```

### Caso B — Error `422` por valor fuera de rango (`presion = 999`, máximo `500`)
```bash
curl -i -X POST "http://localhost:8000/sensores/" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "presion",
    "valor": 999.0,
    "ubicacion": "Compresor Alta Presión",
    "fecha": "2026-11-20T12:05:00"
  }'
```
**Respuesta esperada (`HTTP/1.1 422 Unprocessable Entity`):**
```json
{
  "error": "Datos de entrada inválidos",
  "detalle": "Uno o más campos no cumplen con las reglas de validación.",
  "errores": [
    {
      "campo": "body -> valor",
      "mensaje": "Value error, El valor para 'presion' debe estar entre 0.0 y 500.0 kPa (recibido: 999.0).",
      "tipo_error": "value_error"
    }
  ]
}
```

### Caso C — Error `404` al eliminar un tipo inexistente
```bash
curl -i -X DELETE "http://localhost:8000/sensores/tipo_inexistente"
```
**Respuesta esperada (`HTTP/1.1 404 Not Found`):**
```json
{
  "error": "Error en la solicitud",
  "detalle": "No se encontró ningún sensor del tipo 'tipo_inexistente' para eliminar."
}
```
