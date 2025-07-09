// controller/gastoController.js
const Gasto = require('../models/Gasto');

// Mostrar todos los gastos
exports.mostrarGastos = async (req, res) => {
  try {
    const gastos = await Gasto.find().sort({ fecha: -1 });
    res.render('gastos', { gastos });
  } catch (err) {
    res.status(500).send('Error al cargar los gastos');
  }
};

// Registrar un nuevo gasto
exports.registrarGasto = async (req, res) => {
  const { concepto, monto, metodo, fecha } = req.body;
  try {
    await Gasto.create({ concepto, monto, metodo, fecha });
    res.redirect('/gastos');
  } catch (err) {
    res.status(500).send('Error al guardar el gasto');
  }
};

// Eliminar gasto (solo con clave)
exports.eliminarGastoConClave = async (req, res) => {
  const { id } = req.params;
  const { claveSecreta } = req.body;

  if (claveSecreta !== '2025') {
    return res.send('Clave incorrecta. No se puede eliminar.');
  }

  try {
    await Gasto.findByIdAndDelete(id);
    res.redirect('/gastos');
  } catch (err) {
    res.status(500).send('Error al eliminar el gasto');
  }
};
