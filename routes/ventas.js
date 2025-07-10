const express = require('express');
const router = express.Router();
const ventaController = require('../controller/ventaController');
const Producto = require('../models/Producto');

// Vista de ventas con productos
router.get('/', async (req, res) => {
  const productos = await Producto.find().sort({ nombre: 1 });
  res.render('ventas', { productos });
});

// Registrar venta
router.post('/realizar', ventaController.realizarVenta);

// Historial de ventas (opcional)
router.get('/historial', ventaController.listarVentas);

module.exports = router;
