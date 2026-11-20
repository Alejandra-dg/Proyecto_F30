# 🎓 Caso de Estudio 3: Sistema de Asesorías Académicas IUDigital
## Monolito, Desacoplamiento en Microservicios, Docker y Despliegue Continuo (CD) con Jenkins

![Node.js](https://img.shields.io/badge/Node.js-20_LTS-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-4.19-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_8.3-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose_v2-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Jenkins](https://img.shields.io/badge/Jenkins-CD_Pipeline-D24939?style=for-the-badge&logo=jenkins&logoColor=white)

Solución integral desarrollada para la **Actividad Énfasis 2a: Tecnologías Web (Institución Universitaria Digital de Antioquia - IUDigital)**. Incluye la construcción del sistema monolítico inicial (5 módulos), el análisis de demanda y desacoplamiento del módulo transaccional de **Proyectos** en un microservicio autónomo, su contenedorización con Docker/Docker Compose y un pipeline declarativo de **Despliegue Continuo (CD)** con **Jenkins** y **Docker Hub**.

---

## 📚 Documentación Técnica Completa (`docs/`)

Accede a los 8 manuales oficiales del proyecto en la carpeta [`docs/`](./docs/01_README.md):

| # | Documento | Contenido Principal |
|---|---|---|
| 01 | [`docs/01_README.md`](./docs/01_README.md) | Portal de entrada, contexto académico IUDigital, componentes y guía rápida en 3 comandos. |
| 02 | [`docs/02_ARQUITECTURA.md`](./docs/02_ARQUITECTURA.md) | Diagramas Mermaid C4 de la arquitectura monolítica y la arquitectura desacoplada. |
| 03 | [`docs/03_ANALISIS_DESACOPLAMIENTO.md`](./docs/03_ANALISIS_DESACOPLAMIENTO.md) | Justificación técnica y funcional del desacoplamiento del módulo de **Proyectos**. |
| 04 | [`docs/04_ENDPOINTS.md`](./docs/04_ENDPOINTS.md) | Contrato completo de las APIs REST (5 módulos, payloads JSON, respuestas y errores). |
| 05 | [`docs/05_DOCKER_DESPLIEGUE.md`](./docs/05_DOCKER_DESPLIEGUE.md) | Guía de construcción de imágenes Alpine, orquestación con Docker Compose y Docker Hub. |
| 06 | [`docs/06_JENKINS_CD_PIPELINE.md`](./docs/06_JENKINS_CD_PIPELINE.md) | Configuración paso a paso del Job en Jenkins, credenciales `dockerhub-credentials` y CD. |
| 07 | [`docs/07_PRUEBAS_Y_VALIDACION.md`](./docs/07_PRUEBAS_Y_VALIDACION.md) | Guía de ejecución del seed, suites automatizadas y pruebas manuales con cURL / Postman. |
| 08 | [`docs/08_TROUBLESHOOTING.md`](./docs/08_TROUBLESHOOTING.md) | Solución detallada a 8+ problemas frecuentes de MongoDB, Docker, puertos y Jenkins. |

---

## ⚡ Inicio Rápido

### Opción A — Ejecución Local con Node.js y MongoDB Local
```bash
# 1. Instalar dependencias del monolito y poblar datos iniciales
cd backend-monolito && npm install && npm run seed

# 2. Iniciar el servidor monolítico en http://localhost:4000
npm start
```

### Opción B — Despliegue Orquestado con Docker Compose
```bash
# Levantar Arquitectura Monolítica + MongoDB
docker compose -f docker/docker-compose.monolito.yml up -d --build

# Levantar Arquitectura Desacoplada (Catálogos: 4001 + Proyectos: 4002 + MongoDB)
docker compose -f docker/docker-compose.desacoplado.yml up -d --build
```
