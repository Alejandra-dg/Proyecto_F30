# 📘 EA2: API CRUD de Sensores Industriales con FastAPI y MongoDB

API RESTful síncrona para el registro, consulta, filtrado, actualización y eliminación de lecturas de sensores industriales (`temperatura`, `presion`, `vibracion`) sobre MongoDB Community.

![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?style=for-the-badge&logo=python&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Community_Local-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115.0-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Pydantic](https://img.shields.io/badge/Pydantic-2.9.2-E92063?style=for-the-badge&logo=pydantic&logoColor=white)
![Pytest](https://img.shields.io/badge/Pytest-8.3.3-0A9EDC?style=for-the-badge&logo=pytest&logoColor=white)
![License](https://img.shields.io/badge/License-Academic_MIT-blue?style=for-the-badge)

---

## 📑 Tabla de Contenidos

1. [Guía de Instalación (`INSTALACION.md`)](./INSTALACION.md) — Configuración desde cero de Python 3.10+, MongoDB Community, `mongosh`, MongoDB Compass y entorno virtual en Windows, macOS y Linux.
2. [Manual de Uso (`USO.md`)](./USO.md) — Arranque con Uvicorn, precarga de datos (`seed_data.py`), uso de Swagger UI / ReDoc, cambio de puerto y apagado limpio.
3. [Referencia de Endpoints (`ENDPOINTS.md`)](./ENDPOINTS.md) — Especificación técnica de las rutas REST (`POST`, `GET`, `PUT`, `DELETE`), cuerpos JSON, respuestas, errores y comandos `curl`.
4. [Guía de Pruebas (`PRUEBAS.md`)](./PRUEBAS.md) — Ejecución de pruebas manuales con `curl` y Postman paso a paso, suite automatizada con `pytest` y casos de error (`404`, `422`).
5. [Arquitectura y Diseño (`ARQUITECTURA.md`)](./ARQUITECTURA.md) — Diagramas ASCII de componentes y flujos de validación, junto con la justificación técnica del stack.
6. [Solución de Problemas (`TROUBLESHOOTING.md`)](./TROUBLESHOOTING.md) — Diagnóstico y solución de 8 errores frecuentes durante la instalación y ejecución.

---

## ⚡ Quickstart en 5 Comandos

Ejecuta los siguientes 5 comandos desde la raíz del proyecto para dejar el sistema funcionando y verificado:

```bash
# 1. Crear el entorno virtual de Python
python -m venv venv

# 2. Activar el entorno virtual e instalar dependencias
# En Linux/macOS: source venv/bin/activate && pip install -r requirements.txt
# En Windows PowerShell:
.\venv\Scripts\Activate.ps1 && pip install -r requirements.txt

# 3. Precargar los 3 sensores industriales de ejemplo en MongoDB
python scripts/seed_data.py

# 4. Ejecutar los 9 tests automatizados con Pytest
pytest tests/ -v

# 5. Arrancar el servidor de la API en http://localhost:8000
uvicorn app.main:app --reload
```

---

## 📁 Estructura de Carpetas

```text
ea2_api_sensores/
├── app/
│   ├── __init__.py          # Inicializador del paquete principal
│   ├── main.py              # Aplicación FastAPI, serialización y endpoints CRUD
│   ├── database.py          # Conexión síncrona a MongoDB (monitoreo_industrial.sensores)
│   ├── models.py            # Modelos Pydantic v2 y validación de rangos por tipo
│   └── errors.py            # Excepciones personalizadas y exception handlers en español
├── tests/
│   ├── __init__.py          # Inicializador del paquete de pruebas
│   └── test_api.py          # 9 pruebas automatizadas con pytest + httpx (TestClient)
├── scripts/
│   ├── pruebas_curl.sh      # Secuencia completa de pruebas HTTP con curl
│   └── seed_data.py         # Inserta 3 sensores de ejemplo (temperatura, presion, vibracion)
├── docs/
│   ├── README.md            # Entrada principal de la documentación
│   ├── INSTALACION.md       # Cómo instalar MongoDB y Python por sistema operativo
│   ├── USO.md               # Cómo correr, poblar y apagar la API
│   ├── ENDPOINTS.md         # Documentación detallada de los endpoints
│   ├── PRUEBAS.md           # Pruebas manuales (curl/Postman) y automáticas (pytest)
│   ├── ARQUITECTURA.md      # Diagramas ASCII y decisiones de diseño
│   └── TROUBLESHOOTING.md   # Errores comunes y soluciones paso a paso
├── requirements.txt         # Dependencias con versiones exactas fijadas
├── .gitignore               # Archivos excluidos del control de versiones
└── README.md                # README raíz que apunta a docs/README.md
```

---

## 🧰 Stack Tecnológico

| Componente | Tecnología / Paquete | Versión | Propósito en el Proyecto |
|---|---|---|---|
| Lenguaje | Python | `3.10+` (probado en `3.13`) | Lenguaje base con soporte de type hints modernos (`X \| None`). |
| Framework Web | `fastapi` | `0.115.0` | Construcción de endpoints RESTful y generación automática de OpenAPI 3.1. |
| Servidor ASGI | `uvicorn[standard]` | `0.32.0` | Servidor HTTP de alto rendimiento con recarga en caliente (`--reload`). |
| Base de Datos | MongoDB Community | `6.0+ / 9.0` | Base de datos NoSQL orientada a documentos (`mongodb://localhost:27017`). |
| Driver MongoDB | `pymongo` | `4.10.1` | Cliente síncrono oficial para operaciones CRUD en `monitoreo_industrial.sensores`. |
| Validación | `pydantic` | `2.9.2` | Validación de esquemas, fechas ISO 8601 y rangos físicos por tipo de sensor. |
| Fechas | `python-dateutil` | `2.9.0` | Soporte auxiliar para manipulación y análisis de fechas ISO 8601. |
| Cliente HTTP Test | `httpx` | `0.27.2` | Motor subyacente de `TestClient` para pruebas de integración sin levantar red. |
| Suite de Pruebas | `pytest` | `8.3.3` | Ejecución de las 9 pruebas unitarias/integración de los endpoints. |

---

## 👤 Autor y Fecha

- **Proyecto**: EA2 — Bases de datos NoSQL y operaciones CRUD (Monitoreo de Sensores Industriales)
- **Autor**: Estudiante de Ingeniería / Tecnologías Web
- **Fecha**: Noviembre de 2026
