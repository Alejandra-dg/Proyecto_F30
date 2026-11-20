/**
 * Modelo Mongoose: Proyecto (Microservicio Desacoplado de Proyectos)
 * Incluye registro de los esquemas de referencia livianos para permitir .populate()
 * de alta velocidad en lecturas además de la validación vía HTTP contra servicio-catalogos.
 */
const { Schema, model, models } = require('mongoose');

// Registro de esquemas de lectura para populate en consultas GET /api/proyectos
if (!models.Cliente) {
  model('Cliente', new Schema({ nombre: String, email: String }, { versionKey: false }));
}
if (!models.TipoProyecto) {
  model('TipoProyecto', new Schema({ nombre: String }, { versionKey: false }));
}
if (!models.Universidad) {
  model(
    'Universidad',
    new Schema({ nombre: String, direccion: String, telefono: String }, { versionKey: false })
  );
}
if (!models.Etapa) {
  model('Etapa', new Schema({ nombre: String }, { versionKey: false }));
}

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
          if (!this.fechaIniciacion || !valorFechaEntrega) return true;
          return new Date(valorFechaEntrega) > new Date(this.fechaIniciacion);
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
    timestamps: { createdAt: 'fechaCreacion', updatedAt: 'fechaActualizacion' },
    versionKey: false,
  }
);

module.exports = model('Proyecto', proyectoSchema);
