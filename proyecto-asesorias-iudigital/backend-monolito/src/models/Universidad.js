/**
 * Modelo Mongoose: Universidad
 * Institución universitaria de procedencia del cliente o proyecto de asesoría.
 */
const { Schema, model } = require('mongoose');

const universidadSchema = new Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre de la universidad es obligatorio.'],
      trim: true,
      unique: true,
    },
    direccion: {
      type: String,
      required: [true, 'La dirección de la universidad es obligatoria.'],
      trim: true,
    },
    telefono: {
      type: String,
      required: [true, 'El teléfono de la universidad es obligatorio.'],
      trim: true,
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

module.exports = model('Universidad', universidadSchema);
