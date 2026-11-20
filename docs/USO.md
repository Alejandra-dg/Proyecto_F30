# 🚀 Manual de Uso de la API (`USO.md`)

Esta guía explica cómo iniciar el servidor de desarrollo, precargar datos de prueba en MongoDB, explorar la documentación interactiva (Swagger UI y ReDoc), cambiar de puerto y apagar la aplicación de forma segura.

---

## 1. Requisitos Previos Antes de Arrancar

Antes de iniciar la API, asegúrate de que:
1. El servicio de **MongoDB** esté activo en `mongodb://localhost:27017`:
   - Windows: `net start MongoDB`
   - macOS: `brew services start mongodb-community`
   - Linux: `sudo systemctl start mongod`
2. El entorno virtual `venv` esté activado:
   - Windows (PowerShell): `.\venv\Scripts\Activate.ps1`
   - macOS / Linux: `source venv/bin/activate`

---

## 2. Cómo Cargar los Datos Iniciales (Seed)

El proyecto incluye el script [`scripts/seed_data.py`](../scripts/seed_data.py), el cual limpia los registros anteriores e inserta **3 sensores industriales realistas** (uno de `temperatura`, uno de `presion` y uno de `vibracion`) en `monitoreo_industrial.sensores`.

Ejecuta desde la raíz del proyecto:

```bash
python scripts/seed_data.py
```

**Salida esperada en consola:**
```text
[INFO] Documentos previos eliminados: 0
[OK] Se insertaron 3 sensores de ejemplo exitosamente:
  - ID: 6b009dd354e6f00b8df040c9 | Tipo: temperatura | Valor: 68.5   | Ubicación: Caldera de Vapor Principal - Nave A
  - ID: 6b009dd354e6f00b8df040ca | Tipo: presion     | Valor: 315.4  | Ubicación: Compresor Neumático Línea 2 - Nave B
  - ID: 6b009dd354e6f00b8df040cb | Tipo: vibracion   | Valor: 2.35   | Ubicación: Turbina de Generación Eléctrica - Sector C
```

---

## 3. Cómo Arrancar el Servidor FastAPI con Uvicorn

Para iniciar la API en modo de desarrollo con recarga automática ante cambios en el código (`--reload`), ejecuta:

```bash
uvicorn app.main:app --reload
```

*(En Windows sin activar el venv también puedes ejecutar directamente: `.\venv\Scripts\uvicorn.exe app.main:app --reload`)*.

**Salida esperada:**
```text
INFO:     Will watch for changes in these directories: ['.../ea2_api_sensores']
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [12345] using WatchFiles
INFO:     Started server process [12348]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

---

## 4. Cómo Abrir Swagger UI (`http://localhost:8000/docs`)

FastAPI genera automáticamente una interfaz interactiva basada en **OpenAPI 3.1 (Swagger UI)** desde donde puedes probar los 4 endpoints directamente desde el navegador sin instalar herramientas externas:

1. Con el servidor corriendo, abre tu navegador web en:
   👉 **[http://localhost:8000/docs](http://localhost:8000/docs)**
2. Verás el título **"EA2 API Sensores"** y la sección **Sensores** con las 4 rutas:
   - `POST /sensores/` — Crear un nuevo sensor industrial
   - `GET /sensores/` — Listar sensores o filtrar por tipo
   - `PUT /sensores/{tipo}` — Actualizar el primer sensor de un tipo específico
   - `DELETE /sensores/{tipo}` — Eliminar el primer sensor de un tipo específico
3. Para ejecutar una petición desde Swagger UI:
   - Haz clic sobre el endpoint deseado.
   - Presiona el botón **"Try it out"**.
   - Modifica los parámetros o el cuerpo JSON de ejemplo.
   - Haz clic en **"Execute"** y revisa el código de estado HTTP y el JSON de respuesta.

---

## 5. Cómo Abrir ReDoc (`http://localhost:8000/redoc`)

Además de Swagger UI, FastAPI ofrece **ReDoc**, una vista de documentación limpia y orientada a lectura técnica de esquemas (`SensorCreate`, `SensorUpdate`, `SensorOut`, `HTTPValidationError`):

1. Con el servidor activo, abre tu navegador en:
   👉 **[http://localhost:8000/redoc](http://localhost:8000/redoc)**
2. En el panel izquierdo podrás navegar por cada endpoint y desplegar las reglas de validación de los modelos Pydantic (rangos, longitudes de cadena `1..100` y valores permitidos del `Literal["temperatura", "presion", "vibracion"]`).

---

## 6. Cómo Cambiar el Puerto si el `8000` está Ocupado

Si el puerto `8000` está siendo utilizado por otra aplicación en tu sistema, puedes especificar cualquier otro puerto libre (por ejemplo, `8001` o `8080`) con la bandera `--port`:

```bash
uvicorn app.main:app --reload --port 8001
```

En ese caso, la documentación estará disponible en `http://localhost:8001/docs` y `http://localhost:8001/redoc`.

Si además deseas elegir explícitamente la interfaz de red local:

```bash
uvicorn app.main:app --host 127.0.0.1 --port 8080 --reload
```

---

## 7. Cómo Apagar el Servidor Correctamente

1. Ve a la ventana de terminal donde se está ejecutando `uvicorn`.
2. Presiona la combinación de teclas **`Ctrl + C`**.
3. Uvicorn cerrará ordenadamente los workers y las conexiones activas:
   ```text
   INFO:     Shutting down
   INFO:     Waiting for application shutdown.
   INFO:     Application shutdown complete.
   INFO:     Finished server process [12348]
   INFO:     Stopping reloader process [12345]
   ```
4. Cuando termines de trabajar en el proyecto, puedes desactivar el entorno virtual ejecutando:
   ```bash
   deactivate
   ```
