# 📡 Referencia de Endpoints de la API (`ENDPOINTS.md`)

La API gestiona documentos de sensores industriales en la colección `sensores` de la base de datos `monitoreo_industrial`. Todos los cuerpos de petición y respuesta utilizan formato `application/json` y fechas en estándar **ISO 8601** (`YYYY-MM-DDTHH:MM:SS`).

---

## 📋 Tabla Resumen de Endpoints

| # | Método HTTP | Ruta | Descripción | Código de Éxito | Códigos de Error Posibles |
|---|---|---|---|---|---|
| 1 | `POST` | `/sensores/` | Crea y almacena una nueva lectura de sensor industrial. | `201 Created` | `422 Unprocessable Entity`, `500 Internal Server Error` |
| 2 | `GET` | `/sensores/` | Lista todos los sensores o filtra por `?tipo={tipo}`. | `200 OK` | `422 Unprocessable Entity`, `500 Internal Server Error` |
| 3 | `PUT` | `/sensores/{tipo}` | Actualiza el primer sensor registrado que coincida con `{tipo}`. | `200 OK` | `404 Not Found`, `422 Unprocessable Entity`, `500 Internal Server Error` |
| 4 | `DELETE` | `/sensores/{tipo}` | Elimina el primer sensor registrado que coincida con `{tipo}`. | `204 No Content` | `404 Not Found`, `500 Internal Server Error` |

---

## 📏 Reglas de Validación del Modelo

| Campo | Tipo | Obligatorio | Regla de Validación |
|---|---|---|---|
| `tipo` | `string` | Sí (`POST`) | Uno de: `"temperatura"`, `"presion"`, `"vibracion"`. |
| `valor` | `float` | Sí | Rango según tipo:<br>• `temperatura`: **`-10` a `100`** (°C)<br>• `presion`: **`0` a `500`** (kPa)<br>• `vibracion`: **`0` a `5`** (mm/s) |
| `ubicacion` | `string` | Sí | Entre **1 y 100 caracteres** (no vacío ni solo espacios). |
| `fecha` | `datetime` | Sí | Formato **ISO 8601** (`YYYY-MM-DDTHH:MM:SS`). |

---

## 1. Crear Sensor — `POST /sensores/`

- **Método**: `POST`
- **Ruta**: `/sensores/`
- **Descripción**: Valida los datos del sensor mediante `SensorCreate` (Pydantic v2), inserta el documento en MongoDB y retorna el objeto creado con su `id` (el `_id` de MongoDB serializado a texto) y código HTTP `201 Created`.

### Request Body de Ejemplo
```json
{
  "tipo": "temperatura",
  "valor": 45.8,
  "ubicacion": "Horno Industrial Sector A",
  "fecha": "2026-11-20T08:30:00"
}
```

### Response de Ejemplo (`201 Created`)
```json
{
  "tipo": "temperatura",
  "valor": 45.8,
  "ubicacion": "Horno Industrial Sector A",
  "fecha": "2026-11-20T08:30:00",
  "id": "6b009dd354e6f00b8df040c9"
}
```

### Posibles Códigos de Error
- **`422 Unprocessable Entity`**:
  - Cuando `tipo` no es `"temperatura"`, `"presion"` ni `"vibracion"` (por ejemplo, `"humedad"`).
  - Cuando `valor` está fuera del rango permitido para ese `tipo` (por ejemplo, `presion` = `999.0`, máximo `500`).
  - Cuando `ubicacion` está vacía o supera los 100 caracteres.
  - Cuando `fecha` no cumple con un formato de fecha ISO 8601 válido.
- **`500 Internal Server Error`**: Si el servidor MongoDB se encuentra apagado o inaccesible.

### Ejemplo `curl` listo para copiar
```bash
curl -i -X POST "http://localhost:8000/sensores/" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "temperatura",
    "valor": 45.8,
    "ubicacion": "Horno Industrial Sector A",
    "fecha": "2026-11-20T08:30:00"
  }'
```

---

## 2. Listar y Filtrar Sensores — `GET /sensores/` y `GET /sensores/?tipo={tipo}`

- **Método**: `GET`
- **Ruta**: `/sensores/`
- **Query Param Opcional**: `tipo` (`temperatura` | `presion` | `vibracion`)
- **Descripción**: Si se invoca sin parámetros (`GET /sensores/`), devuelve un arreglo con todos los documentos de la colección. Si se incluye el parámetro `tipo` (`GET /sensores/?tipo=temperatura`), filtra y retorna únicamente los sensores de ese tipo.

### Request Body
No aplica (petición `GET` sin cuerpo).

