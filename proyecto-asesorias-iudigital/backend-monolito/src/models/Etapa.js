/**
 * Modelo Mongoose: Etapa
 * Flujo de avance y control de entregables del proyecto de asesoría académica.
 */
const { Schema, model } = require('mongoose');

const ETAPAS_PERMITIDAS = [
  'anteproyecto',
  'entrega parcial 1',
  'entrega parcial 2',
  'entrega final',
];

const etapaSchema = new Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre de la etapa es obligatorio.'],
      trim: true,
      lowercase: true,
      unique: true,
      enum: {
        values: ETAPAS_PERMITIDAS,
        message:
          "La etapa '{VALUE}' no es válida. Valores permitidos: anteproyecto, entrega parcial 1, entrega parcial 2, entrega final.",
      },
    },
  },
  {
    timestamps: {
      createdAt: 'fechaCreacion',
      updatedAt: 'fechaActualizacion',
    },
    versionKey: false,
  }
);

module.exports = model('Etapa', etapaSchema);
module.exports.ETAPAS_PERMITIDAS = ETAPAS_PERMITIDAS;
