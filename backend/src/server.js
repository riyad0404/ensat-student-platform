// src/server.js
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
