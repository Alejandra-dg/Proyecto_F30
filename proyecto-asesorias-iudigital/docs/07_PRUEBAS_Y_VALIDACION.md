# 🧪 07. Guía de Pruebas Funcionales y Validación (`07_PRUEBAS_Y_VALIDACION.md`)

Este documento explica cómo ejecutar el poblado inicial de datos (`seed`), cómo correr las suites automatizadas de pruebas para el **Monolito** y para la **Arquitectura Desacoplada**, y cómo verificar manualmente cada regla de validación de negocio.

---

## 1. Ejecución del Poblado Inicial de Datos (`Seed`)

El script [`backend-monolito/src/seed.js`](../backend-monolito/src/seed.js) (invocable también desde la raíz mediante `node scripts/seed_all.js`) es **idempotente**: limpia los registros previos e inserta:
- **5 Tipos de Proyecto**: `ensayo`, `artículo`, `monografía`, `trabajo final de pregrado`, `trabajo final de especialización`.
- **4 Etapas**: `anteproyecto`, `entrega parcial 1`, `entrega parcial 2`, `entrega final`.
- **3 Universidades**: IUDigital, Universidad de Antioquia (UdeA) y Universidad Nacional (UNAL).
- **3 Clientes** con correos institucionales únicos.
- **3 Proyectos de Asesoría** (`RAD-2026-001`, `RAD-2026-002`, `RAD-2026-003`) con todas sus llaves foráneas vinculadas.

### Comando de ejecución:
```bash
node scripts/seed_all.js
```

**Salida esperada:**
```text
[MongoDB] Conexión establecida exitosamente en: asesorias_iudigital
[Seed] Limpiando colecciones previas...
[Seed] Tipos de Proyecto insertados: 5
[Seed] Etapas insertadas: 4
[Seed] Universidades insertadas: 3
[Seed] Clientes insertados: 3
[Seed] Proyectos de asesoría insertados: 3
[Seed] Poblado inicial finalizado con éxito.
```

---

## 2. Suite de Pruebas para el Sistema Monolítico (`scripts/test_monolito.sh`)

Con el monolito corriendo en el puerto `4000` (`cd backend-monolito && npm start`), ejecuta:

```bash
bash scripts/test_monolito.sh
```

### ¿Qué valida esta suite?
1. **`GET /health` (`200 OK`)**: Certifica que el monolito está activo y conectado a MongoDB.
2. **`GET /api/tipos-proyecto` (`200 OK`)**: Verifica que existen los 5 tipos del catálogo.
3. **`POST /api/tipos-proyecto` con valor fuera del enum (`400 Bad Request`)**: Envía `{"nombre": "tesis doctoral no permitida"}` y comprueba que Mongoose lo rechace.
4. **`POST /api/clientes` válido (`201 Created`)**: Crea un nuevo cliente con email válido.
5. **`POST /api/clientes` con email duplicado (`409 Conflict`)**: Intenta registrar el mismo correo y comprueba la captura del código `11000` de MongoDB.
6. **`GET /api/universidades` (`200 OK`)**: Lista las instituciones universitarias.
7. **`GET /api/etapas` (`200 OK`)**: Lista las 4 etapas del flujo académico.
8. **`GET /api/proyectos` (`200 OK`)**: Lista los proyectos verificando que `.populate()` devuelva los objetos anidados de `cliente`, `tipoProyecto`, `universidad` y `etapa`.

---

## 3. Suite de Pruebas para la Arquitectura Desacoplada (`scripts/test_desacoplado.sh`)

Con `servicio-catalogos` corriendo en el puerto `4001` y `servicio-proyectos` en el puerto `4002`, ejecuta:

```bash
bash scripts/test_desacoplado.sh
```

### ¿Qué valida esta suite?
1. **`GET http://localhost:4001/health` (`200 OK`)**: Salud del microservicio de catálogos.
2. **`GET http://localhost:4002/health` (`200 OK`)**: Salud del microservicio de proyectos y estado de conectividad hacia `servicio-catalogos` (`"estadoServicioCatalogos": "disponible"`).
3. **`GET http://localhost:4001/api/clientes` (`200 OK`)**: Lectura de datos maestros desde el microservicio de catálogos.
4. **`GET http://localhost:4002/api/proyectos` (`200 OK`)**: Lectura de proyectos con relaciones pobladas desde el microservicio desacoplado.
5. **`POST http://localhost:4002/api/proyectos` con `ObjectId` inexistente (`404 Not Found`)**: Demuestra que `servicio-proyectos` consulta en tiempo real a `servicio-catalogos` antes de guardar y rechaza la operación cuando el `cliente` o `tipoProyecto` no existe.

---

## 4. Casos de Prueba Manuales de Reglas de Negocio (cURL / Postman)

### Caso 1 — Actualizar la Etapa y el Valor de un Proyecto (`PUT /api/proyectos/:id`)
```bash
# Reemplaza <PROYECTO_ID> y <ETAPA_ID> por IDs reales obtenidos con GET /api/proyectos
curl -i -X PUT "http://localhost:4002/api/proyectos/<PROYECTO_ID>" \
  -H "Content-Type: application/json" \
  -d '{
    "valor": 3500000,
    "etapa": "<ETAPA_ID>"
  }'
```

### Caso 2 — Rechazo por `numero` de proyecto duplicado (`HTTP 409 Conflict`)
```bash
curl -i -X POST "http://localhost:4000/api/proyectos" \
  -H "Content-Type: application/json" \
  -d '{
    "numero": "RAD-2026-001",
    "titulo": "Intento de Radicado Duplicado",
    "fechaIniciacion": "2026-03-01",
    "fechaEntrega": "2026-08-01",
    "valor": 2000000,
    "cliente": "<CLIENTE_ID>",
    "tipoProyecto": "<TIPO_ID>",
    "universidad": "<UNIVERSIDAD_ID>",
    "etapa": "<ETAPA_ID>"
  }'
```

### Caso 3 — Rechazo por `fechaEntrega` anterior a `fechaIniciacion` (`HTTP 400 Bad Request`)
```bash
curl -i -X POST "http://localhost:4000/api/proyectos" \
  -H "Content-Type: application/json" \
  -d '{
    "numero": "RAD-2026-999",
    "titulo": "Proyecto con Fechas Invertidas",
    "fechaIniciacion": "2026-10-01",
    "fechaEntrega": "2026-02-01",
    "valor": 2000000,
    "cliente": "<CLIENTE_ID>",
    "tipoProyecto": "<TIPO_ID>",
    "universidad": "<UNIVERSIDAD_ID>",
    "etapa": "<ETAPA_ID>"
  }'
```
