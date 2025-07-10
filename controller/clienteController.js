const Cliente = require('../models/cliente'); 
const whatsappClient = require('../services/whatsapp');

// Mostrar todos los clientes con resumen de pagos y cumpleaños
exports.listarClientes = async (req, res) => {
  const clientes = await Cliente.find().sort({ creadoEn: -1 });

  const ahora = new Date();
  const ahoraArgentina = new Date(ahora.toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" }));
  const hoySinHora = new Date(ahoraArgentina);
  hoySinHora.setHours(0, 0, 0, 0);

  const diaHoy = ahoraArgentina.getDate();
  const mesHoy = ahoraArgentina.getMonth();

  let totalClientes = clientes.length;
  let alDia = 0;
  let vencidos = 0;
  let totalRecaudadoHoy = 0;
  let cumpleañeros = [];
  let proximosCumples = [];

  for (const cliente of clientes) {
    let ultimoPago = null;

    if (cliente.pagos && cliente.pagos.length > 0) {
      ultimoPago = cliente.pagos.reduce((ultimo, actual) => {
        return new Date(actual.fecha) > new Date(ultimo.fecha) ? actual : ultimo;
      });

      cliente.pagos.forEach(p => {
        const fechaPago = new Date(p.fecha);
        fechaPago.setHours(0, 0, 0, 0);
        if (fechaPago.getTime() === hoySinHora.getTime()) {
          totalRecaudadoHoy += p.monto;
        }
      });
    }

    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);

    if (ultimoPago && new Date(ultimoPago.fecha) >= hace30Dias) {
      alDia++;
      cliente.estadoPago = 'aldia';
    } else {
      vencidos++;
      cliente.estadoPago = 'vencido';

      if (
        whatsappClient.client.clientReady &&
        cliente.celular &&
        !cliente.notificado &&
        ultimoPago && new Date(ultimoPago.fecha) < hace30Dias
      ) {
        const mensaje = `Hola ${cliente.nombre}, te recordamos que tu último pago fue hace más de 30 días. ¡Ponete al día con tu entrenamiento en STARS GYM! 💪`;

        try {
          let numero = cliente.celular.replace(/\D/g, '');
          if (!numero.startsWith('549')) {
            numero = '549' + numero;
          }

          await whatsappClient.sendMessage(numero, mensaje);
          console.log(`📤 Mensaje enviado a ${cliente.nombre}`);
          cliente.notificado = true;
          await cliente.save();
        } catch (error) {
          console.error(`❌ Error al enviar mensaje a ${cliente.nombre}:`, error.message);
        }
      }
    }

    // Cumpleaños
    if (cliente.fechaNacimiento) {
      const cumple = new Date(cliente.fechaNacimiento);
      const diaCumple = cumple.getDate();
      const mesCumple = cumple.getMonth();

      if (diaCumple === diaHoy && mesCumple === mesHoy) {
        cumpleañeros.push(cliente.nombre + ' ' + cliente.apellido);
      } else {
        const esteAño = new Date(ahoraArgentina.getFullYear(), mesCumple, diaCumple);
        const diffDias = Math.ceil((esteAño - ahoraArgentina) / (1000 * 60 * 60 * 24));
        if (diffDias > 0 && diffDias <= 5) {
          proximosCumples.push(`${cliente.nombre} ${cliente.apellido} (${diaCumple}/${mesCumple + 1})`);
        }
      }
    }
  }

  clientes.sort((a, b) => {
    if (a.estadoPago === 'vencido' && b.estadoPago !== 'vencido') return -1;
    if (a.estadoPago !== 'vencido' && b.estadoPago === 'vencido') return 1;
    return 0;
  });

  res.render('index', {
    clientes,
    resumen: {
      totalClientes,
      alDia,
      vencidos,
      totalRecaudado: totalRecaudadoHoy
    },
    cumpleañeros,
    proximosCumples
  });
};

// Formulario de alta
exports.formularioNuevo = (req, res) => {
  res.render('nueva');
};

