# 📡 04. Diccionario Completo de Endpoints REST (`04_ENDPOINTS.md`)

Este documento especifica el contrato de interfaz RESTful para los **5 módulos de negocio** y el endpoint de verificación de salud (`/health`).

- **URL Base Monolito**: `http://localhost:4000`
- **URL Base Microservicio Catálogos**: `http://localhost:4001` (Módulos 1 al 4)
- **URL Base Microservicio Proyectos**: `http://localhost:4002` (Módulo 5)

---

## 0. Endpoint de Salud (Healthcheck)

### `GET /health`
Verifica la disponibilidad del servicio HTTP y el estado de la conexión con MongoDB (`readyState === 1`).

**Respuesta Exitosa (`200 OK`):**
```json
{
  "ok": true,
  "servicio": "iudigital-monolito",
  "arquitectura": "monolitica",
  "estadoBD": "conectado",
  "timestamp": "2026-11-20T20:00:00.000Z"
}
```

---

## 1. Módulo: Tipo de Proyecto (`/api/tipos-proyecto`)

- **Valores permitidos en `nombre` (enum estricto)**:
  `"ensayo"`, `"artículo"`, `"monografía"`, `"trabajo final de pregrado"`, `"trabajo final de especialización"`.

| Método | Ruta | Descripción | Éxito | Errores |
|---|---|---|---|---|
| `GET` | `/api/tipos-proyecto` | Lista todos los tipos de proyecto registrados. | `200 OK` | `500` |
| `GET` | `/api/tipos-proyecto/:id` | Obtiene un tipo de proyecto por su `ObjectId`. | `200 OK` | `400`, `404` |
| `POST` | `/api/tipos-proyecto` | Crea un nuevo tipo de proyecto del catálogo. | `201 Created` | `400`, `409` |
| `PUT` | `/api/tipos-proyecto/:id` | Actualiza el nombre de un tipo de proyecto. | `200 OK` | `400`, `404`, `409` |

### Ejemplo `POST /api/tipos-proyecto`
**Request Body:**
```json
{
  "nombre": "monografía"
}
```
**Response (`201 Created`):**
```json
{
  "ok": true,
  "mensaje": "Tipo de proyecto creado exitosamente.",
  "data": {
    "_id": "673e1000a1b2c3d4e5f60001",
    "nombre": "monografía",
    "fechaCreacion": "2026-11-20T20:00:00.000Z",
    "fechaActualizacion": "2026-11-20T20:00:00.000Z"
  }
}
```
**Response de Error cuando el valor no está en el enum (`400 Bad Request`):**
```json
{
  "ok": false,
  "error": "Error de validación de datos",
  "mensaje": "El tipo de proyecto 'tesis doctoral' no es válido. Valores permitidos: ensayo, artículo, monografía, trabajo final de pregrado, trabajo final de especialización."
}
```

---

## 2. Módulo: Cliente (`/api/clientes`)

- **Validaciones**: `nombre` obligatorio (mínimo 3 caracteres), `email` obligatorio, único y con formato válido (`usuario@dominio.tld`).

| Método | Ruta | Descripción | Éxito | Errores |
|---|---|---|---|---|
| `GET` | `/api/clientes` | Lista todos los clientes. | `200 OK` | `500` |
| `GET` | `/api/clientes/:id` | Obtiene un cliente por su `ObjectId`. | `200 OK` | `400`, `404` |
| `POST` | `/api/clientes` | Registra un nuevo cliente. | `201 Created` | `400`, `409` |
| `PUT` | `/api/clientes/:id` | Actualiza el nombre o email de un cliente. | `200 OK` | `400`, `404`, `409` |

### Ejemplo `POST /api/clientes`
**Request Body:**
```json
{
  "nombre": "Alejandro Martínez Gómez",
  "email": "alejandro.martinez@est.iudigital.edu.co"
}
```
**Response (`201 Created`):**
```json
{
  "ok": true,
  "mensaje": "Cliente registrado exitosamente.",
  "data": {
    "_id": "673e1000a1b2c3d4e5f60002",
    "nombre": "Alejandro Martínez Gómez",
    "email": "alejandro.martinez@est.iudigital.edu.co",
    "fechaCreacion": "2026-11-20T20:01:00.000Z",
    "fechaActualizacion": "2026-11-20T20:01:00.000Z"
  }
}
```

---

## 3. Módulo: Universidad (`/api/universidades`)

- **Validaciones**: `nombre` obligatorio y único, `direccion` obligatoria, `telefono` obligatorio.

| Método | Ruta | Descripción | Éxito | Errores |
|---|---|---|---|---|
| `GET` | `/api/universidades` | Lista todas las universidades. | `200 OK` | `500` |
| `GET` | `/api/universidades/:id` | Obtiene una universidad por `ObjectId`. | `200 OK` | `400`, `404` |
| `POST` | `/api/universidades` | Crea una nueva institución universitaria. | `201 Created` | `400`, `409` |
| `PUT` | `/api/universidades/:id` | Actualiza nombre, dirección o teléfono. | `200 OK` | `400`, `404`, `409` |

