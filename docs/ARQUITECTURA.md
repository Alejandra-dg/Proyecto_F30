# 🏗️ Arquitectura y Diseño del Sistema (`ARQUITECTURA.md`)

Este documento describe la arquitectura en capas de la API de sensores industriales, justifica las decisiones técnicas tomadas para el proyecto académico **EA2** y muestra los diagramas de flujo de peticiones exitosas y fallidas.

---

## 1. Diagrama General de Arquitectura (ASCII)

```text
+-----------------------------------------------------------------------------------+
|                                  CLIENTE HTTP                                     |
|                 (cURL / Postman / Swagger UI / Pytest TestClient)                 |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          | Petición HTTP (JSON)
                                          v
+-----------------------------------------------------------------------------------+
|                        CAPA DE PRESENTACIÓN Y ENRUTAMIENTO                        |
|                              FastAPI (app/main.py)                                |
|    Endpoints: POST /sensores/ | GET /sensores/ | PUT /sensores/{tipo} | DELETE    |
+--------------------+-----------------------------------------+--------------------+
                     |                                         |
                     | Validación de Entrada/Salida            | Captura de Excepciones
                     v                                         v
+----------------------------------------+   +--------------------------------------+
|      CAPA DE DOMINIO Y VALIDACIÓN      |   |   CAPA TRANSVERSAL DE ERRORES        |
|        Pydantic v2 (app/models.py)     |   |     Handlers (app/errors.py)         |
|  - SensorBase / Create / Update / Out  |   |  - RequestValidationError -> HTTP 422|
|  - Literal['temperatura','presion',..] |   |  - HTTPException          -> HTTP 404|
|  - @field_validator('valor') (RANGOS)  |   |  - PyMongoError           -> HTTP 500|
+--------------------+-------------------+   +--------------------------------------+
                     |
                     | Datos validados (dict)
                     v
+-----------------------------------------------------------------------------------+
|                           CAPA DE ACCESO A DATOS (DAL)                            |
|                             PyMongo (app/database.py)                             |
|                MongoClient('mongodb://localhost:27017') + ping()                  |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          | Protocolo Wire de MongoDB (TCP 27017)
                                          v
+-----------------------------------------------------------------------------------+
|                            MOTOR DE BASE DE DATOS NoSQL                           |
|                             MongoDB Community Server                              |
|                Base de datos: monitoreo_industrial | Colección: sensores          |
+-----------------------------------------------------------------------------------+
```

---

## 2. Decisiones de Diseño Justificadas

### 2.1. ¿Por qué FastAPI y no Flask?
1. **Validación nativa declarativa**: FastAPI integra **Pydantic** en el núcleo del enrutador. Cualquier error de tipos, formato de fecha ISO 8601 o rango numérico se intercepta automáticamente antes de entrar a la lógica del endpoint y responde con el estándar HTTP `422 Unprocessable Entity`. En Flask habría que escribir validaciones manuales o integrar librerías externas como Marshmallow.
2. **Documentación interactiva automática**: FastAPI genera sin configuración adicional **Swagger UI** (`/docs`) y **ReDoc** (`/redoc`) bajo el estándar OpenAPI 3.1, lo que facilita las pruebas manuales y la evaluación académica.
3. **Uso moderno de Type Hints**: Aprovecha las anotaciones de tipo de Python 3.10+ para inyección de dependencias, validación de query params (`?tipo=temperatura`) y serialización de respuestas (`response_model=SensorOut`).

### 2.2. ¿Por qué PyMongo síncrono y no Motor (asíncrono)?
1. **Simplicidad y claridad pedagógica**: En un entorno académico centrado en comprender el modelo documental NoSQL y las operaciones CRUD (`insert_one`, `find`, `update_one`, `find_one_and_delete`), **PyMongo síncrono** ofrece trazas de ejecución directas y legibles sin la complejidad adicional de bucles de eventos `asyncio` en cada llamada a base de datos.
2. **Manejo nativo de hilos en FastAPI**: Cuando se definen endpoints con `def` estándar (en lugar de `async def`), FastAPI los ejecuta automáticamente en un `threadpool` externo sin bloquear el bucle de eventos principal. Para la carga de trabajo del proyecto, PyMongo síncrono con su pool de conexiones interno (`MongoClient`) ofrece latencias de pocos milisegundos y máxima estabilidad.
3. **Compatibilidad directa con scripts CLI**: Permite reutilizar exactamente el mismo módulo `app/database.py` tanto en la API web como en scripts síncronos de consola (`scripts/seed_data.py`) y fixtures de `pytest`.

### 2.3. ¿Por qué Pydantic v2?
1. **Núcleo en Rust (`pydantic-core`)**: Pydantic v2 es entre 5x y 50x más rápido que Pydantic v1 al validar y serializar estructuras JSON.
2. **Validadores contextuales con `ValidationInfo`**: El decorador `@field_validator("valor")` de Pydantic v2 recibe el objeto `info: ValidationInfo`, permitiendo inspeccionar `info.data.get("tipo")` de forma limpia y segura para contrastar el valor numérico contra la tabla `RANGOS` correspondiente al tipo de sensor.
3. **Configuración tipada con `ConfigDict`**: Reemplaza las antiguas clases internas `class Config:` por `model_config = ConfigDict(...)`, alineándose con las buenas prácticas actuales del ecosistema Python.

