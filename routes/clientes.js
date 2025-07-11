const express = require('express');
const router = express.Router();
const clienteController = require('../controller/clienteController');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');

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

// Login - POST (con base de datos y bcrypt)
router.post('/login', async (req, res) => {
  const { usuario, clave } = req.body;
  const admin = await Admin.findOne({ usuario });

  if (admin && await bcrypt.compare(clave, admin.clave)) {
    req.session.usuario = usuario;
    res.redirect('/');
  } else {
    res.render('login', { error: 'Usuario o contraseña incorrectos' });
  }
});

// Perfil del administrador (ver y cambiar contraseña)
router.get('/perfil', verificarSesion, (req, res) => {
  res.render('perfil', { mensaje: null });
});

router.post('/perfil', verificarSesion, async (req, res) => {
  const { claveActual, nuevaClave } = req.body;
  const admin = await Admin.findOne({ usuario: req.session.usuario });

  if (!admin || !(await bcrypt.compare(claveActual, admin.clave))) {
    return res.render('perfil', { mensaje: '❌ Contraseña actual incorrecta' });
  }

  const nuevoHash = await bcrypt.hash(nuevaClave, 10);
  admin.clave = nuevoHash;
  await admin.save();

  res.render('perfil', { mensaje: '✅ Contraseña actualizada correctamente' });
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
router.post('/productos/editar/:id', verificarSesion, clienteController.actualizarProducto);
router.post('/productos/eliminar/:id', verificarSesion, clienteController.eliminarProductoConClave);

// Ventas
router.get('/ventas', verificarSesion, clienteController.listarVentas);
router.post('/ventas/realizar', verificarSesion, clienteController.realizarVenta);

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

module.exports = router;
