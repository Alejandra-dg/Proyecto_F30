# 🔧 08. Guía de Solución de Problemas (`08_TROUBLESHOOTING.md`)

Este manual documenta **9 incidencias frecuentes** en entornos locales, contenedores Docker y pipelines de Jenkins, siguiendo la estructura: **Síntoma → Causa Raíz → Solución Paso a Paso**.

---

## 1. Error `EADDRINUSE: address already in use :::4000` (o `4001` / `4002`)

- **Síntoma**: Al iniciar Node.js o un contenedor Docker, el proceso falla indicando que el puerto `4000`, `4001` o `4002` ya está en uso.
- **Causa Raíz**: Otra terminal o un contenedor previo sigue ejecutándose en ese puerto.
- **Solución**:
  - **En Windows (PowerShell)**:
    ```powershell
    netstat -ano | findstr :4000
    taskkill /PID <PID> /F
    ```
  - **En Linux / macOS**:
    ```bash
    lsof -i :4000
    kill -9 <PID>
    ```
  - **Si es un contenedor Docker**:
    ```bash
    docker compose -f docker/docker-compose.monolito.yml down
    ```

---

## 2. Error `MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017`

- **Síntoma**: La aplicación no logra arrancar o el endpoint `/health` devuelve `503` con `"estadoBD": "desconectado"`.
- **Causa Raíz**: El motor de MongoDB local está detenido, o dentro de Docker Compose se configuró `localhost` en lugar del nombre del servicio `mongo`.
- **Solución**:
  1. Si ejecutas Node.js directamente en tu máquina host, inicia el servicio de MongoDB:
     - Windows: `net start MongoDB`
     - Linux: `sudo systemctl start mongod`
     - macOS: `brew services start mongodb-community`
  2. Si ejecutas dentro de Docker Compose, asegúrate de que la variable de entorno sea:
     `MONGO_URI=mongodb://mongo:27017/asesorias_iudigital`.

---

## 3. Error `permission denied while trying to connect to the Docker daemon socket at unix:///var/run/docker.sock` en Jenkins

- **Síntoma**: En la etapa **Stage 3 (Build de Imágenes Docker)** de Jenkins, el pipeline falla con `Got permission denied while trying to connect to the Docker daemon socket`.
- **Causa Raíz**: El usuario del sistema `jenkins` no pertenece al grupo `docker` del sistema anfitrión.
- **Solución**:
  ```bash
  sudo usermod -aG docker jenkins
  sudo systemctl restart jenkins
  ```

---

## 4. Fallo de Autenticación en Docker Hub desde Jenkins (`unauthorized: incorrect username or password`)

- **Síntoma**: La etapa **Stage 4 (Login y Publicación en Docker Hub)** falla al ejecutar `docker login` o `docker push`.
- **Causa Raíz**:
  1. No existe la credencial con ID `dockerhub-credentials` en Jenkins.
  2. La cuenta de Docker Hub tiene activado 2FA y se usó la contraseña web en vez de un *Personal Access Token (PAT)* con permisos de `Read & Write`.
  3. El parámetro `DOCKERHUB_NAMESPACE` del Job no coincide con el nombre de usuario propietario de la cuenta de Docker Hub.
- **Solución**:
  1. Crea un Access Token en Docker Hub (*Account Settings → Security → New Access Token*) con permisos **Read, Write, Delete**.
  2. Actualiza la credencial `dockerhub-credentials` en Jenkins usando tu usuario en *Username* y el Access Token en *Password*.

---

## 5. Error `HTTP 503 Service Unavailable` al crear un Proyecto en `servicio-proyectos`

- **Síntoma**: Al hacer `POST http://localhost:4002/api/proyectos`, el microservicio responde `503` con `"No fue posible comunicarse con servicio-catalogos en http://localhost:4001"`.
- **Causa Raíz**: El microservicio `servicio-catalogos` (`puerto 4001`) no está encendido o la variable `CATALOGOS_SERVICE_URL` apunta a un host/puerto incorrecto.
- **Solución**:
  1. Verifica que `servicio-catalogos` esté activo probando `curl http://localhost:4001/health`.
  2. En local usa `CATALOGOS_SERVICE_URL=http://localhost:4001`; dentro de Docker Compose usa `CATALOGOS_SERVICE_URL=http://servicio-catalogos:4001`.

---

## 6. Error `HTTP 409 Conflict` (`Conflicto de duplicidad`) al ejecutar `POST`

- **Síntoma**: Al crear un cliente, universidad, tipo de proyecto, etapa o proyecto, la API devuelve código `409`.
- **Causa Raíz**: Violación de índice único en MongoDB (`code: 11000`):
  - En `Cliente`: `email` ya registrado.
  - En `Universidad`: `nombre` ya registrado.
  - En `Proyecto`: código de radicado `numero` ya registrado.
  - En `TipoProyecto` o `Etapa`: los valores del catálogo ya fueron insertados previamente por `seed.js`.
- **Solución**:
  - Consulta los registros existentes con `GET /api/<modulo>` y utiliza su `_id`, o envía un `email` / `numero` de proyecto nuevo.

---

## 7. Error `HTTP 400 Bad Request` al enviar `TipoProyecto` o `Etapa`

- **Síntoma**: La API rechaza la creación o edición con `"El tipo de proyecto '...' no es válido"`.
- **Causa Raíz**: Se envió un texto que no pertenece exactamente a los valores permitidos por el `enum` del caso de estudio (o con errores ortográficos, como `"articulo"` sin tilde en vez de `"artículo"`).
- **Solución**:
  - Usa exclusivamente los valores exactos del catálogo:
    - **Tipos**: `"ensayo"`, `"artículo"`, `"monografía"`, `"trabajo final de pregrado"`, `"trabajo final de especialización"`.
    - **Etapas**: `"anteproyecto"`, `"entrega parcial 1"`, `"entrega parcial 2"`, `"entrega final"`.

---

## 8. Conflicto de Puerto `27017` al levantar `docker compose` en una máquina que ya tiene MongoDB local

- **Síntoma**: Al ejecutar `docker compose -f docker/docker-compose.monolito.yml up -d`, el contenedor `mongo` falla con `Bind for 0.0.0.0:27017 failed: port is already allocated`.
- **Causa Raíz**: El servicio nativo de MongoDB del sistema operativo anfitrión (Windows/Linux) ya está ocupando el puerto `27017`.
- **Solución**:
  - Detén temporalmente el servicio local (`net stop MongoDB` en Windows o `sudo systemctl stop mongod` en Linux) mientras usas el contenedor de MongoDB, o cambia el mapeo de puertos en `docker-compose.*.yml` a `"27018:27017"`.

---

## 9. Error `$'\r': command not found` al ejecutar scripts `.sh` en Windows (WSL / Git Bash)

- **Síntoma**: Al ejecutar `bash scripts/test_monolito.sh` o `bash scripts/deploy_cd.sh`, aparecen errores de retorno de carro `\r`.
- **Causa Raíz**: El editor guardó los archivos `.sh` con saltos de línea Windows (`CRLF`) en lugar de Unix (`LF`).
- **Solución**:
  Convierte los finales de línea a `LF`:
  ```bash
  sed -i 's/\r$//' scripts/*.sh
  ```
