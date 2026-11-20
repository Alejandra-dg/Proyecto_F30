# 🛠️ Guía de Instalación desde Cero (`INSTALACION.md`)

Este documento explica paso a paso cómo preparar el entorno completo de desarrollo y base de datos para ejecutar la API de sensores industriales en **Windows**, **macOS** y **Linux (Ubuntu/Debian)**.

---

## 1. Instalación de Python 3.10+

La aplicación requiere **Python 3.10 o superior** (compatible hasta Python 3.13).

### 🪟 Windows
1. Descarga el instalador oficial desde [python.org/downloads](https://www.python.org/downloads/).
2. **Importante**: En la primera pantalla del instalador, marca la casilla **"Add python.exe to PATH"**.
3. Haz clic en **Install Now**.
4. Alternativamente, con `winget` desde PowerShell:
   ```powershell
   winget install -e --id Python.Python.3.12
   ```
5. Verifica la instalación abriendo una nueva terminal PowerShell:
   ```powershell
   python --version
   # o mediante el lanzador de Windows:
   py --version
   ```

### 🍎 macOS
1. Instala Python mediante [Homebrew](https://brew.sh/):
   ```bash
   brew update
   brew install python@3.12
   ```
2. Verifica la versión instalada:
   ```bash
   python3 --version
   ```

### 🐧 Linux (Ubuntu / Debian)
1. Actualiza los repositorios e instala Python 3, `venv` y `pip`:
   ```bash
   sudo apt update
   sudo apt install -y python3 python3-venv python3-pip
   ```
2. Verifica la versión instalada:
   ```bash
   python3 --version
   ```

---

## 2. Instalación de MongoDB Community Edition

La API se conecta al motor local en `mongodb://localhost:27017`, base de datos `monitoreo_industrial`, colección `sensores`.

### 🪟 Windows
1. Descarga el instalador `.msi` de **MongoDB Community Server** desde [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community).
2. Ejecuta el instalador y selecciona la opción **Complete**.
3. Deja marcada la casilla **"Install MongoDB as a Service"** (Run service as Network Service user).
4. Para iniciar o verificar el servicio de MongoDB desde PowerShell (como Administrador):
   ```powershell
   net start MongoDB
   # o para verificar su estado:
   Get-Service MongoDB
   ```

### 🍎 macOS
1. Agrega el tap oficial de MongoDB en Homebrew e instala la edición Community:
   ```bash
   brew tap mongodb/brew
   brew update
   brew install mongodb-community@7.0
   ```
2. Inicia el servicio en segundo plano:
   ```bash
   brew services start mongodb-community@7.0
   ```

### 🐧 Linux (Ubuntu / Debian)
1. Importa la clave GPG oficial de MongoDB y agrega el repositorio (ejemplo Ubuntu 22.04 Jammy):
   ```bash
   sudo apt-get install -y gnupg curl
   curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
      sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
   echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
      sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
   sudo apt-get update
   sudo apt-get install -y mongodb-org
   ```
2. Inicia y habilita el servicio `mongod`:
   ```bash
   sudo systemctl start mongod
   sudo systemctl enable mongod
   sudo systemctl status mongod
   ```

---

## 3. Instalación y Verificación con `mongosh` (MongoDB Shell)

En versiones recientes de MongoDB Server (6.0+), la consola interactiva `mongosh` se distribuye como un paquete independiente.

### Instalación de `mongosh` si no viene incluido
- **Windows (PowerShell)**:
  ```powershell
  winget install -e --id MongoDB.Shell
  ```
  *(O descarga el archivo `.msi` desde [mongodb.com/try/download/shell](https://www.mongodb.com/try/download/shell))*.
- **macOS**:
  ```bash
  brew install mongosh
  ```
- **Linux (Ubuntu/Debian)**:
  ```bash
  sudo apt-get install -y mongodb-mongosh
  ```

### Verificación de conexión con `mongosh`
Ejecuta el siguiente comando para confirmar que el servidor responde en `localhost:27017`:

```bash
mongosh --eval "db.runCommand({ ping: 1 })"
```

**Salida esperada:**
```javascript
{ ok: 1 }
```

---

## 4. Instalación de MongoDB Compass (Opcional pero Recomendado)

**MongoDB Compass** es la interfaz gráfica oficial para inspeccionar visualmente la base de datos `monitoreo_industrial` y tomar capturas de pantalla para la entrega académica.

1. Si en Windows marcaste *"Install MongoDB Compass"* durante la instalación del servidor, ya lo tendrás disponible en el menú Inicio.
2. En caso contrario, descárgalo gratis desde [mongodb.com/try/download/compass](https://www.mongodb.com/try/download/compass).
3. Al abrirlo, ingresa la URI:
   ```text
   mongodb://localhost:27017
   ```
4. Haz clic en **Connect** para visualizar la base de datos `monitoreo_industrial` y su colección `sensores`.

---

## 5. Creación del Entorno Virtual e Instalación de Dependencias

Ubícate en la carpeta raíz del proyecto (`ea2_api_sensores/` o `PROYECTO_F30/`) y sigue los pasos según tu sistema operativo:

### 🪟 En Windows (PowerShell)
```powershell
# 1. Crear el entorno virtual en la carpeta venv/
python -m venv venv
# (Si 'python' no está en el PATH de usuario, usa: py -m venv venv)

# 2. Activar el entorno virtual
.\venv\Scripts\Activate.ps1

# 3. Instalar las dependencias exactas del proyecto
pip install -r requirements.txt
```
> **Nota para Windows**: Si PowerShell muestra un aviso sobre ejecución de scripts (`ExecutionPolicy`), puedes autorizar la sesión actual con:
> `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process`
> o invocar directamente `.\venv\Scripts\pip.exe install -r requirements.txt`.

### 🍎 / 🐧 En macOS y Linux (Bash / Zsh)
```bash
# 1. Crear el entorno virtual
python3 -m venv venv

# 2. Activar el entorno virtual
source venv/bin/activate

# 3. Instalar las dependencias exactas
pip install -r requirements.txt
```

---

## 6. Verificación Final del Entorno

Con el entorno virtual activado, ejecuta el siguiente comando de comprobación para asegurarte de que **FastAPI** y **PyMongo** se importan sin errores:

```bash
python -c "import fastapi, pymongo; print('OK')"
```

**Salida esperada:**
```text
OK
```

Si deseas comprobar además el `ping` directo a MongoDB desde Python:

```bash
python -c "from app.database import get_collection; get_collection(); print('Conexión a MongoDB OK')"
```

**Salida esperada:**
```text
Conexión a MongoDB OK
```
