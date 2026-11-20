# ✅ Reporte Final de Validación (`REPORTE_VALIDACION.md`)

Este reporte documenta la ejecución real y verificación completa de la **FASE 4 — VALIDACIÓN** para el proyecto académico **EA2: API CRUD con MongoDB**.

---

## 1. Comandos Ejecutados y su Output Real

### 1.1. Verificación del Servidor MongoDB y Carga de Datos Iniciales (`seed_data.py`)

**Comando ejecutado:**
```bash
python scripts/seed_data.py
```

**Output obtenido:**
```text
[INFO] Documentos previos eliminados: 3
[OK] Se insertaron 3 sensores de ejemplo exitosamente:
  - ID: 6b00a1fb6167c83d551f8159 | Tipo: temperatura | Valor: 68.5   | Ubicación: Caldera de Vapor Principal - Nave A
  - ID: 6b00a1fb6167c83d551f815a | Tipo: presion     | Valor: 315.4  | Ubicación: Compresor Neumático Línea 2 - Nave B
  - ID: 6b00a1fb6167c83d551f815b | Tipo: vibracion   | Valor: 2.35   | Ubicación: Turbina de Generación Eléctrica - Sector C
```

---

### 1.2. Arranque del Servidor Uvicorn y Verificación de Swagger UI (`/docs`)

**Comando ejecutado:**
```bash
uvicorn app.main:app --reload
```

**Verificación HTTP de `http://localhost:8000/docs`:**
```http
HTTP/1.1 200 OK
date: Fri, 20 Nov 2026 19:35:27 GMT
server: uvicorn
content-length: 940
content-type: text/html; charset=utf-8

<!DOCTYPE html>
<html>
<head>
<link type="text/css" rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css">
<link rel="shortcut icon" href="https://fastapi.tiangolo.com/img/favicon.png">
<title>EA2 API Sensores - Swagger UI</title>
</head>
```

---

### 1.3. Secuencia Completa de Pruebas con `curl` (`bash scripts/pruebas_curl.sh`)

**Comando ejecutado:**
```bash
bash scripts/pruebas_curl.sh
```

**Output completo capturado:**
```text
==================================================================
 INICIANDO SECUENCIA DE PRUEBAS CURL - EA2 API SENSORES
==================================================================

[1/7] POST /sensores/ -> Creando un nuevo sensor de temperatura...
HTTP/1.1 201 Created
date: Fri, 20 Nov 2026 19:39:45 GMT
server: uvicorn
content-length: 136
content-type: application/json

{"tipo":"temperatura","valor":72.4,"ubicacion":"Reactor Quimico Planta 1","fecha":"2026-11-20T10:30:00","id":"6b00a202bf925d452d2a3be7"}


[2/7] GET /sensores/ -> Consultando todos los sensores registrados...
HTTP/1.1 200 OK
date: Fri, 20 Nov 2026 19:39:45 GMT
server: uvicorn
content-length: 589
content-type: application/json

[{"tipo":"temperatura","valor":68.5,"ubicacion":"Caldera de Vapor Principal - Nave A","fecha":"2026-11-20T08:00:00","id":"6b00a1fb6167c83d551f8159"},{"tipo":"presion","valor":315.4,"ubicacion":"Compresor Neumático Línea 2 - Nave B","fecha":"2026-11-20T08:05:00","id":"6b00a1fb6167c83d551f815a"},{"tipo":"vibracion","valor":2.35,"ubicacion":"Turbina de Generación Eléctrica - Sector C","fecha":"2026-11-20T08:10:00","id":"6b00a1fb6167c83d551f815b"},{"tipo":"temperatura","valor":72.4,"ubicacion":"Reactor Quimico Planta 1","fecha":"2026-11-20T10:30:00","id":"6b00a202bf925d452d2a3be7"}]


[3/7] GET /sensores/?tipo=temperatura -> Filtrando sensores por tipo 'temperatura'...
HTTP/1.1 200 OK
date: Fri, 20 Nov 2026 19:39:46 GMT
server: uvicorn
content-length: 286
content-type: application/json

[{"tipo":"temperatura","valor":68.5,"ubicacion":"Caldera de Vapor Principal - Nave A","fecha":"2026-11-20T08:00:00","id":"6b00a1fb6167c83d551f8159"},{"tipo":"temperatura","valor":72.4,"ubicacion":"Reactor Quimico Planta 1","fecha":"2026-11-20T10:30:00","id":"6b00a202bf925d452d2a3be7"}]


[4/7] PUT /sensores/temperatura -> Actualizando el primer sensor de tipo 'temperatura'...
HTTP/1.1 200 OK
date: Fri, 20 Nov 2026 19:39:46 GMT
server: uvicorn
content-length: 157
content-type: application/json

{"tipo":"temperatura","valor":85.0,"ubicacion":"Reactor Quimico Planta 1 - Sensor Reemplazado","fecha":"2026-11-20T11:15:00","id":"6b00a1fb6167c83d551f8159"}


[5/7] GET /sensores/?tipo=temperatura -> Verificando actualizacion del sensor...
HTTP/1.1 200 OK
date: Fri, 20 Nov 2026 19:39:46 GMT
server: uvicorn
content-length: 296
content-type: application/json

[{"tipo":"temperatura","valor":85.0,"ubicacion":"Reactor Quimico Planta 1 - Sensor Reemplazado","fecha":"2026-11-20T11:15:00","id":"6b00a1fb6167c83d551f8159"},{"tipo":"temperatura","valor":72.4,"ubicacion":"Reactor Quimico Planta 1","fecha":"2026-11-20T10:30:00","id":"6b00a202bf925d452d2a3be7"}]


[6/7] DELETE /sensores/temperatura -> Eliminando el primer sensor de tipo 'temperatura'...
HTTP/1.1 204 No Content
date: Fri, 20 Nov 2026 19:39:47 GMT
server: uvicorn


[7/7] GET /sensores/ -> Listando sensores restantes tras la eliminacion...
HTTP/1.1 200 OK
date: Fri, 20 Nov 2026 19:39:47 GMT
server: uvicorn
content-length: 441
content-type: application/json

[{"tipo":"presion","valor":315.4,"ubicacion":"Compresor Neumático Línea 2 - Nave B","fecha":"2026-11-20T08:05:00","id":"6b00a1fb6167c83d551f815a"},{"tipo":"vibracion","valor":2.35,"ubicacion":"Turbina de Generación Eléctrica - Sector C","fecha":"2026-11-20T08:10:00","id":"6b00a1fb6167c83d551f815b"},{"tipo":"temperatura","valor":72.4,"ubicacion":"Reactor Quimico Planta 1","fecha":"2026-11-20T10:30:00","id":"6b00a202bf925d452d2a3be7"}]

==================================================================
 SECUENCIA DE PRUEBAS FINALIZADA
==================================================================
```

