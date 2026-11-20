# ==============================================================================
# Dockerfile Optimizado (Alpine + Non-Root User) - Monolito IUDigital
# ==============================================================================
FROM node:20-alpine

LABEL maintainer="Arquitectura de Software - IUDigital"
LABEL description="Sistema Monolítico RESTful de Asesorías Académicas IUDigital"

WORKDIR /usr/src/app

# Copiar manifiestos e instalar solo dependencias de producción
COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force

# Copiar código fuente con permisos para el usuario no privilegiado 'node'
COPY --chown=node:node src ./src

ENV NODE_ENV=production
ENV PORT=4000

# Ejecutar bajo usuario sin privilegios por seguridad
USER node

EXPOSE 4000

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:4000/health || exit 1

CMD ["node", "src/index.js"]
