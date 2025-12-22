import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { urlencoded } from 'express';
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
import userRoutes from './routes/userRoutes.js';
import documentRoutes from "./routes/documentRoutes.js";
import commentRoutes from "./routes/commentroutes.js";
import postRoutes from './routes/postroutes.js';
import './models/associations.js';
import chatRoutes from './routes/chatRoutes.js';
const app = express();
const PORT = process.env.PORT || 5000;



// Global middlewares
app.use(cookieParser());
// CORS for React (important for cookies)
app.use(
  cors({
    origin:'http://localhost:5173', // adapt to your React port if needed
    credentials: true, // allow sending cookies
  })
);

app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));
app.use(express.json());
app.use(urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use("/api/reactions", reactionRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/users", userRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/chat', chatRoutes);



// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    env: process.env.NODE_ENV || 'development',
  });
});

// TODO: add more routes (posts, documents, search, etc.)


// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

let server;

async function start() {
  try {
    // Check DB connectivity
    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    // Start HTTP server
    server = app.listen(PORT, () => {
      console.log(`🚀 Server listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
function gracefulShutdown() {
  console.log('\n🛑 Shutting down gracefully...');
  if (server) {
    server.close(() => {
      console.log('HTTP server closed.');
      sequelize.close().then(() => {
        console.log('Database connection closed.');
        process.exit(0);
      });
    });
  } else {
    process.exit(0);
  }
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

start();
