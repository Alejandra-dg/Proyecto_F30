/**
 * Modelo Mongoose: TipoProyecto (Microservicio de Catálogos)
 */
const { Schema, model } = require('mongoose');

const TIPOS_PERMITIDOS = [
  'ensayo',
  'artículo',
  'monografía',
  'trabajo final de pregrado',
  'trabajo final de especialización',
];

const tipoProyectoSchema = new Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre del tipo de proyecto es obligatorio.'],
      trim: true,
      lowercase: true,
      unique: true,
      enum: {
        values: TIPOS_PERMITIDOS,
        message:
          "El tipo de proyecto '{VALUE}' no es válido. Valores permitidos: ensayo, artículo, monografía, trabajo final de pregrado, trabajo final de especialización.",
      },
    },
  },
  {
    timestamps: { createdAt: 'fechaCreacion', updatedAt: 'fechaActualizacion' },
    versionKey: false,
  }
);

module.exports = model('TipoProyecto', tipoProyectoSchema);
