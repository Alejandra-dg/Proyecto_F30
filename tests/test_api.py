"""Pruebas automatizadas con pytest y httpx para los endpoints de sensores."""
from collections.abc import Generator
from typing import Any

from fastapi.testclient import TestClient
import pytest

from app.database import get_collection
from app.main import app

cliente_pruebas = TestClient(app)


@pytest.fixture(autouse=True)
def limpiar_coleccion_sensores() -> Generator[None, None, None]:
    """Limpia y prepara la colección de sensores antes y después de cada test.

    Inserta un conjunto controlado de documentos iniciales para que cada prueba
    sea determinista e independiente del estado previo de MongoDB.

    Yields:
        None: Control de ejecución cedido al test actual.
    """
    coleccion = get_collection()
    coleccion.delete_many({})
    datos_base: list[dict[str, Any]] = [
        {
            "tipo": "temperatura",
            "valor": 35.0,
            "ubicacion": "Caldera Base Test",
            "fecha": "2026-11-20T08:00:00",
        },
        {
            "tipo": "presion",
            "valor": 210.0,
            "ubicacion": "Compresor Base Test",
            "fecha": "2026-11-20T08:05:00",
        },
        {
            "tipo": "vibracion",
            "valor": 1.8,
            "ubicacion": "Motor Base Test",
            "fecha": "2026-11-20T08:10:00",
        },
    ]
    coleccion.insert_many(datos_base)
    yield
    coleccion.delete_many({})


def test_crear_sensor_valido() -> None:
    """Verifica que POST /sensores/ cree un sensor válido y retorne HTTP 201."""
    nuevo_sensor = {
        "tipo": "temperatura",
        "valor": 42.5,
        "ubicacion": "Túnel de Enfriamiento 3",
        "fecha": "2026-11-20T12:00:00",
    }
    respuesta = cliente_pruebas.post("/sensores/", json=nuevo_sensor)
    assert respuesta.status_code == 201
    datos = respuesta.json()
    assert "id" in datos
    assert isinstance(datos["id"], str)
    assert len(datos["id"]) == 24
    assert datos["tipo"] == "temperatura"
    assert datos["valor"] == 42.5
    assert datos["ubicacion"] == "Túnel de Enfriamiento 3"


def test_crear_sensor_tipo_invalido() -> None:
    """Verifica que POST /sensores/ rechace un tipo no permitido con HTTP 422."""
    sensor_invalido = {
        "tipo": "humedad",
        "valor": 55.0,
        "ubicacion": "Almacén Central",
        "fecha": "2026-11-20T12:10:00",
    }
    respuesta = cliente_pruebas.post("/sensores/", json=sensor_invalido)
    assert respuesta.status_code == 422
    cuerpo = respuesta.json()
    assert "error" in cuerpo


def test_crear_sensor_fuera_de_rango() -> None:
    """Verifica que POST /sensores/ rechace un valor fuera de rango con HTTP 422."""
    sensor_fuera_rango = {
        "tipo": "presion",
        "valor": 999.0,
        "ubicacion": "Válvula de Alta Presión",
        "fecha": "2026-11-20T12:15:00",
    }
    respuesta = cliente_pruebas.post("/sensores/", json=sensor_fuera_rango)
    assert respuesta.status_code == 422
    cuerpo = respuesta.json()
    assert "error" in cuerpo


def test_listar_sensores() -> None:
    """Verifica que GET /sensores/ retorne HTTP 200 y la lista de sensores."""
    respuesta = cliente_pruebas.get("/sensores/")
    assert respuesta.status_code == 200
    lista = respuesta.json()
    assert isinstance(lista, list)
    assert len(lista) == 3


def test_filtrar_por_tipo() -> None:
    """Verifica que GET /sensores/?tipo=vibracion retorne solo sensores de ese tipo."""
    respuesta = cliente_pruebas.get("/sensores/?tipo=vibracion")
    assert respuesta.status_code == 200
    filtrados = respuesta.json()
    assert isinstance(filtrados, list)
    assert len(filtrados) == 1
    assert filtrados[0]["tipo"] == "vibracion"
    assert filtrados[0]["valor"] == 1.8


def test_actualizar_sensor_existente() -> None:
    """Verifica que PUT /sensores/{tipo} actualice el primer sensor y retorne HTTP 200."""
    datos_actualizacion = {
        "valor": 78.9,
        "ubicacion": "Caldera Principal Actualizada",
        "fecha": "2026-11-20T15:30:00",
    }
    respuesta = cliente_pruebas.put("/sensores/temperatura", json=datos_actualizacion)
    assert respuesta.status_code == 200
    actualizado = respuesta.json()
    assert actualizado["tipo"] == "temperatura"
    assert actualizado["valor"] == 78.9
    assert actualizado["ubicacion"] == "Caldera Principal Actualizada"


def test_actualizar_sensor_inexistente() -> None:
    """Verifica que PUT /sensores/{tipo} retorne HTTP 404 si el tipo no existe."""
    datos_actualizacion = {
        "valor": 20.0,
        "ubicacion": "Zona Fantasma",
        "fecha": "2026-11-20T16:00:00",
    }
    respuesta = cliente_pruebas.put(
        "/sensores/tipo_inexistente", json=datos_actualizacion
    )
    assert respuesta.status_code == 404


def test_eliminar_sensor_existente() -> None:
    """Verifica que DELETE /sensores/{tipo} elimine el sensor y retorne HTTP 204."""
    respuesta = cliente_pruebas.delete("/sensores/presion")
    assert respuesta.status_code == 204
    assert respuesta.content == b""

    # Comprobar que ya no existen sensores de tipo 'presion' en la colección.
    consulta = cliente_pruebas.get("/sensores/?tipo=presion")
    assert consulta.status_code == 200
    assert consulta.json() == []


def test_eliminar_sensor_inexistente() -> None:
    """Verifica que DELETE /sensores/{tipo} retorne HTTP 404 si el tipo no existe."""
    respuesta = cliente_pruebas.delete("/sensores/tipo_inexistente")
    assert respuesta.status_code == 404
