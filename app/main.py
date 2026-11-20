"""Aplicación principal FastAPI y definición de endpoints CRUD para sensores."""
from datetime import datetime
from typing import Any

from fastapi import FastAPI, HTTPException, Query, Response, status
from fastapi.exceptions import RequestValidationError

from app.database import get_collection
from app.errors import registrar_manejadores_errores
from app.models import (
    RANGOS,
    SensorCreate,
    SensorOut,
    SensorUpdate,
    TipoSensor,
    verificar_valor_en_rango,
)

app = FastAPI(
    title="EA2 API Sensores",
    description=(
        "API RESTful para la gestión y monitoreo de sensores industriales "
        "(temperatura, presión y vibración) con FastAPI y MongoDB."
    ),
    version="1.0.0",
)

# Registrar manejadores globales de errores en español.
registrar_manejadores_errores(app)


def serialize(doc: dict[str, Any]) -> dict[str, Any]:
    """Convierte un documento de MongoDB en un diccionario serializable con 'id'.

    Transforma la clave '_id' (ObjectId) en 'id' (str) y asegura que el campo
    'fecha' esté en formato ISO 8601 (YYYY-MM-DDTHH:MM:SS).

    Args:
        doc: Documento crudo retornado por PyMongo.

    Returns:
        dict[str, Any]: Diccionario listo para ser validado por SensorOut.
    """
    fecha_valor = doc.get("fecha")
    if isinstance(fecha_valor, datetime):
        fecha_iso = fecha_valor.strftime("%Y-%m-%dT%H:%M:%S")
    else:
        fecha_iso = str(fecha_valor)

    return {
        "id": str(doc["_id"]),
        "tipo": doc["tipo"],
        "valor": float(doc["valor"]),
        "ubicacion": str(doc["ubicacion"]),
        "fecha": fecha_iso,
    }


@app.post(
    "/sensores/",
    response_model=SensorOut,
    status_code=status.HTTP_201_CREATED,
    summary="Crear un nuevo sensor industrial",
    tags=["Sensores"],
)
def crear_sensor(sensor: SensorCreate) -> dict[str, Any]:
    """Registra una nueva lectura de sensor industrial en MongoDB.

    Args:
        sensor: Datos validados del sensor a crear.

    Returns:
        dict[str, Any]: El sensor creado incluyendo su identificador 'id'.
    """
    coleccion = get_collection()
    documento: dict[str, Any] = {
        "tipo": sensor.tipo,
        "valor": sensor.valor,
        "ubicacion": sensor.ubicacion,
        "fecha": sensor.fecha.strftime("%Y-%m-%dT%H:%M:%S"),
    }
    resultado = coleccion.insert_one(documento)
    documento["_id"] = resultado.inserted_id
    return serialize(documento)


@app.get(
    "/sensores/",
    response_model=list[SensorOut],
    status_code=status.HTTP_200_OK,
    summary="Listar sensores o filtrar por tipo",
    tags=["Sensores"],
)
def listar_sensores(
    tipo: TipoSensor | None = Query(
        default=None,
        description="Filtra los sensores por tipo (temperatura, presion, vibracion)",
    ),
) -> list[dict[str, Any]]:
    """Obtiene la lista completa de sensores o aquellos que coincidan con el tipo.

    Args:
        tipo: Parámetro de consulta opcional para filtrar por tipo de sensor.

    Returns:
        list[dict[str, Any]]: Lista de sensores serializados.
    """
    coleccion = get_collection()
    filtro: dict[str, Any] = {"tipo": tipo} if tipo is not None else {}
    cursor = coleccion.find(filtro)
    return [serialize(doc) for doc in cursor]


@app.put(
    "/sensores/{tipo}",
    response_model=SensorOut,
    status_code=status.HTTP_200_OK,
    summary="Actualizar el primer sensor de un tipo específico",
    tags=["Sensores"],
)
def actualizar_sensor(tipo: str, datos: SensorUpdate) -> dict[str, Any]:
    """Actualiza el primer sensor encontrado que coincida con el tipo especificado.

    Valida primero si el sensor existe (devolviendo 404 si no se encuentra) y
    verifica que el nuevo valor cumpla con el rango permitido para ese tipo.

    Args:
        tipo: Tipo de sensor a buscar y actualizar en la colección.
        datos: Nuevos valores de lectura, ubicación y fecha.

    Returns:
        dict[str, Any]: El documento del sensor actualizado.

    Raises:
        HTTPException: 404 si no existe ningún sensor del tipo solicitado.
        RequestValidationError: 422 si el valor está fuera del rango del tipo.
    """
    coleccion = get_collection()
    sensor_existente = coleccion.find_one({"tipo": tipo})
    if sensor_existente is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No se encontró ningún sensor del tipo '{tipo}' para actualizar.",
        )

    # Verificar que si enviaron 'tipo' en el body, coincida con el de la ruta.
    if datos.tipo is not None and datos.tipo != tipo:
        raise RequestValidationError(
            [
                {
                    "loc": ("body", "tipo"),
                    "msg": (
                        f"El tipo en el cuerpo ('{datos.tipo}') no coincide "
                        f"con el tipo de la ruta ('{tipo}')."
                    ),
                    "type": "value_error",
                }
            ]
        )

    # Validar el rango físico del valor respecto al tipo de la ruta.
    if tipo in RANGOS:
        try:
            verificar_valor_en_rango(tipo, datos.valor)
        except ValueError as exc:
            raise RequestValidationError(
                [
                    {
                        "loc": ("body", "valor"),
                        "msg": str(exc),
                        "type": "value_error",
                    }
                ]
            ) from exc

    campos_actualizados: dict[str, Any] = {
        "tipo": tipo,
        "valor": datos.valor,
        "ubicacion": datos.ubicacion,
        "fecha": datos.fecha.strftime("%Y-%m-%dT%H:%M:%S"),
    }

    coleccion.update_one(
        {"_id": sensor_existente["_id"]},
        {"$set": campos_actualizados},
    )

    documento_actualizado = coleccion.find_one({"_id": sensor_existente["_id"]})
    if documento_actualizado is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No se pudo recuperar el sensor del tipo '{tipo}' tras actualizar.",
        )
    return serialize(documento_actualizado)


@app.delete(
    "/sensores/{tipo}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar el primer sensor de un tipo específico",
    tags=["Sensores"],
)
def eliminar_sensor(tipo: str) -> Response:
    """Elimina el primer sensor registrado que coincida con el tipo indicado.

    Args:
        tipo: Tipo de sensor que se desea eliminar.

    Returns:
        Response: Respuesta vacía con código HTTP 204 No Content.

    Raises:
        HTTPException: 404 si no existe ningún sensor con ese tipo.
    """
    coleccion = get_collection()
    resultado = coleccion.find_one_and_delete({"tipo": tipo})
    if resultado is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No se encontró ningún sensor del tipo '{tipo}' para eliminar.",
        )
    return Response(status_code=status.HTTP_204_NO_CONTENT)
