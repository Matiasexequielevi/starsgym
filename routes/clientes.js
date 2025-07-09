const express = require('express');
const router = express.Router();
const clienteController = require('../controller/clienteController');

// Middleware para proteger reportes (requiere sesión iniciada)
function verificarSesion(req, res, next) {
  if (req.session && req.session.usuario) {
    next();
  } else {
    res.redirect('/login');
  }
}

// Ruta principal: mostrar todos los clientes
router.get('/', clienteController.listarClientes);

// Formulario para nuevo cliente
router.get('/nueva', clienteController.formularioNuevo);
router.post('/nueva', clienteController.guardarCliente);

// Editar cliente
router.get('/editar/:id', clienteController.formularioEditar);
router.post('/editar/:id', clienteController.actualizarCliente);

// Eliminar cliente
router.post('/eliminar/:id', clienteController.eliminarCliente);

// Pagos
router.post('/agregar-pago/:id', clienteController.agregarPago);
router.post('/eliminar-pago/:clienteId/:pagoId', clienteController.eliminarPago);

// Reportes (protegido con login)
router.get('/reportes', verificarSesion, clienteController.reportePagos);

// Login
router.get('/login', (req, res) => {
  res.render('login');
});

router.post('/login', (req, res) => {
  const { usuario, clave } = req.body;

  // ✅ Simple login hardcodeado (puede reemplazarse por DB)
  if (usuario === 'starsgym' && contrasena === 'starsgym123') {
    req.session.usuario = usuario;
    res.redirect('/index');
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
