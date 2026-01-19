import { Server } from "socket.io";
let io;
const onlineUsers = new Map(); // userId -> socketId
// src/server.js
import "./models/associations.js";
import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import sequelize from "./database.js";

const PORT = process.env.PORT || 5000;

let server;

async function start() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection established.");

    server = app.listen(PORT, () => {
      console.log(`🚀 Server listening on http://localhost:${PORT}`);
    });
    // Attach Socket.io after server is created
    io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        credentials: true,
      },
    });

    // --- SOCKET.IO USER PRESENCE & ROOMS ---
    io.on("connection", (socket) => {
      // Quand un utilisateur se connecte (après login)
      socket.on("user_connected", (userId) => {
        onlineUsers.set(String(userId), socket.id);
        io.emit("user_online", userId); // Prévenir tout le monde
      });

      // Rejoindre une conversation
      socket.on("join_conversation", (room) => {
        socket.join(String(room));
      });

      // Quitter une conversation
      socket.on("leave_conversation", (room) => {
        socket.leave(String(room));
      });

      // Gérer "En train d'écrire"
      socket.on("typing", (data) => {
        // data = { conversationId, userId, name }
        socket.to(String(data.conversationId)).emit("typing", data);
      });

      socket.on("stop_typing", (data) => {
        socket.to(String(data.conversationId)).emit("stop_typing", data);
      });

      // Vérifier si un utilisateur spécifique est en ligne
      socket.on("check_online", (targetUserId) => {
        const isOnline = onlineUsers.has(String(targetUserId));
        if (isOnline) {
          socket.emit("user_online", targetUserId);
        } else {
          socket.emit("user_offline", targetUserId);
        }
      });

      // Déconnexion
      socket.on("disconnect", () => {
        for (const [userId, socketId] of onlineUsers.entries()) {
          if (socketId === socket.id) {
            onlineUsers.delete(userId);
            io.emit("user_offline", userId);
            break;
          }
        }
      });
    });
  
  } catch (error) {
    console.error("❌ Unable to start server:", error);
    process.exit(1);
  }
}

function gracefulShutdown() {
  console.log("\n🛑 Shutting down gracefully...");
  if (server) {
    server.close(() => {
      console.log("HTTP server closed.");
      sequelize.close().then(() => {
        console.log("Database connection closed.");
        process.exit(0);
      });
    });
  } else {
    process.exit(0);
  }
}

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

start();

// Export io and onlineUsers for use in controllers/services
export { io, onlineUsers };
