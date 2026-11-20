"""Script para precargar (seed) 3 sensores industriales de ejemplo en MongoDB."""
from pathlib import Path
import sys
from typing import Any

from pymongo.errors import PyMongoError

# Asegurar que el directorio raíz del proyecto esté en sys.path al ejecutar el script.
RUTA_RAIZ = Path(__file__).resolve().parent.parent
if str(RUTA_RAIZ) not in sys.path:
    sys.path.insert(0, str(RUTA_RAIZ))

from app.database import get_collection  # noqa: E402

# Datos iniciales realistas: un sensor por cada tipo permitido.
SENSORES_EJEMPLO: list[dict[str, Any]] = [
    {
        "tipo": "temperatura",
        "valor": 68.5,
        "ubicacion": "Caldera de Vapor Principal - Nave A",
        "fecha": "2026-11-20T08:00:00",
    },
    {
        "tipo": "presion",
        "valor": 315.4,
        "ubicacion": "Compresor Neumático Línea 2 - Nave B",
        "fecha": "2026-11-20T08:05:00",
    },
    {
        "tipo": "vibracion",
        "valor": 2.35,
        "ubicacion": "Turbina de Generación Eléctrica - Sector C",
        "fecha": "2026-11-20T08:10:00",
    },
]


def cargar_datos_ejemplo(limpiar_antes: bool = True) -> list[str]:
    """Inserta los 3 sensores de ejemplo en la colección 'sensores'.

    Args:
        limpiar_antes: Si es True, vacía la colección antes de insertar los datos.

    Returns:
        list[str]: Lista con los identificadores (ObjectId en texto) insertados.
    """
    coleccion = get_collection()
    if limpiar_antes:
        eliminados = coleccion.delete_many({})
        print(f"[INFO] Documentos previos eliminados: {eliminados.deleted_count}")

    resultado = coleccion.insert_many([ dict(item) for item in SENSORES_EJEMPLO ])
    ids_insertados = [str(obj_id) for obj_id in resultado.inserted_ids]

    print(f"[OK] Se insertaron {len(ids_insertados)} sensores de ejemplo exitosamente:")
    for sensor, id_str in zip(SENSORES_EJEMPLO, ids_insertados):
        print(
            f"  - ID: {id_str} | Tipo: {sensor['tipo']:<11} | "
            f"Valor: {sensor['valor']:<6} | Ubicación: {sensor['ubicacion']}"
        )
    return ids_insertados


def main() -> int:
    """Punto de entrada principal para la ejecución desde terminal.

    Returns:
        int: Código de salida del proceso (0 éxito, 1 error).
    """
    try:
        cargar_datos_ejemplo(limpiar_antes=True)
        return 0
    except PyMongoError as exc:
        print(f"[ERROR] No fue posible insertar los datos en MongoDB: {exc}")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
