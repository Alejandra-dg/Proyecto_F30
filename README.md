# 🏭 EA2: API RESTful de Sensores Industriales con FastAPI y MongoDB

![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-3776AB?logo=python&logoColor=white)
![FastAPI 0.115.0](https://img.shields.io/badge/FastAPI-0.115.0-009688?logo=fastapi&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Community-47A248?logo=mongodb&logoColor=white)
![Pydantic v2](https://img.shields.io/badge/Pydantic-2.9.2-E92063?logo=pydantic&logoColor=white)
![License MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

Proyecto académico correspondiente a la actividad **EA2: Bases de datos NoSQL y operaciones CRUD**. Implementa una API RESTful síncrona con **FastAPI**, **Pydantic v2** y **PyMongo** para gestionar lecturas de sensores industriales (`temperatura`, `presion` y `vibracion`) almacenadas en **MongoDB Community**.

---

## 📖 Documentación Completa

Toda la documentación técnica, guías de instalación, uso, arquitectura y pruebas se encuentra organizada en la carpeta [`docs/`](./docs/README.md):

👉 **[Ir a la Documentación Principal (`docs/README.md`)](./docs/README.md)**

| Documento | Descripción |
|---|---|
| [`docs/README.md`](./docs/README.md) | Portada principal de la documentación, quickstart y estructura del proyecto. |
| [`docs/INSTALACION.md`](./docs/INSTALACION.md) | Instalación paso a paso de Python, MongoDB, `mongosh`, Compass y `venv` por SO. |
| [`docs/USO.md`](./docs/USO.md) | Cómo iniciar y detener la API, cargar datos semilla (`seed`) y abrir Swagger/ReDoc. |
| [`docs/ENDPOINTS.md`](./docs/ENDPOINTS.md) | Referencia detallada de los endpoints REST, payloads JSON, códigos HTTP y ejemplos `curl`. |
| [`docs/PRUEBAS.md`](./docs/PRUEBAS.md) | Guía de pruebas manuales (`curl` y Postman), pruebas automatizadas (`pytest`) y casos de error. |
| [`docs/ARQUITECTURA.md`](./docs/ARQUITECTURA.md) | Diagramas ASCII de arquitectura, decisiones de diseño y flujos de peticiones. |
| [`docs/TROUBLESHOOTING.md`](./docs/TROUBLESHOOTING.md) | Solución a los 8 errores más comunes de conexión, validación, entorno y puertos. |

---

## ⚡ Inicio Rápido (Quickstart)

```bash
# 1. Crear y activar entorno virtual (en Windows PowerShell: python -m venv venv; .\venv\Scripts\Activate.ps1)
python3 -m venv venv && source venv/bin/activate

# 2. Instalar dependencias exactas
pip install -r requirements.txt

# 3. Cargar los 3 sensores de ejemplo en MongoDB (monitoreo_industrial.sensores)
python scripts/seed_data.py

# 4. Ejecutar la suite de pruebas automatizadas (9 tests)
pytest tests/ -v

# 5. Iniciar el servidor de desarrollo en http://localhost:8000
uvicorn app.main:app --reload
```
