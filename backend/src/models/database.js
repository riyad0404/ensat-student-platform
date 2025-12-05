const { Sequelize } = require('sequelize');  // Utilisation de require au lieu d'import
require('dotenv').config();  // Charger les variables d'environnement

// Créer l'instance Sequelize avec les variables d'environnement
const sequelize = new Sequelize({
  username: process.env.DATABASE_USER || 'postgres',   // Utiliser les variables d'environnement si nécessaire
  password: process.env.DATABASE_PASSWORD || 1234,  // Utiliser les variables d'environnement si nécessaire
  database: process.env.DATABASE_NAME || 'ensat_platform',  // Utiliser les variables d'environnement si nécessaire
  host: process.env.DATABASE_HOST || 'localhost',  // Utiliser les variables d'environnement si nécessaire
  dialect: 'postgres',
  port: process.env.DATABASE_PORT || 5434,  // Utiliser les variables d'environnement si nécessaire
});

module.exports = sequelize;  // Exporter l'instance sequelize pour qu'elle soit accessible dans d'autres fichiers
