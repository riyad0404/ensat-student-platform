// src/index.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});
