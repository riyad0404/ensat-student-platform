import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Create Sequelize instance with environment variables
const sequelize = new Sequelize({
  username: process.env.DATABASE_USER ,
  password: process.env.DATABASE_PASSWORD ,
  database: process.env.DATABASE_NAME ,
  host: process.env.DATABASE_HOST ,
  dialect: 'postgres',
   logging: false,
  port: process.env.DATABASE_PORT || 5434,
});

export default sequelize;
