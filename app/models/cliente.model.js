// Utilizamos module.exports para exportar el modelo para que pueda ser usado en otras clases
module.exports = (sequelize, Sequelize) => {
  // sequelize.define() define el nombre de la entidad en la BD, en este caso "cliente"
  // Sequelize.<TIPO> define el tipo de dato de cada atributo
  const Cliente = sequelize.define("cliente", {
    nombre: {
      type: Sequelize.STRING
    },
    apellido: {
      type: Sequelize.STRING
    },
    direccion: {
      type: Sequelize.STRING
    },
    correo: {
      type: Sequelize.STRING
    },
    telefono: {
      type: Sequelize.STRING
    },
    ingreso: {
      type: Sequelize.DATE
    },
    status: {
      type: Sequelize.BOOLEAN
    }
  });
  return Cliente;
};