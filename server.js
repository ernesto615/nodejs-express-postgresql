// IMPORTANTE: dotenv debe cargarse antes que cualquier require que dependa de process.env
// (por eso "./app/models" se importa después de esta línea).
const dotenv = require("dotenv");
const envFile = process.env.NODE_ENV === "production" ? ".env.production" : ".env.development";
dotenv.config({ path: envFile });

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

var corsOptions = {
  origin: "http://localhost:8081"
};

app.use(cors(corsOptions));

// Parsear requests de tipo application/json
app.use(bodyParser.json());

// Parsear requests de tipo application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

const db = require("./app/models");
db.sequelize.sync();
// // Si necesitas recrear las tablas desde cero (¡cuidado, borra los datos!):
// db.sequelize.sync({ force: true }).then(() => {
//   console.log("Drop and re-sync db.");
// });

// Ruta simple de prueba
app.get("/", (req, res) => {
  res.json({ message: "UMG Web Application", ambiente: process.env.NODE_ENV || "development" });
});

require("./app/routes/cliente.route")(app);
// Si agregas más recursos (ej. tutorial), regístralos igual:
// require("./app/routes/tutorial.route")(app);

// A partir del Paso 12 y 13 también registrarás aquí:
// require("./app/routes/auth.route")(app);
// require("./app/routes/pago.route")(app);

// Set port, listen for requests
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} [ambiente: ${process.env.NODE_ENV || "development"}].`);
});