# ==============================================================================
# Dockerfile Optimizado (Alpine + Non-Root User) - Microservicio Catálogos
# ==============================================================================
FROM node:20-alpine

LABEL maintainer="Arquitectura de Software - IUDigital"
LABEL description="Microservicio de Catálogos Maestros - IUDigital"

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force

COPY --chown=node:node src ./src

ENV NODE_ENV=production
ENV PORT=4001

USER node

EXPOSE 4001

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:4001/health || exit 1

CMD ["node", "src/index.js"]