### Response de Ejemplo (`200 OK` — Todos los sensores)
```json
[
  {
    "tipo": "temperatura",
    "valor": 68.5,
    "ubicacion": "Caldera de Vapor Principal - Nave A",
    "fecha": "2026-11-20T08:00:00",
    "id": "6b009dd354e6f00b8df040c9"
  },
  {
    "tipo": "presion",
    "valor": 315.4,
    "ubicacion": "Compresor Neumático Línea 2 - Nave B",
    "fecha": "2026-11-20T08:05:00",
    "id": "6b009dd354e6f00b8df040ca"
  },
  {
    "tipo": "vibracion",
    "valor": 2.35,
    "ubicacion": "Turbina de Generación Eléctrica - Sector C",
    "fecha": "2026-11-20T08:10:00",
    "id": "6b009dd354e6f00b8df040cb"
  }
]
```

### Response de Ejemplo (`200 OK` — Filtrado por `?tipo=presion`)
```json
[
  {
    "tipo": "presion",
    "valor": 315.4,
    "ubicacion": "Compresor Neumático Línea 2 - Nave B",
    "fecha": "2026-11-20T08:05:00",
    "id": "6b009dd354e6f00b8df040ca"
  }
]
```

### Posibles Códigos de Error
- **`422 Unprocessable Entity`**: Si se envía un query param `?tipo=invalido` que no pertenece a los tres tipos permitidos.
- **`500 Internal Server Error`**: Fallo de conexión con MongoDB.

### Ejemplos `curl` listos para copiar
```bash
# Listar todos los sensores
curl -i -X GET "http://localhost:8000/sensores/"

# Filtrar solo los sensores de tipo 'temperatura'
curl -i -X GET "http://localhost:8000/sensores/?tipo=temperatura"
```

---

## 3. Actualizar Sensor por Tipo — `PUT /sensores/{tipo}`

- **Método**: `PUT`
- **Ruta**: `/sensores/{tipo}`
- **Parámetro de Ruta**: `{tipo}` — Tipo del sensor a buscar y actualizar (`temperatura`, `presion` o `vibracion`).
- **Descripción**: Busca el primer sensor de ese `{tipo}` en la colección. Si existe, valida que el nuevo `valor` esté dentro del rango físico correspondiente a `{tipo}`, actualiza `valor`, `ubicacion` y `fecha`, y devuelve el documento actualizado con código `200 OK`.

### Request Body de Ejemplo
```json
{
  "valor": 82.0,
  "ubicacion": "Caldera de Vapor Principal - Sensor Calibrado",
  "fecha": "2026-11-20T11:45:00"
}
```

### Response de Ejemplo (`200 OK`)
```json
{
  "tipo": "temperatura",
  "valor": 82.0,
  "ubicacion": "Caldera de Vapor Principal - Sensor Calibrado",
  "fecha": "2026-11-20T11:45:00",
  "id": "6b009dd354e6f00b8df040c9"
}
```

### Posibles Códigos de Error
- **`404 Not Found`**: Cuando no existe ningún sensor registrado con el `{tipo}` indicado en la ruta (por ejemplo, `/sensores/tipo_inexistente` o si ya fueron eliminados todos los sensores de ese tipo).
  ```json
  {
    "error": "Error en la solicitud",
    "detalle": "No se encontró ningún sensor del tipo 'tipo_inexistente' para actualizar."
  }
  ```
- **`422 Unprocessable Entity`**: Cuando el nuevo `valor` está fuera del rango permitido para `{tipo}`, la `ubicacion` es inválida o la `fecha` no cumple ISO 8601.
- **`500 Internal Server Error`**: Fallo de comunicación con la base de datos.

### Ejemplo `curl` listo para copiar
```bash
curl -i -X PUT "http://localhost:8000/sensores/temperatura" \
  -H "Content-Type: application/json" \
  -d '{
    "valor": 82.0,
    "ubicacion": "Caldera de Vapor Principal - Sensor Calibrado",
    "fecha": "2026-11-20T11:45:00"
  }'
```

---

## 4. Eliminar Sensor por Tipo — `DELETE /sensores/{tipo}`

- **Método**: `DELETE`
- **Ruta**: `/sensores/{tipo}`
- **Parámetro de Ruta**: `{tipo}` — Tipo del sensor cuyo primer registro se desea eliminar.
- **Descripción**: Busca y elimina atómicamente (`find_one_and_delete`) el primer sensor en MongoDB que coincida con `{tipo}`. Si se elimina con éxito, responde `204 No Content` sin cuerpo en la respuesta.

### Request Body
No aplica.

### Response de Ejemplo (`204 No Content`)
*(Respuesta vacía — sin cuerpo HTTP, únicamente cabeceras con `HTTP/1.1 204 No Content`)*.

### Posibles Códigos de Error
- **`404 Not Found`**: Si no existe ningún sensor del `{tipo}` especificado en la colección.
  ```json
  {
    "error": "Error en la solicitud",
    "detalle": "No se encontró ningún sensor del tipo 'tipo_inexistente' para eliminar."
  }
  ```
- **`500 Internal Server Error`**: Si ocurre un error interno en el servidor MongoDB.

### Ejemplo `curl` listo para copiar
```bash
curl -i -X DELETE "http://localhost:8000/sensores/temperatura"
```
