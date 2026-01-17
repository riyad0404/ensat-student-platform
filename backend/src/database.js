// src/database.js
import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const isTest = process.env.NODE_ENV === "test";

const dbName = isTest
  ? `${process.env.DATABASE_NAME}_test`
  : process.env.DATABASE_NAME;

const sequelize = new Sequelize({
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: dbName,
  host: process.env.DATABASE_HOST,
  dialect: "postgres",
  logging: false,
  port: process.env.DATABASE_PORT || 5432,
});

export default sequelize;
