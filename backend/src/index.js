// src/index.js
import express from 'express'
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

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

// Tester la connexion à la base de données
sequelize.authenticate()
  .then(() => {
    console.log('Connexion réussie à la base de données');
  })
  .catch((err) => {
    console.error('Impossible de se connecter à la base de données:', err);
  });

// TODO: add routes (auth, posts, documents, search, etc.)

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});

