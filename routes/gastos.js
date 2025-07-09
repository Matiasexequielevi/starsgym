// routes/gastos.js
const express = require('express');
const router = express.Router();
const gastoController = require('../controller/gastoController');

// Mostrar formulario + lista de gastos
router.get('/', gastoController.mostrarGastos);

// Guardar nuevo gasto
router.post('/', gastoController.registrarGasto);

// Eliminar gasto con clave
router.post('/eliminar/:id', gastoController.eliminarGastoConClave);

module.exports = router;
