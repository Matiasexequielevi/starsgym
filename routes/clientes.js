const express = require('express');
const router = express.Router();
const clienteController = require('../controller/clienteController');

// Middleware para proteger rutas
function verificarSesion(req, res, next) {
  if (req.session && req.session.usuario) {
    next();
  } else {
    res.redirect('/login');
  }
}

// Ruta principal protegida
router.get('/', verificarSesion, clienteController.listarClientes);

// Formulario para nuevo cliente
router.get('/nueva', verificarSesion, clienteController.formularioNuevo);
router.post('/nueva', verificarSesion, clienteController.guardarCliente);

// Editar cliente
router.get('/editar/:id', verificarSesion, clienteController.formularioEditar);
router.post('/editar/:id', verificarSesion, clienteController.actualizarCliente);

// Eliminar cliente
router.post('/eliminar/:id', verificarSesion, clienteController.eliminarCliente);

// Pagos
router.post('/agregar-pago/:id', verificarSesion, clienteController.agregarPago);
router.post('/eliminar-pago/:clienteId/:pagoId', verificarSesion, clienteController.eliminarPago);

// Login - GET
router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

// Login - POST
router.post('/login', (req, res) => {
  const { usuario, clave } = req.body;

  if (usuario === 'starsgym' && clave === 'starsgym123') {
    req.session.usuario = usuario;
    res.redirect('/');
  } else {
    res.render('login', { error: 'Usuario o contraseña incorrectos' });
  }
});

// Verificación adicional para reportes (clave 2025)
router.get('/reporte-verificar', verificarSesion, (req, res) => {
  res.render('verificarClave', { error: null });
});

router.post('/reporte-verificar', verificarSesion, (req, res) => {
  const { claveSecreta } = req.body;

  if (claveSecreta === '2025') {
    req.session.reportesAutorizado = true;
    return res.redirect('/reportes');
  } else {
    return res.render('verificarClave', { error: 'Clave incorrecta' });
  }
});

// Ruta de reportes protegida
router.get('/reportes', verificarSesion, (req, res) => {
  if (req.session.reportesAutorizado) {
    return clienteController.reportePagos(req, res);
  } else {
    return res.redirect('/reporte-verificar');
  }
});

// Productos
router.get('/productos', verificarSesion, clienteController.mostrarProductos);
router.post('/productos/nuevo', verificarSesion, clienteController.guardarProducto);
router.get('/productos/editar/:id', verificarSesion, clienteController.formularioEditarProducto);
router.post('/productos/editar/:id', verificarSesion, clienteController.actualizarProductoConClave);
router.post('/productos/eliminar/:id', verificarSesion, clienteController.eliminarProductoConClave);

// Ventas
// Ventas
router.get('/ventas', verificarSesion, clienteController.listarVentas); // ✅ corregido
router.post('/ventas', verificarSesion, clienteController.realizarVenta);
router.get('/ventas/historial', verificarSesion, clienteController.listarVentas);

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

module.exports = router;
