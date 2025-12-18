import dotenv from 'dotenv';

import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env from project root (not src/)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });


export default {
  development: {
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    host: process.env.DATABASE_HOST,
    dialect: 'postgres',
    port: process.env.DATABASE_PORT,
  },
  test: {
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: `${process.env.DATABASE_NAME}_test`,
    host: process.env.DATABASE_HOST,
    dialect: 'postgres',
    port: process.env.DATABASE_PORT,
  },
  production: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
  },
  docker: {
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || 'ensa_platform',
    host: process.env.DATABASE_HOST || 'postgres',
    port: process.env.DATABASE_PORT || 5432,
    dialect: 'postgres',
  },
};