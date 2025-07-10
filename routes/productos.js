const express = require('express');
const router = express.Router();
const productoController = require('../controller/productoController');

// Mostrar listado de productos
router.get('/', productoController.mostrarProductos);

// Formulario nuevo producto
router.get('/nuevo', productoController.formularioNuevoProducto);
router.post('/nuevo', productoController.guardarProducto);

// Formulario para editar producto
router.get('/editar/:id', productoController.formularioEditarProducto);
router.post('/editar/:id', productoController.actualizarProductoConClave);

// Eliminar producto con clave
router.post('/eliminar/:id', productoController.eliminarProductoConClave);

module.exports = router;
