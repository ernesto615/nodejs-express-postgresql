// Único lugar que habla con Stripe. La clave secreta vive solo en variables de entorno.
const Stripe = require("stripe");

let client = null;
function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Falta STRIPE_SECRET_KEY en las variables de entorno");
  }
  if (!client) client = new Stripe(process.env.STRIPE_SECRET_KEY);
  return client;
}

exports.createPaymentIntent = ({ monto, moneda, descripcion, metadata, idempotencyKey }) =>
  getStripe().paymentIntents.create(
    {
      amount: monto,
      currency: moneda,
      description: descripcion,
      metadata,
      automatic_payment_methods: { enabled: true }
    },
    { idempotencyKey }
  );

// Verifica la firma del webhook. Si la firma no coincide lanza error.
exports.constructEvent = (rawBody, signature) =>
  getStripe().webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
