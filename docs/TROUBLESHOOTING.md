# 🔧 Guía de Solución de Problemas (`TROUBLESHOOTING.md`)

Este documento reúne los **8 errores más frecuentes** al instalar, configurar o probar la API de sensores industriales, siguiendo un formato uniforme: **Síntoma → Causa probable → Solución**.

---

## 1. `ConnectionFailure` / `ECONNREFUSED` en `localhost:27017`

- **Síntoma**:
  Al ejecutar `python scripts/seed_data.py` o hacer una petición a la API, aparece un error `pymongo.errors.ServerSelectionTimeoutError: localhost:27017: [Errno 111] Connection refused` (o `[WinError 10061]` en Windows), o la API responde con código **`500 Internal Server Error`** (`"Error interno de base de datos"`).
- **Causa probable**:
  El servicio del servidor **MongoDB Community (`mongod`)** está detenido o no se ha iniciado en el sistema operativo.
- **Solución**:
  Inicia el servicio de MongoDB según tu sistema operativo y verifica con un `ping`:
  - **Windows (PowerShell como Administrador)**:
    ```powershell
    net start MongoDB
    ```
  - **macOS**:
    ```bash
    brew services start mongodb-community
    ```
  - **Linux (Ubuntu/Debian)**:
    ```bash
    sudo systemctl start mongod
    ```

---

## 2. `ModuleNotFoundError: No module named 'fastapi'` (o `'pymongo'`)

- **Síntoma**:
  Al intentar arrancar el servidor o correr un script, Python arroja:
  `ModuleNotFoundError: No module named 'fastapi'` o `ModuleNotFoundError: No module named 'pymongo'`.
- **Causa probable**:
  El entorno virtual (`venv`) **no está activado** en la terminal actual, o no se ejecutó `pip install -r requirements.txt` dentro de dicho entorno.
- **Solución**:
  Activa primero el entorno virtual y reinstala las dependencias:
  - **Windows (PowerShell)**:
    ```powershell
    .\venv\Scripts\Activate.ps1
    pip install -r requirements.txt
    ```
  - **macOS / Linux**:
    ```bash
    source venv/bin/activate
    pip install -r requirements.txt
    ```

---

## 3. `TypeError: Object of type ObjectId is not JSON serializable`

- **Síntoma**:
  Al devolver un documento recién insertado o consultado de MongoDB desde un endpoint de FastAPI, ocurre una excepción `TypeError: Object of type ObjectId is not JSON serializable`.
- **Causa probable**:
  PyMongo almacena el identificador primario en el campo `_id` como una instancia de `bson.ObjectId`, la cual no es un tipo primitivo nativo de JSON (`str`, `int`, `float`, `bool`, `list`, `dict`).
- **Solución**:
  Pasar siempre el documento crudo de MongoDB por la función `serialize(doc)` definida en [`app/main.py`](../app/main.py), que convierte explícitamente `str(doc["_id"])` al campo `"id"` antes de retornar la respuesta:
  ```python
  def serialize(doc: dict[str, Any]) -> dict[str, Any]:
      return {
          "id": str(doc["_id"]),
          "tipo": doc["tipo"],
          "valor": float(doc["valor"]),
          "ubicacion": str(doc["ubicacion"]),
          "fecha": str(doc["fecha"]),
      }
  ```

---

## 4. `ERROR: [Errno 98] Address already in use` (Puerto `8000` ocupado)

- **Síntoma**:
  Al ejecutar `uvicorn app.main:app --reload`, el servidor falla inmediatamente con:
  `ERROR: [Errno 98] Address already in use` (Linux/macOS) o `ERROR: [Errno 10048] only one usage of each socket address is normally permitted` (Windows).
- **Causa probable**:
  Otra instancia de `uvicorn` (u otro servicio local) ya está escuchando en el puerto `8000`.
- **Solución**:
  1. Cierra la otra terminal donde `uvicorn` quedó corriendo con `Ctrl + C`.
  2. O arranca el servidor en un puerto alternativo con `--port`:
     ```bash
     uvicorn app.main:app --reload --port 8001
     ```
  3. Para liberar el puerto `8000` manualmente:
     - **Windows (PowerShell)**:
       ```powershell
       netstat -ano | findstr :8000
       taskkill /PID <NUMERO_PID> /F
       ```
     - **macOS / Linux**:
       ```bash
       lsof -i :8000
       kill -9 <NUMERO_PID>
       ```

