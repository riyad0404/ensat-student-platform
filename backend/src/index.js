import dotenv from 'dotenv';
dotenv.config();

import express, { urlencoded } from 'express'
import cors from 'cors';
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import authRoutes from './routes/authroutes.js';
import sequelize from './database.js';
import cookieParser from 'cookie-parser';
import conversationRoutes from './routes/conversationRoutes.js';
import reactionRoutes from "./routes/reactionroutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import commentRoutes from "./routes/commentroutes.js";
import postRoutes from './routes/postroutes.js';
import './models/associations.js';
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

app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use("/api/reactions", reactionRoutes);
app.use("/api/documents", documentRoutes);

app.use('/api/conversations', conversationRoutes);


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
