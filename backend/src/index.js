import express from 'express'
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './models/database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Global middlewares
app.use(cors());
app.use(express.json());

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    env: process.env.NODE_ENV || 'development',
  });
});

// TODO: add routes (auth, posts, documents, search, etc.)

async function start() {
  try {
    // 1. Check DB connectivity
    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    // 2. Sync models → create/alter tables
    await sequelize.sync({ alter: true });
    console.log('✅ Models synchronized with database.');

    // 3. Start HTTP server
    app.listen(PORT, () => {
      console.log(`🚀 Server listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
}

start();
