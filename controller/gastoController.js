// controller/gastoController.js
const Gasto = require('../models/gasto');

// Mostrar todos los gastos
exports.mostrarGastos = async (req, res) => {
  try {
    const gastos = await Gasto.find().sort({ fecha: -1 });
    res.render('gastos', { gastos });
  } catch (err) {
    res.status(500).send('Error al cargar los gastos');
  }
};

// Registrar un nuevo gasto (con fecha en hora Argentina)
exports.registrarGasto = async (req, res) => {
  const { concepto, monto, metodo, fecha } = req.body;
  try {
    const fechaArgentina = new Date(new Date(fecha).toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" }));
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
