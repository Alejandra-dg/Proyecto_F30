# 🐳 05. Guía de Dockerización, Docker Compose y Docker Hub (`05_DOCKER_DESPLIEGUE.md`)

Este manual documenta la construcción de las imágenes Docker de producción, el despliegue local de ambas arquitecturas mediante **Docker Compose v2** y el procedimiento para etiquetar y publicar las imágenes en **Docker Hub**.

---

## 1. Buenas Prácticas Aplicadas en los `Dockerfile`

Los tres servicios (`backend-monolito`, `servicio-catalogos` y `servicio-proyectos`) cuentan con su propio `Dockerfile` y `.dockerignore` aplicando estándares de producción:
1. **Imagen Base Alpine (`node:20-alpine`)**: Reduce el tamaño de cada imagen de ~1 GB a ~135 MB y disminuye la superficie de vulnerabilidades del sistema operativo.
2. **Instalación Limpia de Producción (`npm install --omit=dev && npm cache clean --force`)**: Evita empaquetar dependencias de desarrollo o cachés innecesarias.
3. **Ejecución sin Privilegios (`USER node`)**: Los contenedores no se ejecutan como `root`, mitigando riesgos de escalamiento de privilegios.
4. **`HEALTHCHECK` Integrado**: Cada contenedor verifica periódicamente su propio endpoint `/health` mediante `wget`.

---

## 2. Orquestación Local con Docker Compose

### 2.1. Desplegar la Arquitectura Monolítica (`docker/docker-compose.monolito.yml`)
Levanta el contenedor `mongo` (MongoDB 7.0 con healthcheck y volumen persistente `mongo_monolito_data`) y el contenedor `monolito-app` en el puerto `4000`:

```bash
# Construir imágenes y levantar contenedores en segundo plano
docker compose -f docker/docker-compose.monolito.yml up -d --build

# Verificar estado de los contenedores
docker compose -f docker/docker-compose.monolito.yml ps

# Ejecutar el script de poblado de datos inicial dentro del contenedor del monolito
docker exec -it iudigital-monolito-app npm run seed

# Probar el endpoint de salud
curl http://localhost:4000/health

# Detener el entorno monolítico
docker compose -f docker/docker-compose.monolito.yml down
```

### 2.2. Desplegar la Arquitectura Desacoplada (`docker/docker-compose.desacoplado.yml`)
Levanta `mongo`, `servicio-catalogos` (`puerto 4001`) y `servicio-proyectos` (`puerto 4002`) interconectados a través de la red privada `iudigital-net`. Dentro de la red Docker, `servicio-proyectos` resuelve a `http://servicio-catalogos:4001` por DNS interno de Docker:

```bash
# Construir y levantar la arquitectura de microservicios
docker compose -f docker/docker-compose.desacoplado.yml up -d --build

# Verificar que los 3 contenedores estén activos (Up / healthy)
docker compose -f docker/docker-compose.desacoplado.yml ps

# Probar endpoints de salud
curl http://localhost:4001/health
curl http://localhost:4002/health

# Detener el entorno desacoplado
docker compose -f docker/docker-compose.desacoplado.yml down
```

---

## 3. Construcción, Etiquetado y Publicación Manual en Docker Hub

Si deseas subir las imágenes manualmente a tu cuenta de **Docker Hub** antes de automatizarlo con Jenkins, reemplaza `<TU_USUARIO_DOCKERHUB>` por tu nombre de usuario real:

```bash
# 1. Iniciar sesión en Docker Hub desde la terminal
docker login

# 2. Construir y etiquetar las 3 imágenes (con tag v1.0.0 y latest)
docker build -t <TU_USUARIO_DOCKERHUB>/iudigital-monolito:v1.0.0 \
             -t <TU_USUARIO_DOCKERHUB>/iudigital-monolito:latest \
             ./backend-monolito

docker build -t <TU_USUARIO_DOCKERHUB>/iudigital-servicio-catalogos:v1.0.0 \
             -t <TU_USUARIO_DOCKERHUB>/iudigital-servicio-catalogos:latest \
             ./backend-desacoplado/servicio-catalogos

docker build -t <TU_USUARIO_DOCKERHUB>/iudigital-servicio-proyectos:v1.0.0 \
             -t <TU_USUARIO_DOCKERHUB>/iudigital-servicio-proyectos:latest \
             ./backend-desacoplado/servicio-proyectos

# 3. Publicar (Push) las imágenes en Docker Hub
docker push <TU_USUARIO_DOCKERHUB>/iudigital-monolito:v1.0.0
docker push <TU_USUARIO_DOCKERHUB>/iudigital-monolito:latest

docker push <TU_USUARIO_DOCKERHUB>/iudigital-servicio-catalogos:v1.0.0
docker push <TU_USUARIO_DOCKERHUB>/iudigital-servicio-catalogos:latest

docker push <TU_USUARIO_DOCKERHUB>/iudigital-servicio-proyectos:v1.0.0
docker push <TU_USUARIO_DOCKERHUB>/iudigital-servicio-proyectos:latest
```

---

## 4. Despliegue desde Docker Hub (`docker/docker-compose.cd.yml`)

Una vez publicadas las imágenes en Docker Hub, cualquier servidor de destino (o el propio agente de Jenkins) puede desplegar el sistema sin compilar código localmente:

```bash
DOCKERHUB_USER=<TU_USUARIO_DOCKERHUB> IMAGE_TAG=latest \
  docker compose -f docker/docker-compose.cd.yml pull

DOCKERHUB_USER=<TU_USUARIO_DOCKERHUB> IMAGE_TAG=latest \
  docker compose -f docker/docker-compose.cd.yml up -d --force-recreate
```
