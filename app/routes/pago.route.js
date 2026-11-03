module.exports = app => {
  const pagos = require("../controllers/pago.controller.js");
  const router = require("express").Router();

  router.post("/", pagos.create);
  router.get("/", pagos.findAll);
  router.get("/:id", pagos.findOne);

  app.use("/api/pagos", router);
};
