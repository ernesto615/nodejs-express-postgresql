module.exports = app => {
  const clientes = require("../controllers/cliente.controller.js");
  var router = require("express").Router();

  // Create a new Client
  router.post("/create/", clientes.create);
  // Retrieve all Clients
  router.get("/", clientes.findAll);
  // Retrieve all active Clients
  router.get("/status", clientes.findAllStatus);
  // Retrieve a single Client by id
  router.get("/:id", clientes.findOne);
  // Update a Client by id
  router.put("/update/:id", clientes.update);
  // Delete a Client by id
  router.delete("/delete/:id", clientes.delete);
  // Delete all Clients
  router.delete("/delete/", clientes.deleteAll);

  // app.use("/prefijo", router) simplifica el URI final
  // Ej. http://localhost:puerto/api/customer/
  app.use("/api/customer", router);
};