const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema({
  // Datos personales
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  edad: { type: Number, required: true },
  fechaNacimiento: { type: Date },
  celular: { type: String, required: true },
  direccion: { type: String, required: true },

  // Fechas clave
  fechaInicio: { type: Date, required: true },
  fechaPago: { type: Date, required: true },

  // Plan contratado
  plan: {
    type: String,
    enum: ['Básico', 'Intermedio', 'Full'],
    required: true
  },

  // Asistencia semanal y contador total
  asistencia: {
    semanal: {
      lunes: { type: Boolean, default: false },
      martes: { type: Boolean, default: false },
      miercoles: { type: Boolean, default: false },
      jueves: { type: Boolean, default: false },
      viernes: { type: Boolean, default: false }
    },
    totalAsistencias: { type: Number, default: 0 }
  },

  // Historial de pagos
  pagos: [{
    fecha: { type: Date, required: true },
    monto: { type: Number, required: true }
  }],

  // Plan de entrenamiento personalizado por día
  planLunes:     { type: String, default: '' },
  planMartes:    { type: String, default: '' },
  planMiercoles: { type: String, default: '' },
  planJueves:    { type: String, default: '' },
  planViernes:   { type: String, default: '' },

  // Control de notificación por WhatsApp
  notificado: { type: Boolean, default: false },

  // Fecha de creación del registro
  creadoEn: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Cliente', clienteSchema);