// Guardar nuevo cliente
exports.guardarCliente = async (req, res) => {
  try {
    if (req.body.fechaNacimiento) {
      req.body.fechaNacimiento = new Date(req.body.fechaNacimiento);
    }

    const nuevoCliente = new Cliente(req.body);
    await nuevoCliente.save();
    res.redirect('/');
  } catch (error) {
    console.error('Error al guardar cliente:', error);
    res.status(500).send('Error al guardar cliente');
  }
};

// Formulario de edición
exports.formularioEditar = async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id);
    res.render('editar', { cliente });
  } catch (error) {
    res.status(500).send('Error al cargar cliente');
  }
};

// Actualizar datos
exports.actualizarCliente = async (req, res) => {
  try {
    if (req.body.fechaNacimiento) {
      req.body.fechaNacimiento = new Date(req.body.fechaNacimiento);
    }

    await Cliente.findByIdAndUpdate(req.params.id, req.body);
    res.redirect('/editar/' + req.params.id);
  } catch (error) {
    res.status(500).send('Error al actualizar cliente');
  }
};

// Eliminar cliente
exports.eliminarCliente = async (req, res) => {
  try {
    await Cliente.findByIdAndDelete(req.params.id);
    res.redirect('/');
  } catch (error) {
    res.status(500).send('Error al eliminar cliente');
  }
};

// ✅ Agregar pago con método
exports.agregarPago = async (req, res) => {
  const { fecha, monto, metodo } = req.body;
  try {
    const cliente = await Cliente.findById(req.params.id);
    cliente.pagos.push({ fecha, monto, metodo });
    cliente.notificado = false;
    await cliente.save();
    res.redirect('/editar/' + req.params.id);
  } catch (error) {
    res.status(500).send('Error al agregar pago');
  }
};

// Eliminar pago
exports.eliminarPago = async (req, res) => {
  const { clienteId, pagoId } = req.params;
  try {
    await Cliente.findByIdAndUpdate(clienteId, {
      $pull: { pagos: { _id: pagoId } }
    });
    res.redirect('/editar/' + clienteId);
  } catch (error) {
    res.status(500).send('Error al eliminar el pago');
  }
};

// Reporte de pagos con cajas diarias
exports.reportePagos = async (req, res) => {
  try {
    if (!req.session || !req.session.reportesAutorizado) {
      return res.redirect('/reportes/login');
    }

    const clientes = await Cliente.find();

    const hoy = new Date();
    hoy.setHours(23, 59, 59, 999);

    const hace7Dias = new Date();
    hace7Dias.setDate(hoy.getDate() - 6);
    hace7Dias.setHours(0, 0, 0, 0);

    const desde = req.query.desde
      ? new Date(`${req.query.desde}T00:00:00.000Z`)
      : hace7Dias;

    const hasta = req.query.hasta
      ? new Date(`${req.query.hasta}T23:59:59.999Z`)
      : hoy;

    let pagosFiltrados = [];

    clientes.forEach(cliente => {
      const pagosValidos = cliente.pagos.filter(p => {
        const fechaPago = new Date(p.fecha);
        return fechaPago >= desde && fechaPago <= hasta;
      });

      pagosValidos.forEach(p => {
        pagosFiltrados.push({
          nombre: cliente.nombre + ' ' + cliente.apellido,
          fecha: new Date(p.fecha),
          monto: p.monto,
          metodo: p.metodo || '—'
        });
      });
    });

    pagosFiltrados.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    const total = pagosFiltrados.reduce((acc, pago) => acc + pago.monto, 0);

    const cajas = [];
    const agrupado = {};

    pagosFiltrados.forEach(pago => {
      const clave = pago.fecha.toISOString().split('T')[0];
      if (!agrupado[clave]) agrupado[clave] = 0;
      agrupado[clave] += pago.monto;
    });

    for (const fecha in agrupado) {
      cajas.push({ fecha, total: agrupado[fecha] });
    }

    cajas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    res.render('reportes', {
      pagos: pagosFiltrados,
      total,
      desde: desde.toISOString().split('T')[0],
      hasta: hasta.toISOString().split('T')[0],
      cajas
    });
  } catch (error) {
    console.error('Error en reportePagos:', error);
    res.status(500).send('Error al generar reporte');
  }
};
