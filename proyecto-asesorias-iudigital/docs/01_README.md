# 📘 01. Portal Principal — Sistema de Asesorías Académicas IUDigital
## Caso de Estudio 3 — Actividad Énfasis 2a: Tecnologías Web

![Node.js](https://img.shields.io/badge/Node.js-20_LTS-339933?style=flat-square&logo=nodedotjs)
![Express.js](https://img.shields.io/badge/Express.js-4.19-000000?style=flat-square&logo=express)
![Mongoose](https://img.shields.io/badge/Mongoose-8.3-880000?style=flat-square&logo=mongoose)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?style=flat-square&logo=mongodb)
![Docker](https://img.shields.io/badge/Docker-Alpine_Containers-2496ED?style=flat-square&logo=docker)
![Jenkins](https://img.shields.io/badge/Jenkins-Declarative_CD-D24939?style=flat-square&logo=jenkins)

---

## 1. Contextualización del Problema (IUDigital)

La **Institución Universitaria Digital de Antioquia (IUDigital)** gestiona proyectos de asesoría académica solicitados por estudiantes y clientes externos. Cada asesoría constituye un **proyecto** que genera un rubro económico (`valor > 0`), pertenece a una tipología académica estricta (`ensayo`, `artículo`, `monografía`, `trabajo final de pregrado`, `trabajo final de especialización`), está vinculada a una **Universidad** y atraviesa **Etapas** sucesivas de entregables (`anteproyecto`, `entrega parcial 1`, `entrega parcial 2`, `entrega final`).

Este repositorio aborda las cuatro dimensiones de ingeniería exigidas por el Caso de Estudio 3:
1. **Construcción del Sistema Monolítico Base (`backend-monolito/`)**: API REST completa con los 5 módulos de dominio sobre Node.js, Express y Mongoose.
2. **Análisis de Demanda y Desacoplamiento (`backend-desacoplado/`)**: Extracción del componente transaccional de mayor concurrencia (**Módulo de Proyectos**) hacia una arquitectura de microservicios (`servicio-catalogos` y `servicio-proyectos`) comunicados vía HTTP REST resiliente.
3. **Contenedorización y Orquestación (`docker/`)**: Imágenes Docker ligeras basadas en `node:20-alpine` con usuario sin privilegios (`USER node`) y 3 archivos de orquestación Docker Compose (Monolito, Microservicios y Despliegue Continuo desde Docker Hub).
4. **Automatización del Despliegue Continuo (CD) con Jenkins (`jenkins/Jenkinsfile`)**: Pipeline declarativo de 6 etapas que verifica el código, compila las imágenes, las publica en **Docker Hub** y las despliega automáticamente con verificación de salud (*Smoke Tests*).

---

## 2. Resumen de Componentes y Puertos

| Componente | Ruta en el Repositorio | Puerto | Responsabilidad Principal |
|---|---|---|---|
| **Monolito Original** | `backend-monolito/` | `4000` | Expone los 5 módulos unificados (`/api/tipos-proyecto`, `/api/clientes`, `/api/universidades`, `/api/etapas`, `/api/proyectos`). |
| **Microservicio Catálogos** | `backend-desacoplado/servicio-catalogos/` | `4001` | Gestiona las 4 entidades maestras de baja volatilidad y expone validación inter-servicio (`/api/catalogos/validar-referencias`). |
| **Microservicio Proyectos** | `backend-desacoplado/servicio-proyectos/` | `4002` | Componente desacoplado de alta demanda transaccional (`/api/proyectos`). Valida integridad referencial vía HTTP contra `servicio-catalogos`. |
| **Motor de Base de Datos** | Contenedor `mongo:7.0` / Local | `27017` | Base de datos NoSQL documental `asesorias_iudigital`. |
| **Servidor CI/CD Jenkins** | `jenkins/` | `8080` | Orquestador del pipeline declarativo de construcción, `docker push` y despliegue continuo (CD). |

---

## 3. Stack Tecnológico

- **Runtime Backend**: Node.js `v20+ LTS` (probado en `v20` y `v22`).
- **Framework HTTP**: Express.js `^4.19.2`, con `cors` y `morgan`.
- **ODM y Persistencia**: Mongoose `^8.3.4` sobre MongoDB Community `v7.0+`.
- **Contenedorización**: Docker Engine + Docker Compose v2 (`node:20-alpine`).
- **Registro de Imágenes**: Docker Hub (`<usuario>/iudigital-*`).
- **Automatización CI/CD**: Jenkins LTS con Declarative Pipeline, Docker Pipeline y Credentials Binding.

---

## 4. Guía Rápida de Inicio en 3 Comandos

### Ejecución Local Inmediata
```bash
# 1. Instalar dependencias de los 3 servicios y poblar datos semilla (seed)
cd backend-monolito && npm install && npm run seed

# 2. Arrancar el Monolito (puerto 4000)
npm start

# 3. En otra terminal, ejecutar la suite de pruebas funcionales con cURL
bash scripts/test_monolito.sh
```

### Ejecución con Docker Compose (Microservicios Desacoplados)
```bash
# 1. Construir y levantar MongoDB + Servicio Catálogos (4001) + Servicio Proyectos (4002)
docker compose -f docker/docker-compose.desacoplado.yml up -d --build

# 2. Poblar la base de datos inicial
node scripts/seed_all.js

# 3. Ejecutar la suite de pruebas de la arquitectura desacoplada
bash scripts/test_desacoplado.sh
```

---

## 5. Índice General de Manuales (`docs/`)

1. **[01_README.md](./01_README.md)** — Portal de entrada y resumen ejecutivo.
2. **[02_ARQUITECTURA.md](./02_ARQUITECTURA.md)** — Diagramas Mermaid de arquitectura monolítica, microservicios, red Docker y flujo de datos.
3. **[03_ANALISIS_DESACOPLAMIENTO.md](./03_ANALISIS_DESACOPLAMIENTO.md)** — Estudio de concurrencia y justificación del desacoplamiento del módulo `Proyecto`.
4. **[04_ENDPOINTS.md](./04_ENDPOINTS.md)** — Diccionario completo de endpoints REST, payloads JSON y respuestas HTTP.
5. **[05_DOCKER_DESPLIEGUE.md](./05_DOCKER_DESPLIEGUE.md)** — Guía de `Dockerfile`, Docker Compose y publicación en Docker Hub.
6. **[06_JENKINS_CD_PIPELINE.md](./06_JENKINS_CD_PIPELINE.md)** — Configuración paso a paso de Jenkins, credenciales y pipeline de Despliegue Continuo.
7. **[07_PRUEBAS_Y_VALIDACION.md](./07_PRUEBAS_Y_VALIDACION.md)** — Pruebas automatizadas y manuales con `curl` y Postman.
8. **[08_TROUBLESHOOTING.md](./08_TROUBLESHOOTING.md)** — Solución de 8+ problemas comunes en MongoDB, Docker y Jenkins.
