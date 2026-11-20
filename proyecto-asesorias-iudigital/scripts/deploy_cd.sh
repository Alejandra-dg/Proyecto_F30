#!/usr/bin/env bash
# ==============================================================================
# Script Auxiliar de Despliegue Continuo (CD) invocado por Jenkins
# Descarga las últimas imágenes de Docker Hub y recrea los contenedores
# ==============================================================================
set -euo pipefail

DOCKERHUB_USER="${DOCKERHUB_USER:-alejandroiudigital}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
ARQUITECTURA="${ARQUITECTURA:-ambas}"
COMPOSE_FILE="docker/docker-compose.cd.yml"

echo "=================================================================="
echo " INICIANDO DESPLIEGUE CONTINUO (CD) - IUDIGITAL"
echo " Namespace Docker Hub : ${DOCKERHUB_USER}"
echo " Tag de Imagen        : ${IMAGE_TAG}"
echo " Arquitectura         : ${ARQUITECTURA}"
echo "=================================================================="

export DOCKERHUB_USER
export IMAGE_TAG

# Detener contenedores previos del entorno CD
docker compose -f "${COMPOSE_FILE}" down --remove-orphans || true

# Descargar las imágenes más recientes desde Docker Hub
docker compose -f "${COMPOSE_FILE}" pull || true

# Levantar los servicios según la arquitectura seleccionada
if [ "${ARQUITECTURA}" = "monolito" ]; then
  docker compose -f "${COMPOSE_FILE}" up -d --force-recreate mongo monolito-app
elif [ "${ARQUITECTURA}" = "desacoplado" ]; then
  docker compose -f "${COMPOSE_FILE}" up -d --force-recreate mongo servicio-catalogos servicio-proyectos
else
  docker compose -f "${COMPOSE_FILE}" up -d --force-recreate
fi

echo "=================================================================="
echo " CONTENEDORES DESPLEGADOS:"
docker compose -f "${COMPOSE_FILE}" ps
echo "=================================================================="
