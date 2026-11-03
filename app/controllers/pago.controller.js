const db = require("../models");
const stripeService = require("../services/stripe.service");
const Pago = db.pagos;
const Cliente = db.clientes;

// El monto lo define el SERVIDOR (nunca el navegador). En centavos.
const MONTO = parseInt(process.env.PAGO_MONTO_CENTAVOS || "5000", 10);
const MONEDA = (process.env.PAGO_MONEDA || "usd").toLowerCase();

// POST /api/pagos   body: { clienteId }
// Crea el PaymentIntent y devuelve el client_secret (el frontend lo usa con Stripe Elements).
exports.create = async (req, res) => {
  try {
    const clienteId = parseInt(req.body.clienteId, 10);
    if (!clienteId) return res.status(400).send({ message: "clienteId es obligatorio" });

    const cliente = await Cliente.findByPk(clienteId);
    if (!cliente) return res.status(404).send({ message: "Cliente no encontrado" });

    const pago = await Pago.create({
      clienteId,
      monto: MONTO,
      moneda: MONEDA,
      descripcion: `Pago de ${cliente.nombre} ${cliente.apellido || ""}`.trim()
    });

    const intent = await stripeService.createPaymentIntent({
      monto: pago.monto,
      moneda: pago.moneda,
      descripcion: pago.descripcion,
      metadata: { pagoId: String(pago.id), clienteId: String(clienteId) },
      idempotencyKey: `pago-${pago.id}`
    });

    await pago.update({ stripePaymentIntentId: intent.id });
    res.status(201).send({ pagoId: pago.id, clientSecret: intent.client_secret, monto: pago.monto, moneda: pago.moneda });
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al crear el pago" });
  }
};

// GET /api/pagos/:id  -> consultar el estado
exports.findOne = async (req, res) => {
  try {
    const pago = await Pago.findByPk(req.params.id);
    if (!pago) return res.status(404).send({ message: "Pago no encontrado" });
    res.send(pago);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// GET /api/pagos  (opcional ?clienteId=)
exports.findAll = async (req, res) => {
  try {
    const where = req.query.clienteId ? { clienteId: req.query.clienteId } : {};
    res.send(await Pago.findAll({ where, order: [["id", "DESC"]] }));
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// POST /api/pagos/webhook  (llega con el body CRUDO, ver server.js)
exports.webhook = async (req, res) => {
  let event;
  try {
    event = stripeService.constructEvent(req.body, req.headers["stripe-signature"]);
  } catch (err) {
    return res.status(400).send(`Firma inválida: ${err.message}`);
  }

  try {
    const obj = event.data.object;
    if (event.type === "payment_intent.succeeded" || event.type === "payment_intent.payment_failed") {
      const nuevo = event.type === "payment_intent.succeeded" ? "pagado" : "fallido";
      const pago = await Pago.findOne({ where: { stripePaymentIntentId: obj.id } });
      // Idempotente: Stripe puede reenviar el evento; un pago ya "pagado" no se toca.
      if (pago && pago.estado !== "pagado") await pago.update({ estado: nuevo });
    }
    res.send({ received: true });
  } catch (err) {
    res.status(500).send({ message: err.message }); // Stripe reintentará
  }
};