---

### 1.4. Ejecución de Pruebas Automatizadas con Pytest (`pytest tests/ -v`)

**Comando ejecutado:**
```bash
pytest tests/ -v
```

**Output obtenido:**
```text
============================= test session starts =============================
platform win32 -- Python 3.13.15, pytest-8.3.3, pluggy-1.7.0
cachedir: .pytest_cache
rootdir: C:\Users\aleja\Documents\Tecnologias web\PROYECTO_F30
plugins: anyio-4.16.0
collecting ... collected 9 items

tests/test_api.py::test_crear_sensor_valido PASSED                       [ 11%]
tests/test_api.py::test_crear_sensor_tipo_invalido PASSED                [ 22%]
tests/test_api.py::test_crear_sensor_fuera_de_rango PASSED               [ 33%]
tests/test_api.py::test_listar_sensores PASSED                           [ 44%]
tests/test_api.py::test_filtrar_por_tipo PASSED                          [ 55%]
tests/test_api.py::test_actualizar_sensor_existente PASSED               [ 66%]
tests/test_api.py::test_actualizar_sensor_inexistente PASSED             [ 77%]
tests/test_api.py::test_eliminar_sensor_existente PASSED                 [ 88%]
tests/test_api.py::test_eliminar_sensor_inexistente PASSED               [100%]

======================== 9 passed, 1 warning in 1.27s =========================
```

---

## 2. Guía de Capturas que el Estudiante Debería Tomar para su Entrega

Para acompañar el informe de la actividad **EA2**, se recomienda incluir las siguientes **8 capturas de pantalla**:

1. **Captura 1 — Conexión en MongoDB Compass**:
   - Mostrar la ventana de **MongoDB Compass** conectada a `mongodb://localhost:27017`, evidenciando en el panel izquierdo la base de datos `monitoreo_industrial`, la colección `sensores` y los 3 documentos iniciales insertados por `seed_data.py`.
2. **Captura 2 — Arranque del Servidor con Uvicorn**:
   - Mostrar la terminal ejecutando `uvicorn app.main:app --reload` con el mensaje `Uvicorn running on http://127.0.0.1:8000` y `Application startup complete`.
