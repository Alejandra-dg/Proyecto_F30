# 🏗️ 02. Arquitectura del Sistema (`02_ARQUITECTURA.md`)

Este documento presenta el diseño arquitectónico comparativo entre el **Sistema Monolítico Inicial** y la **Arquitectura Desacoplada basada en Microservicios**, así como el diseño de redes en Docker Compose y el modelo entidad-relación documental en MongoDB.

---

## 1. Arquitectura Monolítica Original (`backend-monolito`)

En la arquitectura monolítica, los 5 módulos de negocio comparten un único proceso de ejecución de Node.js (`puerto 4000`), un único pool de conexiones de Mongoose y un único ciclo de vida de despliegue.

```mermaid
flowchart TD
    ClienteHTTP["Cliente HTTP (Frontend / Postman / cURL)"]

    subgraph Monolito["Contenedor: iudigital-monolito-app (Puerto 4000)"]
        Router["Express Router Principal (src/index.js)"]
        ErrorMW["Middleware Global de Errores (errorHandler.js)"]

        subgraph Modulos["Módulos de Dominio Acoplados en Memoria"]
            M1["Módulo TipoProyecto"]
            M2["Módulo Cliente"]
            M3["Módulo Universidad"]
            M4["Módulo Etapa"]
            M5["Módulo Proyecto (Alta Demanda)"]
        end

        Router --> M1
        Router --> M2
        Router --> M3
        Router --> M4
        Router --> M5
        M5 -.->|"Validación interna en memoria"| M1
        M5 -.->|"Validación interna en memoria"| M2
        M5 -.->|"Validación interna en memoria"| M3
        M5 -.->|"Validación interna en memoria"| M4
    end

    MongoDB[("MongoDB 7.0\nBD: asesorias_iudigital")]

    ClienteHTTP -->|"REST JSON (:4000/api/*)"| Router
    M1 & M2 & M3 & M4 & M5 -->|"Mongoose ODM (TCP 27017)"| MongoDB
```

### Limitaciones Operativas del Monolito
- **Escalabilidad todo-o-nada**: Si el módulo de `Proyectos` experimenta un pico de tráfico en cierres de semestre, es obligatorio replicar todo el monolito (incluyendo los catálogos estáticos).
- **Acoplamiento de disponibilidad**: Un pico de memoria o bloqueo en una consulta pesada de proyectos degrada también la administración de clientes y universidades.

---

## 2. Arquitectura Desacoplada en Microservicios (`backend-desacoplado`)

Para resolver el cuello de botella transaccional, el módulo **`Proyecto`** se extrae a un microservicio independiente (`servicio-proyectos` en el puerto `4002`), mientras que las entidades maestras permanecen en el microservicio de datos maestros (`servicio-catalogos` en el puerto `4001`).

```mermaid
flowchart LR
    Cliente["Cliente HTTP / API Consumer"]

    subgraph RedDocker["Red Docker Bridge: iudigital-net"]
        subgraph MS_Catalogos["Microservicio: servicio-catalogos (:4001)"]
            CatAPI["Express API Catálogos"]
            ValEndpoint["POST /api/catalogos/validar-referencias"]
            CatModels["Modelos: TipoProyecto, Cliente, Universidad, Etapa"]
            CatAPI --> ValEndpoint --> CatModels
        end

        subgraph MS_Proyectos["Microservicio Desacoplado: servicio-proyectos (:4002)"]
            ProyAPI["Express API Proyectos (/api/proyectos)"]
            HTTPClient["catalogosClient.js (Fetch + Timeout 4000ms)"]
            ProyModel["Modelo: Proyecto (Núcleo Transaccional)"]
            ProyAPI --> HTTPClient
            ProyAPI --> ProyModel
        end

        MongoDB[("MongoDB 7.0 (:27017)\nBD: asesorias_iudigital")]
    end

    Cliente -->|"CRUD Catálogos (:4001)"| CatAPI
    Cliente -->|"CRUD Proyectos (:4002)"| ProyAPI
    HTTPClient -->|"Validación HTTP REST Interna"| ValEndpoint
    CatModels -->|"Mongoose"| MongoDB
    ProyModel -->|"Mongoose"| MongoDB
```

---

## 3. Flujo de Secuencia: Creación de un Proyecto en Arquitectura Desacoplada

El siguiente diagrama detalla qué ocurre cuando un usuario registra una nueva asesoría en `POST http://localhost:4002/api/proyectos`:

```mermaid
sequenceDiagram
    autonumber
    actor Usuario as Cliente HTTP
    participant MS_Proy as servicio-proyectos (:4002)
    participant MS_Cat as servicio-catalogos (:4001)
    participant DB as MongoDB (:27017)

    Usuario->>MS_Proy: POST /api/proyectos (numero, titulo, fechas, valor, 4 IDs)
    MS_Proy->>MS_Proy: Verifica presencia de cliente, tipoProyecto, universidad y etapa
    MS_Proy->>MS_Cat: POST /api/catalogos/validar-referencias (Timeout: 4000ms)
    MS_Cat->>DB: Consulta paralela Promise.all([Cliente, TipoProyecto, Universidad, Etapa])
    alt Alguna referencia no existe
        DB-->>MS_Cat: null en la referencia faltante
        MS_Cat-->>MS_Proy: HTTP 404 Not Found ("No existe cliente con ID...")
        MS_Proy-->>Usuario: HTTP 404 Not Found
    else Todas las referencias existen
        DB-->>MS_Cat: Documentos encontrados
        MS_Cat-->>MS_Proy: HTTP 200 OK (Referencias válidas)
        MS_Proy->>DB: Proyecto.create(...) + populate()
        DB-->>MS_Proy: Documento de Proyecto creado
        MS_Proy-->>Usuario: HTTP 201 Created (Proyecto con relaciones pobladas)
    end
```

---

## 4. Modelo Entidad-Relación Documental (MongoDB / Mongoose)

```mermaid
erDiagram
    CLIENTE ||--o{ PROYECTO : "solicita (cliente)"
    TIPO_PROYECTO ||--o{ PROYECTO : "clasifica (tipoProyecto)"
    UNIVERSIDAD ||--o{ PROYECTO : "procede de (universidad)"
    ETAPA ||--o{ PROYECTO : "se encuentra en (etapa)"

    TIPO_PROYECTO {
        ObjectId _id PK
        string nombre UK "enum: ensayo, artículo, monografía, TFP, TFE"
        date fechaCreacion
        date fechaActualizacion
    }

    CLIENTE {
        ObjectId _id PK
        string nombre "min 3 chars"
        string email UK "regex email"
        date fechaCreacion
        date fechaActualizacion
    }

    UNIVERSIDAD {
        ObjectId _id PK
        string nombre UK
        string direccion
        string telefono
        date fechaCreacion
        date fechaActualizacion
    }

    ETAPA {
        ObjectId _id PK
        string nombre UK "enum: anteproyecto, entrega parcial 1/2, entrega final"
        date fechaCreacion
        date fechaActualizacion
    }

    PROYECTO {
        ObjectId _id PK
        string numero UK "Código único de radicado"
        string titulo "min 5 chars"
        date fechaIniciacion
        date fechaEntrega "posterior a fechaIniciacion"
        number valor "mayor que 0"
        ObjectId cliente FK
        ObjectId tipoProyecto FK
        ObjectId universidad FK
        ObjectId etapa FK
        date fechaCreacion
        date fechaActualizacion
    }
```
