# 🔀 03. Análisis de Demanda y Estrategia de Desacoplamiento (`03_ANALISIS_DESACOPLAMIENTO.md`)

Este documento fundamenta técnica y funcionalmente la elección del módulo **`Proyecto`** como el componente de mayor demanda del Caso de Estudio 3 de la IUDigital y detalla la ingeniería aplicada para su desacoplamiento.

---

## 1. Identificación del Componente de Mayor Demanda

En el dominio de asesorías académicas de la IUDigital coexisten **5 módulos**:
1. `TipoProyecto` (Catálogo estático de 5 tipologías reglamentarias).
2. `Etapa` (Catálogo estático de 4 fases del ciclo de vida académico).
3. `Universidad` (Datos maestros institucionales de baja frecuencia de cambio).
4. `Cliente` (Directorio de estudiantes/solicitantes, se registra una vez por estudiante).
5. **`Proyecto` (Núcleo Transaccional Operativo)**.

### Matriz Comparativa de Demanda y Volatilidad

| Módulo | Clasificación | Frecuencia de Lectura (`GET`) | Frecuencia de Escritura (`POST`/`PUT`) | Complejidad de Procesamiento | Prioridad de Escalado |
|---|---|---|---|---|---|
| `TipoProyecto` | Catálogo Estático | Baja | Casi nula (5 registros fijos) | O(1) — Lectura simple | Baja |
| `Etapa` | Catálogo Estático | Baja | Casi nula (4 registros fijos) | O(1) — Lectura simple | Baja |
| `Universidad` | Dato Maestro | Media-Baja | Muy baja (alta ocasional) | O(1) — Índice único | Baja |
| `Cliente` | Dato Maestro | Media | Media (1 vez por estudiante nuevo) | O(1) — Validación de email | Media |
| **`Proyecto`** | **Transaccional Core** | **Muy Alta (Dashboards, consultas continuas)** | **Muy Alta (Radicación, cambios de etapa, prórrogas, ajustes de valor)** | **Alta (Join/Populate de 4 colecciones + validaciones cruzadas)** | **Crítica (Alta)** |

---

## 2. Justificación Técnica del Desacoplamiento de `Proyecto`

### 2.1. Volumen de Transacciones y Tasa de Cambio
Cada vez que un estudiante radica una asesoría, o cada vez que un asesor académico actualiza el avance del estudiante (pasando de `"anteproyecto"` a `"entrega parcial 1"`, `"entrega parcial 2"` y `"entrega final"`), o modifica la `fechaEntrega` y el `valor` económico, la operación impacta exclusivamente a la colección **`proyectos`**. Un solo cliente y una sola universidad pueden participar en decenas de proyectos a lo largo del año académico, y cada proyecto sufre múltiples escrituras (`PUT /api/proyectos/:id`) durante su ciclo de vida.

### 2.2. Costo Computacional por Petición (I/O y Serialización)
Mientras que listar etapas o tipos de proyecto devuelve menos de 1 KB de JSON plano, el endpoint `GET /api/proyectos` realiza un `.populate()` de **4 referencias foráneas** (`cliente`, `tipoProyecto`, `universidad`, `etapa`), y el endpoint `POST /api/proyectos` debe validar reglas de negocio compuestas:
- Unicidad estricta del código de radicado `numero`.
- Comparación temporal `fechaEntrega > fechaIniciacion`.
- Restricción financiera `valor > 0`.
- Verificación de integridad referencial de 4 `ObjectId` distintos.

### 2.3. Escalabilidad Horizontal Independiente
En temporadas pico del calendario universitario (inicio de semestre y semanas de entregas parciales/finales), la carga sobre `/api/proyectos` crece exponencialmente. Al extraer **`servicio-proyectos`** a un contenedor independiente:
- Podemos escalar horizontalmente solo el microservicio de proyectos (`docker compose up -d --scale servicio-proyectos=3`) detrás de un balanceador de carga sin desperdiciar memoria RAM duplicando el servicio de catálogos.
- Podemos asignar límites de CPU y memoria diferenciados en producción para el servicio transaccional.

---

## 3. Diseño de Comunicación y Resiliencia Inter-Servicio

En la arquitectura desacoplada (`backend-desacoplado/`):

1. **Separación de Procesos y Puertos**:
   - `servicio-catalogos` corre en su propio proceso Node.js en el puerto **`4001`**.
   - `servicio-proyectos` corre en su propio proceso Node.js en el puerto **`4002`**.

2. **Validación Remota vía HTTP REST (`catalogosClient.js`)**:
   - Antes de insertar o actualizar un proyecto, `servicio-proyectos` realiza una petición HTTP `POST` al endpoint `/api/catalogos/validar-referencias` de `servicio-catalogos`.
   - `servicio-catalogos` verifica en paralelo (`Promise.all`) los IDs enviados y retorna `200 OK` si todos existen, o `404 Not Found` / `400 Bad Request` detallando cuál referencia es inválida.

3. **Tolerancia a Fallos y Control de Timeouts (*Fail-Fast*)**:
   - El cliente HTTP implementa `AbortSignal.timeout(4000)` (configurable mediante `CATALOGOS_TIMEOUT_MS`).
   - Si `servicio-catalogos` se encuentra temporalmente caído o saturado, `servicio-proyectos` no queda bloqueado indefinidamente: aborta la espera a los 4 segundos y devuelve una respuesta controlada **`HTTP 503 Service Unavailable`** en español.
