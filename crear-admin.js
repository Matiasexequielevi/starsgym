require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Admin = require('./models/Admin');

const crearAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const usuario = 'stargym';
    const clave = 'starsgym123';

    const existe = await Admin.findOne({ usuario });
    if (existe) {
      console.log('Ya existe un usuario administrador.');
      return;
    }

    const hashed = await bcrypt.hash(clave, 10);
    await Admin.create({ usuario, clave: hashed });

    console.log('✅ Usuario administrador creado con éxito.');
    process.exit();
  } catch (err) {
    console.error('❌ Error al crear el admin:', err);
  }
};

crearAdmin();
