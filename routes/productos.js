const express = require('express');
const router = express.Router();
const clienteController = require('../controller/clienteController');

// Mostrar productos
router.get('/', clienteController.mostrarProductos);

// Crear producto
router.get('/nuevo', clienteController.formularioNuevoProducto);
router.post('/nuevo', clienteController.guardarProducto);

// Editar producto
router.get('/editar/:id', clienteController.formularioEditarProducto);
router.post('/editar/:id', clienteController.actualizarProductoConClave);

// Eliminar producto
router.post('/eliminar/:id', clienteController.eliminarProductoConClave);

module.exports = router;
