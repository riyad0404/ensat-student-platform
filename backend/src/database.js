// src/database.js
import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config(); // Charger le fichier .env

const sequelize = new Sequelize({
  username: process.env.DATABASE_USER,       
  password: process.env.DATABASE_PASSWORD,    
  database: process.env.DATABASE_NAME,        
  host: process.env.DATABASE_HOST,            
  dialect: "postgres",                        
  logging: false,                             
  port: process.env.DATABASE_PORT || 5432,    
});

export default sequelize;
