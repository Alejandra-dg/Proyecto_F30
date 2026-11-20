"""Manejadores globales de excepciones y respuestas de error en español."""
from typing import Any

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pymongo.errors import PyMongoError


async def manejar_error_pymongo(request: Request, exc: PyMongoError) -> JSONResponse:
    """Captura cualquier fallo de PyMongo/MongoDB y devuelve HTTP 500 seguro.

    Nunca expone detalles internos ni el stacktrace al cliente por seguridad.

    Args:
        request: Objeto de la petición HTTP entrante.
        exc: Excepción lanzada por el driver PyMongo.

    Returns:
        JSONResponse: Respuesta con estado 500 y mensaje genérico en español.
    """
    _ = (request, exc)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Error interno de base de datos",
            "detalle": (
                "Ocurrió un problema al comunicarse con el servidor de base de datos. "
                "Por favor, inténtelo nuevamente más tarde."
            ),
        },
    )


async def manejar_http_exception(request: Request, exc: HTTPException) -> JSONResponse:
    """Formatea las excepciones HTTPException (como 404) con estructura uniforme.

    Args:
        request: Objeto de la petición HTTP entrante.
        exc: Excepción HTTPException lanzada desde los endpoints.

    Returns:
        JSONResponse: Respuesta JSON con el código HTTP correspondiente.
    """
    _ = request
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": "Error en la solicitud",
            "detalle": exc.detail,
        },
    )


async def manejar_error_validacion(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    """Formatea los errores 422 de validación de Pydantic con mensajes en español.

    Args:
        request: Objeto de la petición HTTP entrante.
        exc: Excepción de validación generada por FastAPI/Pydantic.

    Returns:
        JSONResponse: Respuesta HTTP 422 con el listado detallado de errores.
    """
    _ = request
    errores_limpios: list[dict[str, Any]] = []
    for err in exc.errors():
        ubicacion_campo = " -> ".join(str(parte) for parte in err.get("loc", []))
        errores_limpios.append(
            {
                "campo": ubicacion_campo,
                "mensaje": err.get("msg", "Valor inválido"),
                "tipo_error": err.get("type", "validation_error"),
            }
        )

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "Datos de entrada inválidos",
            "detalle": "Uno o más campos no cumplen con las reglas de validación.",
            "errores": errores_limpios,
        },
    )


async def manejar_error_inesperado(request: Request, exc: Exception) -> JSONResponse:
    """Captura cualquier excepción no controlada para evitar filtrar stacktraces.

    Args:
        request: Objeto de la petición HTTP entrante.
        exc: Excepción general no prevista.

    Returns:
        JSONResponse: Respuesta HTTP 500 con mensaje genérico seguro.
    """
    _ = (request, exc)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Error interno del servidor",
            "detalle": "Ocurrió un error interno inesperado al procesar la solicitud.",
        },
    )


def registrar_manejadores_errores(app: FastAPI) -> None:
    """Registra todos los manejadores de excepciones personalizados en la app FastAPI.

    Args:
        app: Instancia principal de la aplicación FastAPI.
    """
    app.add_exception_handler(PyMongoError, manejar_error_pymongo)  # type: ignore[arg-type]
    app.add_exception_handler(HTTPException, manejar_http_exception)  # type: ignore[arg-type]
    app.add_exception_handler(
        RequestValidationError, manejar_error_validacion  # type: ignore[arg-type]
    )
    app.add_exception_handler(Exception, manejar_error_inesperado)
