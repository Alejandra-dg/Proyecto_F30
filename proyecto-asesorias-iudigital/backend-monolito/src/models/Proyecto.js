/**
 * Modelo Mongoose: Proyecto (Componente Central de Negocio)
 * Núcleo transaccional de asesorías académicas que consolida cliente,
 * tipología, institución universitaria, etapa y rubro económico.
 */
const { Schema, model } = require('mongoose');

const proyectoSchema = new Schema(
  {
    numero: {
      type: String,
      required: [true, 'El número o código de radicado del proyecto es obligatorio.'],
      trim: true,
      unique: true,
    },
    titulo: {
      type: String,
      required: [true, 'El título del proyecto es obligatorio.'],
      trim: true,
      minlength: [5, 'El título del proyecto debe tener al menos 5 caracteres.'],
    },
    fechaIniciacion: {
      type: Date,
      required: [true, 'La fecha de iniciación es obligatoria.'],
    },
    fechaEntrega: {
      type: Date,
      required: [true, 'La fecha de entrega es obligatoria.'],
      validate: {
        validator: function validarFechas(valorFechaEntrega) {
          let fechaInicio = this.fechaIniciacion;
          if (!fechaInicio && typeof this.getUpdate === 'function') {
            const update = this.getUpdate();
            fechaInicio = update?.$set?.fechaIniciacion || update?.fechaIniciacion;
          }
          if (!fechaInicio || !valorFechaEntrega) {
            return true;
          }
          return new Date(valorFechaEntrega) > new Date(fechaInicio);
        },
        message: 'La fecha de entrega debe ser estrictamente posterior a la fecha de iniciación.',
      },
    },
    valor: {
      type: Number,
      required: [true, 'El valor económico de la asesoría es obligatorio.'],
      validate: {
        validator: (v) => typeof v === 'number' && v > 0,
        message: 'El valor económico del proyecto debe ser estrictamente mayor que 0.',
      },
    },
    cliente: {
      type: Schema.Types.ObjectId,
      ref: 'Cliente',
      required: [true, 'La referencia al cliente es obligatoria.'],
    },
    tipoProyecto: {
      type: Schema.Types.ObjectId,
      ref: 'TipoProyecto',
      required: [true, 'La referencia al tipo de proyecto es obligatoria.'],
    },
    universidad: {
      type: Schema.Types.ObjectId,
      ref: 'Universidad',
      required: [true, 'La referencia a la universidad es obligatoria.'],
    },
    etapa: {
      type: Schema.Types.ObjectId,
      ref: 'Etapa',
      required: [true, 'La referencia a la etapa del proyecto es obligatoria.'],
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

module.exports = model('Proyecto', proyectoSchema);