### Ejemplo `POST /api/universidades`
**Request Body:**
```json
{
  "nombre": "Institución Universitaria Digital de Antioquia - IUDigital",
  "direccion": "Carrera 55 # 42-90, Medellín, Antioquia",
  "telefono": "6045200750"
}
```

---

## 4. Módulo: Etapas (`/api/etapas`)

- **Valores permitidos en `nombre` (enum estricto)**:
  `"anteproyecto"`, `"entrega parcial 1"`, `"entrega parcial 2"`, `"entrega final"`.

| Método | Ruta | Descripción | Éxito | Errores |
|---|---|---|---|---|
| `GET` | `/api/etapas` | Lista todas las etapas académicas. | `200 OK` | `500` |
| `GET` | `/api/etapas/:id` | Obtiene una etapa por `ObjectId`. | `200 OK` | `400`, `404` |
| `POST` | `/api/etapas` | Crea una etapa del catálogo. | `201 Created` | `400`, `409` |
| `PUT` | `/api/etapas/:id` | Actualiza una etapa existente. | `200 OK` | `400`, `404`, `409` |

### Ejemplo `POST /api/etapas`
**Request Body:**
```json
{
  "nombre": "entrega parcial 1"
}
```

---

## 5. Módulo: Proyecto (`/api/proyectos`) — Componente Central

- **Validaciones de Negocio**:
  - `numero`: Obligatorio y estrictamente único (`409 Conflict` si se repite).
  - `titulo`: Obligatorio, mínimo 5 caracteres.
  - `fechaIniciacion` y `fechaEntrega`: Fechas válidas donde `fechaEntrega > fechaIniciacion`.
  - `valor`: Número estrictamente mayor que `0`.
  - `cliente`, `tipoProyecto`, `universidad`, `etapa`: `ObjectId` válidos que deben existir previamente en sus respectivos catálogos (`404 Not Found` si alguno no existe).

| Método | Ruta | Descripción | Éxito | Errores |
|---|---|---|---|---|
| `GET` | `/api/proyectos` | Lista todos los proyectos con `.populate()` de sus 4 relaciones. | `200 OK` | `500` |
| `GET` | `/api/proyectos/:id` | Obtiene un proyecto por `ObjectId` con `.populate()`. | `200 OK` | `400`, `404` |
| `POST` | `/api/proyectos` | Crea un proyecto tras verificar la existencia de las 4 llaves foráneas. | `201 Created` | `400`, `404`, `409`, `503` |
| `PUT` | `/api/proyectos/:id` | Actualiza datos o etapa de un proyecto revalidando fechas y referencias. | `200 OK` | `400`, `404`, `409`, `503` |

### Ejemplo `POST /api/proyectos`
**Request Body:**
```json
{
  "numero": "RAD-2026-010",
  "titulo": "Sistema Distribuido de Monitoreo Académico Cloud Native",
  "fechaIniciacion": "2026-02-01T08:00:00.000Z",
  "fechaEntrega": "2026-07-15T18:00:00.000Z",
  "valor": 3200000,
  "cliente": "673e1000a1b2c3d4e5f60002",
  "tipoProyecto": "673e1000a1b2c3d4e5f60001",
  "universidad": "673e1000a1b2c3d4e5f60003",
  "etapa": "673e1000a1b2c3d4e5f60004"
}
```
**Response (`201 Created`):**
```json
{
  "ok": true,
  "mensaje": "Proyecto de asesoría creado exitosamente.",
  "data": {
    "_id": "673e1000a1b2c3d4e5f60099",
    "numero": "RAD-2026-010",
    "titulo": "Sistema Distribuido de Monitoreo Académico Cloud Native",
    "fechaIniciacion": "2026-02-01T08:00:00.000Z",
    "fechaEntrega": "2026-07-15T18:00:00.000Z",
    "valor": 3200000,
    "cliente": {
      "_id": "673e1000a1b2c3d4e5f60002",
      "nombre": "Alejandro Martínez Gómez",
      "email": "alejandro.martinez@est.iudigital.edu.co"
    },
    "tipoProyecto": {
      "_id": "673e1000a1b2c3d4e5f60001",
      "nombre": "trabajo final de pregrado"
    },
    "universidad": {
      "_id": "673e1000a1b2c3d4e5f60003",
      "nombre": "Institución Universitaria Digital de Antioquia - IUDigital",
      "direccion": "Carrera 55 # 42-90, Medellín, Antioquia",
      "telefono": "6045200750"
    },
    "etapa": {
      "_id": "673e1000a1b2c3d4e5f60004",
      "nombre": "entrega parcial 1"
    },
    "fechaCreacion": "2026-11-20T20:05:00.000Z",
    "fechaActualizacion": "2026-11-20T20:05:00.000Z"
  }
}
```
