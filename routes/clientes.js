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

// Reportes
router.get('/reportes', verificarSesion, clienteController.reportePagos);

// Login - GET
router.get('/login', (req, res) => {
  res.render('login', { error: null }); // para mostrar errores si hay
});

// Login - POST
router.post('/login', (req, res) => {
  const { usuario, clave } = req.body;

  // ✅ Autenticación simple
  if (usuario === 'starsgym' && clave === 'starsgym123') {
    req.session.usuario = usuario;
    res.redirect('/'); // O /index si querés una ruta específica
  } else {
    res.render('login', { error: 'Usuario o contraseña incorrectos' });
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

module.exports = router;
