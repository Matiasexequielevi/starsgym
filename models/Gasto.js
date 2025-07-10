// models/gasto.js
const mongoose = require('mongoose');

const gastoSchema = new mongoose.Schema({
  concepto: { type: String, required: true },
  monto: { type: Number, required: true },
  metodo: { type: String, enum: ['Efectivo', 'Transferencia'], required: true },
  fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Gasto', gastoSchema);
