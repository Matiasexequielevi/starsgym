const express = require('express'); 
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const session = require('express-session');
const clientesRoutes = require('./routes/clientes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// 🔌 Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Conectado a MongoDB'))
.catch(err => console.error('❌ Error al conectar a MongoDB:', err));

// 🔧 Configuración de vistas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 📦 Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 🔐 Configurar sesión
app.use(session({
  secret: 'stars-gym-key', // Clave secreta personalizada
  resave: false,
  saveUninitialized: false
}));

// 🛡 Middleware para proteger rutas privadas
function verificarLogin(req, res, next) {
  if (req.session.usuario) {
    next();
  } else {
    res.redirect('/login');
  }
}

// 🌐 Rutas públicas
app.get('/login', (req, res) => {
  res.render('login', { error: null }); // Muestra error solo si lo hay
});

app.post('/login', (req, res) => {
  const { usuario, clave } = req.body;

  // ✅ Datos de acceso de STARS GYM (hardcodeado)
  if (usuario === 'starsgym' && clave === 'starsgym123') {
    req.session.usuario = usuario;
    res.redirect('/'); // Inicio protegido
  } else {
    res.render('login', { error: 'Usuario o contraseña incorrectos' });
  }
});

// 🔐 Logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

// 🔒 Rutas protegidas
app.use('/', verificarLogin, clientesRoutes);

// ▶️ Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 STARS GYM corriendo en http://localhost:${PORT}`);
});
