// config/database.js
const mongoose = require('mongoose');
require('dotenv').config();

// Configura la URL de la base de datos (puede ser en tu servidor local o en la nube)
const dbURI = process.env.MONGODB_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(dbURI, {});
    console.log('Conexión a la base de datos exitosa');
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error);
    process.exit(1); // Salir con error si la conexión falla
  }
};

module.exports = connectDB;