3. **Captura 3 — Documentación Interactiva Swagger UI (`/docs`)**:
   - Mostrar el navegador en `http://localhost:8000/docs` donde se vean claramente el título **"EA2 API Sensores"** y los 4 endpoints (`POST`, `GET`, `PUT`, `DELETE`).
4. **Captura 4 — Creación de un Sensor (`POST /sensores/` → `201 Created`)**:
   - Mostrar en Swagger UI o Postman el envío de un JSON válido y la respuesta con código `201 Created` y el campo `"id"` autogenerado.
5. **Captura 5 — Consulta y Filtrado (`GET /sensores/?tipo=temperatura` → `200 OK`)**:
   - Mostrar la respuesta JSON filtrando únicamente los sensores del tipo solicitado.
6. **Captura 6 — Actualización (`PUT /sensores/temperatura` → `200 OK`) y Eliminación (`DELETE /sensores/temperatura` → `204 No Content`)**:
   - Mostrar la modificación exitosa del primer sensor de ese tipo y su posterior eliminación.
7. **Captura 7 — Validaciones de Error (`422 Unprocessable Entity` y `404 Not Found`)**:
   - Mostrar la respuesta `422` cuando se envía `tipo: "humedad"` o `presion` con `valor: 999`, y la respuesta `404` al intentar eliminar un `tipo_inexistente`.
8. **Captura 8 — Suite de Pruebas Pytest en Verde**:
   - Mostrar la terminal tras ejecutar `pytest tests/ -v` con el resultado `9 passed` al `100%`.

---

## 3. Confirmación del Checklist de Criterios de Aceptación Final

| # | Criterio de Aceptación | Estado | Evidencia / Verificación |
|---|---|---|---|
| 1 | Todos los archivos requeridos existen en las rutas correctas | ✅ **CUMPLIDO** | Verificados los módulos de `app/`, `tests/`, `scripts/`, `docs/`, `requirements.txt`, `.gitignore` y `README.md`. |
| 2 | `pip install -r requirements.txt` instala sin errores | ✅ **CUMPLIDO** | Instalados `fastapi==0.115.0`, `uvicorn==0.32.0`, `pymongo==4.10.1`, `pydantic==2.9.2`, `python-dateutil==2.9.0`, `httpx==0.27.2`, `pytest==8.3.3`. |
| 3 | `uvicorn app.main:app --reload` arranca sin warnings | ✅ **CUMPLIDO** | Servidor iniciado limpiamente en `http://127.0.0.1:8000`. |
| 4 | Swagger UI carga en `http://localhost:8000/docs` con los 4 endpoints visibles | ✅ **CUMPLIDO** | Respuesta `HTTP/1.1 200 OK` en `/docs` con título `EA2 API Sensores - Swagger UI`. |
| 5 | Los 4 endpoints responden con los códigos HTTP correctos (`201`, `200`, `200`, `204`) | ✅ **CUMPLIDO** | Comprobado tanto con `scripts/pruebas_curl.sh` como con `pytest`. |
| 6 | La validación rechaza `tipo="humedad"` con `422` | ✅ **CUMPLIDO** | Verificado en `test_crear_sensor_tipo_invalido` (`PASSED`). |
| 7 | La validación rechaza `valor=999` para `presion` con `422` (máximo 500) | ✅ **CUMPLIDO** | Verificado en `test_crear_sensor_fuera_de_rango` (`PASSED`). |
| 8 | `DELETE /sensores/tipo_inexistente` responde `404` | ✅ **CUMPLIDO** | Verificado en `test_eliminar_sensor_inexistente` (`PASSED`). |
| 9 | `pytest tests/ -v` muestra todos los tests en verde (mínimo 8) | ✅ **CUMPLIDO** | **9 tests ejecutados y 9 aprobados (`9 passed`)**. |
| 10 | Los 7 archivos `.md` tienen contenido completo (no placeholders) | ✅ **CUMPLIDO** | Redactados los 7 archivos en `docs/` + `README.md` raíz + `docs/REPORTE_VALIDACION.md`. |
| 11 | El código está comentado en español | ✅ **CUMPLIDO** | Todos los módulos cuentan con docstrings Google, comentarios y variables en español. |
| 12 | No quedan `TODO`, `FIXME` ni `pass` vacíos | ✅ **CUMPLIDO** | Inspección estática realizada: 0 ocurrencias. |
| 13 | El proyecto comprimido en `.zip` NO incluye `venv/` ni `__pycache__/` | ✅ **CUMPLIDO** | Generado `ea2_api_sensores.zip` verificando la ausencia total de `venv/`, `__pycache__/` y `.pytest_cache/`. |
