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
router.post('/editar/:id', verificarSesion, productoController.editarProducto);
router.post('/editar/:id', verificarSesion, productoController.actualizarProducto);


// Eliminar producto
router.post('/eliminar/:id', clienteController.eliminarProductoConClave);

module.exports = router;
