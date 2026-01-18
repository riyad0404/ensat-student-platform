import dotenv from 'dotenv';
import { Server } from 'socket.io';
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
import notificationRoutes from "./routes/notificationroutes.js";
import userRoutes from './routes/userRoutes.js';
import documentRoutes from "./routes/documentRoutes.js";
import commentRoutes from "./routes/commentroutes.js";
import postRoutes from './routes/postroutes.js';
import './models/associations.js';
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
app.use("/api/notifications", notificationRoutes);
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
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5174',
    credentials: true,
  }
});
// Stocker les utilisateurs en ligne
let onlineUsers = {}; // { userId: socketId }

io.on('connection', (socket) => {
  console.log('Utilisateur connecté:', socket.id);

  // Quand un utilisateur se connecte, il envoie son ID
  socket.on('user_connected', (userId) => {
    onlineUsers[userId] = socket.id;
    console.log('Utilisateurs en ligne:', onlineUsers);
  });

  // Déconnexion
  socket.on('disconnect', () => {
    for (let key in onlineUsers) {
      if (onlineUsers[key] === socket.id) delete onlineUsers[key];
    }
    console.log('Utilisateur déconnecté:', socket.id);
  });
});

// Exporter io et onlineUsers pour pouvoir les utiliser dans d'autres fichiers
export { io, onlineUsers };

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
