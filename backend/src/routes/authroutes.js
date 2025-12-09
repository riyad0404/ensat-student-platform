import express from 'express';
import {login,register} from '../controllers/authControllers.js';
const router=express.Router();

// Route pour l'inscription
router.post('/signup',register);
// Route pour la connexion
router.post('/login',login);
export default router;