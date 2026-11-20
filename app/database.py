"""Configuración y gestión de la conexión síncrona a MongoDB con PyMongo."""
from typing import Any

from pymongo import MongoClient
from pymongo.collection import Collection
from pymongo.errors import ConnectionFailure

# Constantes de configuración de la base de datos local.
MONGO_URI: str = "mongodb://localhost:27017"
NOMBRE_BD: str = "monitoreo_industrial"
NOMBRE_COLECCION: str = "sensores"

# Instancia global del cliente MongoClient para reutilizar el pool de conexiones.
_cliente_mongo: MongoClient[dict[str, Any]] | None = None


def obtener_cliente() -> MongoClient[dict[str, Any]]:
    """Obtiene o inicializa el cliente de conexión a MongoDB.

    Returns:
        MongoClient: Instancia conectada al servidor MongoDB local.

    Raises:
        ConnectionFailure: Si no es posible establecer conexión con MongoDB.
    """
    global _cliente_mongo
    if _cliente_mongo is None:
        _cliente_mongo = MongoClient(
            MONGO_URI,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000,
        )
    return _cliente_mongo


def get_collection() -> Collection[dict[str, Any]]:
    """Retorna la colección 'sensores' verificando previamente la conexión.

    Realiza un comando ping ligero al servidor para comprobar que MongoDB
    está disponible antes de devolver el objeto colección.

    Returns:
        Collection: Colección 'sensores' de la base 'monitoreo_industrial'.

    Raises:
        ConnectionFailure: Si el servidor MongoDB no responde al comando ping.
    """
    cliente = obtener_cliente()
    try:
        cliente.admin.command("ping")
    except ConnectionFailure as exc:
        raise ConnectionFailure(
            "No se pudo conectar con el servidor MongoDB en localhost:27017."
        ) from exc

    base_datos = cliente[NOMBRE_BD]
    return base_datos[NOMBRE_COLECCION]


# Alias en español para mantener consistencia con las convenciones del proyecto.
obtener_coleccion = get_collection
