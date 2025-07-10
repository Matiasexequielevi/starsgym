const mongoose = require('mongoose');

const ventaSchema = new mongoose.Schema({
  producto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Producto',
    required: true
  },
  precio: Number,
  metodo: String,
  fecha: {
    type: Date,
    default: () => new Date(new Date().toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" }))
  }
});

module.exports = mongoose.model('Venta', ventaSchema);
