"""Modelos Pydantic para validación de datos de sensores industriales."""
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, ValidationInfo, field_validator

# Rangos válidos por tipo de sensor (mínimo, máximo).
RANGOS: dict[str, tuple[float, float]] = {
    "temperatura": (-10.0, 100.0),
    "presion": (0.0, 500.0),
    "vibracion": (0.0, 5.0),
}

# Unidades físicas asociadas a cada tipo de sensor para mensajes descriptivos.
UNIDADES: dict[str, str] = {
    "temperatura": "°C",
    "presion": "kPa",
    "vibracion": "mm/s",
}

TipoSensor = Literal["temperatura", "presion", "vibracion"]


def verificar_valor_en_rango(tipo_sensor: str, valor: float) -> float:
    """Valida que un valor numérico se encuentre dentro del rango de su tipo.

    Args:
        tipo_sensor: Categoría del sensor ('temperatura', 'presion', 'vibracion').
        valor: Valor numérico reportado por el sensor.

    Returns:
        float: El mismo valor si se encuentra dentro del rango permitido.

    Raises:
        ValueError: Si el valor está fuera de los límites definidos en RANGOS.
    """
    if tipo_sensor in RANGOS:
        minimo, maximo = RANGOS[tipo_sensor]
        unidad = UNIDADES.get(tipo_sensor, "")
        if not minimo <= valor <= maximo:
            raise ValueError(
                f"El valor para '{tipo_sensor}' debe estar entre "
                f"{minimo} y {maximo} {unidad} (recibido: {valor})."
            )
    return valor


class SensorBase(BaseModel):
    """Modelo base con los campos comunes de un sensor industrial."""

    tipo: TipoSensor = Field(
        ...,
        description="Tipo de sensor industrial (temperatura, presion, vibracion)",
        examples=["temperatura"],
    )
    valor: float = Field(
        ...,
        description="Lectura numérica del sensor según su unidad física",
        examples=[24.5],
    )
    ubicacion: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Ubicación física del sensor en la planta (1-100 caracteres)",
        examples=["Caldera Principal - Planta Norte"],
    )
    fecha: datetime = Field(
        ...,
        description="Fecha y hora de la lectura en formato ISO 8601 (YYYY-MM-DDTHH:MM:SS)",
        examples=["2026-11-20T14:30:00"],
    )

    @field_validator("ubicacion")
    @classmethod
    def validar_ubicacion_no_vacia(cls, v: str) -> str:
        """Verifica que la ubicación no contenga únicamente espacios en blanco.

        Args:
            v: Cadena de texto con la ubicación del sensor.

        Returns:
            str: Cadena limpia sin espacios extremos.

        Raises:
            ValueError: Si la cadena queda vacía tras eliminar espacios.
        """
        limpia = v.strip()
        if not limpia:
            raise ValueError("La ubicación no puede estar vacía ni contener solo espacios.")
        return limpia

    @field_validator("valor")
    @classmethod
    def validar_rango(cls, v: float, info: ValidationInfo) -> float:
        """Verifica que el valor esté dentro del rango permitido del tipo.

        Args:
            v: Lectura numérica a validar.
            info: Contexto de validación de Pydantic con los campos previos.

        Returns:
            float: Valor validado.

        Raises:
            ValueError: Si el valor excede el mínimo o máximo permitido.
        """
        tipo = info.data.get("tipo")
        if tipo and tipo in RANGOS:
            return verificar_valor_en_rango(tipo, v)
        return v


class SensorCreate(SensorBase):
    """Modelo utilizado para la creación de un nuevo sensor (POST /sensores/)."""

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "tipo": "temperatura",
                "valor": 45.8,
                "ubicacion": "Horno Industrial Sector A",
                "fecha": "2026-11-20T08:30:00",
            }
        }
    )


class SensorUpdate(BaseModel):
    """Modelo utilizado para actualizar un sensor existente por tipo (PUT /sensores/{tipo})."""

    tipo: TipoSensor | None = Field(
        default=None,
        description="Tipo de sensor (opcional en actualización, debe coincidir con la ruta)",
    )
    valor: float = Field(
        ...,
        description="Nuevo valor de lectura del sensor",
        examples=[52.0],
    )
    ubicacion: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Nueva ubicación física del sensor (1-100 caracteres)",
        examples=["Horno Industrial Sector B"],
    )
    fecha: datetime = Field(
        ...,
        description="Fecha y hora actualizada en formato ISO 8601 (YYYY-MM-DDTHH:MM:SS)",
        examples=["2026-11-20T09:15:00"],
    )

    @field_validator("ubicacion")
    @classmethod
    def validar_ubicacion_no_vacia(cls, v: str) -> str:
        """Verifica que la ubicación actualizada no contenga solo espacios.

        Args:
            v: Cadena con la nueva ubicación.

        Returns:
            str: Cadena limpia.

        Raises:
            ValueError: Si la ubicación queda vacía.
        """
        limpia = v.strip()
        if not limpia:
            raise ValueError("La ubicación no puede estar vacía ni contener solo espacios.")
        return limpia

    @field_validator("valor")
    @classmethod
    def validar_rango(cls, v: float, info: ValidationInfo) -> float:
        """Verifica el rango si el campo 'tipo' fue enviado en el cuerpo.

        Args:
            v: Nuevo valor numérico del sensor.
            info: Contexto de validación con los datos del cuerpo.

        Returns:
            float: Valor validado.
        """
        tipo = info.data.get("tipo")
        if tipo and tipo in RANGOS:
            return verificar_valor_en_rango(tipo, v)
        return v

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "valor": 60.5,
                "ubicacion": "Horno Industrial Sector B - Línea 2",
                "fecha": "2026-11-20T10:00:00",
            }
        }
    )


class SensorOut(SensorBase):
    """Modelo de salida que incluye el identificador único de MongoDB serializado."""

    id: str = Field(
        ...,
        description="Identificador único del documento en MongoDB (ObjectId en texto)",
        examples=["673df1a2b3c4d5e6f7a8b9c0"],
    )

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "id": "673df1a2b3c4d5e6f7a8b9c0",
                "tipo": "temperatura",
                "valor": 45.8,
                "ubicacion": "Horno Industrial Sector A",
                "fecha": "2026-11-20T08:30:00",
            }
        }
    )
