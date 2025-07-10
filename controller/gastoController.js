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

// Registrar un nuevo gasto (ajuste de fecha seguro)
exports.registrarGasto = async (req, res) => {
  const { concepto, monto, metodo, fecha } = req.body;
  try {
    // Ajustar fecha para que siempre se guarde el día correcto en Argentina
    const partes = fecha.split('-'); // yyyy-mm-dd
    const fechaArgentina = new Date(partes[0], partes[1] - 1, partes[2], 12, 0, 0); // hora 12:00 para evitar desfasaje

    await Gasto.create({ concepto, monto, metodo, fecha: fechaArgentina });
    res.redirect('/gastos');
  } catch (err) {
    res.status(500).send('Error al guardar el gasto');
  }
};

// Eliminar gasto (con clave correcta)
exports.eliminarGastoConClave = async (req, res) => {
  const { id } = req.params;
  const { clave } = req.body;

  if (clave !== '2025') {
    return res.send('Clave incorrecta. No se puede eliminar.');
  }

  try {
    await Gasto.findByIdAndDelete(id);
    res.redirect('/gastos');
  } catch (err) {
    res.status(500).send('Error al eliminar el gasto');
  }
};