---

## 5. `422 Unprocessable Entity` al hacer `POST /sensores/`

- **Síntoma**:
  Al enviar una petición `POST /sensores/` o `PUT /sensores/{tipo}`, la API rechaza la operación con estado **`422 Unprocessable Entity`** y el mensaje `"Datos de entrada inválidos"`.
- **Causa probable**:
  Alguno de los campos enviados en el JSON incumple las reglas del modelo Pydantic en [`app/models.py`](../app/models.py):
  - `tipo` no es `"temperatura"`, `"presion"` ni `"vibracion"`.
  - `valor` está fuera del rango permitido (`temperatura`: `-10..100`, `presion`: `0..500`, `vibracion`: `0..5`).
  - `ubicacion` está vacía (`""`) o tiene más de 100 caracteres.
  - Falta la cabecera `Content-Type: application/json` en `curl` o el JSON tiene errores de sintaxis.
- **Solución**:
  Revisa el arreglo `"errores"` devuelto en la respuesta `422` para identificar el campo exacto (`"campo": "body -> valor"`) y ajusta el payload JSON dentro de los rangos válidos:
  ```json
  {
    "tipo": "temperatura",
    "valor": 25.0,
    "ubicacion": "Planta Principal",
    "fecha": "2026-11-20T10:00:00"
  }
  ```

---

## 6. `404 Not Found` al hacer `DELETE /sensores/{tipo}` o `PUT /sensores/{tipo}`

- **Síntoma**:
  Al ejecutar `PUT /sensores/temperatura` o `DELETE /sensores/temperatura`, la API responde con código **`404 Not Found`** y `"No se encontró ningún sensor del tipo '...' para actualizar/eliminar"`.
- **Causa probable**:
  1. El nombre del tipo en la URL está mal escrito (por ejemplo, `/sensores/temperaturas` en plural o `/sensores/presión` con tilde).
  2. La colección `sensores` está vacía o ya se eliminaron todos los sensores de ese tipo en pruebas anteriores.
- **Solución**:
  1. Verifica con `GET /sensores/` qué documentos existen actualmente en la base de datos.
  2. Si la colección se quedó sin documentos, vuelve a ejecutar el script de carga inicial:
     ```bash
     python scripts/seed_data.py
     ```
  3. Asegúrate de usar los nombres exactos sin tildes y en singular: `temperatura`, `presion` o `vibracion`.

---

## 7. Fecha en formato inválido (`422` en el campo `fecha`)

- **Síntoma**:
  Al enviar una petición `POST` o `PUT`, la API devuelve `422 Unprocessable Entity` indicando un error en `body -> fecha` (`Input should be a valid datetime`).
- **Causa probable**:
  Se envió la fecha en un formato regional no estándar (como `"20/11/2026 14:30"` o `"Nov 20, 2026"`) en lugar del estándar **ISO 8601** requerido.
- **Solución**:
  Formatea siempre el campo `fecha` siguiendo el patrón **`YYYY-MM-DDTHH:MM:SS`** (año de 4 dígitos, mes, día, letra `T` mayúscula y hora en formato 24h):
  ```json
  "fecha": "2026-11-20T14:30:00"
  ```

---

## 8. `mongosh: command not found` (o no se reconoce en PowerShell)

- **Síntoma**:
  El servidor MongoDB está instalado y corriendo, pero al escribir `mongosh` en la terminal aparece:
  `mongosh: command not found` (Linux/macOS) o `El término 'mongosh' no se reconoce como nombre de un cmdlet...` (Windows).
- **Causa probable**:
  Desde MongoDB 6.0+, el ejecutable `mongosh` (MongoDB Shell) ya no viene empaquetado dentro del instalador del servidor `mongod` o su carpeta `bin` no está agregada a la variable de entorno `PATH`.
- **Solución**:
  1. Instala `mongosh` por separado:
     - **Windows**: `winget install -e --id MongoDB.Shell`
     - **macOS**: `brew install mongosh`
     - **Linux**: `sudo apt-get install -y mongodb-mongosh`
  2. O bien, si no necesitas la consola interactiva `mongosh`, puedes verificar e interactuar con MongoDB directamente desde el entorno virtual de Python incluido en este proyecto:
     ```bash
     python -c "from app.database import obtener_cliente; print(obtener_cliente().admin.command('ping'))"
     ```