### 2.4. ¿Por qué separar `models.py`, `database.py`, `errors.py` y `main.py`?
Aplicar el **Principio de Responsabilidad Única (SRP)** evita tener un archivo monolítico difícil de mantener y probar:
- **`app/database.py`**: Encapsula la URI, el nombre de la base de datos y la gestión de `MongoClient`. Si mañana cambia el puerto o la URI de MongoDB, solo se modifica este archivo.
- **`app/models.py`**: Concentra las reglas de negocio de los sensores (tipos permitidos, rangos físicos por unidad, longitud de ubicación). Puede probarse de forma aislada sin necesidad de levantar HTTP ni MongoDB.
- **`app/errors.py`**: Centraliza el formato JSON en español para todos los errores (`404`, `422`, `500`), garantizando que ningún stacktrace interno se filtre al cliente.
- **`app/main.py`**: Queda limpio y enfocado exclusivamente en coordinar las rutas HTTP (`POST`, `GET`, `PUT`, `DELETE`) y serializar documentos (`_id` → `id`).

---

## 3. Diagrama de Flujo de un `POST /sensores/` Exitoso (`201 Created`)

```text
[Cliente]
   |
   | 1. POST /sensores/
   |    Body: {"tipo": "temperatura", "valor": 45.8, "ubicacion": "Horno A", "fecha": "2026-11-20T08:30:00"}
   v
[FastAPI Router (app/main.py)]
   |
   | 2. Envía el payload JSON al modelo SensorCreate
   v
[Pydantic v2 (app/models.py)]
   |
   |-- 2.1 Verifica que 'tipo' esté en Literal["temperatura", "presion", "vibracion"] -> OK
   |-- 2.2 Verifica que 'ubicacion' tenga entre 1 y 100 caracteres útiles             -> OK
   |-- 2.3 Parsea 'fecha' como datetime ISO 8601                                      -> OK
   |-- 2.4 Ejecuta @field_validator("valor"):
   |       Comprueba -10.0 <= 45.8 <= 100.0 para 'temperatura'                        -> OK
   |
   | 3. Entrega instancia válida de SensorCreate al endpoint crear_sensor()
   v
[Capa de Datos (app/database.py)]
   |
   |-- 4.1 get_collection() ejecuta cliente.admin.command("ping")                     -> OK
   |-- 4.2 Retorna colección monitoreo_industrial.sensores
   v
[MongoDB Community (localhost:27017)]
   |
   |-- 5.1 Ejecuta coleccion.insert_one(documento)
   |-- 5.2 Genera ObjectId único (ej. ObjectId("6b009dd354e6f00b8df040c9"))
   v
[Serialización (app/main.py -> serialize())]
   |
   |-- 6.1 Convierte documento["_id"] (ObjectId) -> documento["id"] (str)
   |-- 6.2 Valida estructura de salida contra response_model=SensorOut
   v
[Cliente]
   <-- 7. Recibe HTTP 201 Created con JSON {"id": "6b009dd3...", "tipo": "temperatura", ...}
```

---

## 4. Diagrama de Flujo de un `POST /sensores/` con Error de Validación (`422`)

Cuando el cliente envía un dato inválido (por ejemplo, `tipo: "presion"` con `valor: 999.0`, cuyo máximo es `500.0`), la petición **se detiene en la capa de Pydantic** y nunca llega a tocar MongoDB:

```text
[Cliente]
   |
   | 1. POST /sensores/
   |    Body: {"tipo": "presion", "valor": 999.0, "ubicacion": "Válvula 1", "fecha": "2026-11-20T09:00:00"}
   v
[FastAPI Router (app/main.py)]
   |
   | 2. Intenta instanciar SensorCreate con el payload recibido
   v
[Pydantic v2 (app/models.py)]
   |
   |-- 2.1 'tipo' == "presion" (válido)
   |-- 2.2 Ejecuta @field_validator("valor"):
   |       RANGOS["presion"] = (0.0, 500.0)
   |       ¿0.0 <= 999.0 <= 500.0? -> FALSO
   |
   X  ¡SE DETIENE AQUÍ! Lanza ValueError("El valor para 'presion' debe estar entre 0.0 y 500.0 kPa...")
   |  (El endpoint crear_sensor() NO se ejecuta y MongoDB NO recibe ninguna consulta)
   v
[Manejador de Errores (app/errors.py -> manejar_error_validacion)]
   |
   |-- 3.1 Captura RequestValidationError generado por FastAPI
   |-- 3.2 Construye JSON estructurado en español con campo, mensaje y tipo_error
   v
[Cliente]
   <-- 4. Recibe HTTP 422 Unprocessable Entity:
          {
            "error": "Datos de entrada inválidos",
            "detalle": "Uno o más campos no cumplen con las reglas de validación.",
            "errores": [{"campo": "body -> valor", "mensaje": "Value error, El valor para 'presion'...", ...}]
          }
```
