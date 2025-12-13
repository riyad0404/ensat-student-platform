import dotenv from 'dotenv';
dotenv.config();              // ✅ TOUJOURS TOUT EN HAUT

import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authroutes.js';
import sequelize from './database.js';
import cookieParser from 'cookie-parser';

const app = express();
const PORT = process.env.PORT || 5000;

// Global middlewares
app.use(cookieParser());
// CORS pour React (important pour les cookies)
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173', // adapter apres au port de ton React
    credentials: true, // autorise l'envoi de cookies
  })
);
app.use(express.json());
app.use('/api/auth', authRoutes);

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
    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    app.listen(PORT, () => {
      console.log(`🚀 Server listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
}

start();
