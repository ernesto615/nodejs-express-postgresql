// Registro local de cada cobro hecho con Stripe.
// El estado SOLO lo cambia el webhook firmado de Stripe (nunca el cliente).
module.exports = (sequelize, Sequelize) => {
  const Pago = sequelize.define("pago", {
    clienteId: { type: Sequelize.INTEGER, allowNull: false },
    monto: { type: Sequelize.INTEGER, allowNull: false },          // en centavos (5000 = 50.00)
    moneda: { type: Sequelize.STRING, allowNull: false, defaultValue: "usd" },
    descripcion: { type: Sequelize.STRING },
    estado: {
      type: Sequelize.ENUM("pendiente", "pagado", "fallido"),
      allowNull: false,
      defaultValue: "pendiente"
    },
    stripePaymentIntentId: { type: Sequelize.STRING, unique: true }
  });
  return Pago;
};
