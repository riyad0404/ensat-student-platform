import express from 'express';
import { 
  chat, 
  getConversations, 
  getMessages, 
  deleteConversation,
  createNewConversation 
} from '../Controllers/chatController.js';

const router = express.Router();

// Route principale de chat
router.post('/chat', chat);

// Récupérer toutes les conversations d'un utilisateur
router.get('/conversations/:userId', getConversations);

// Récupérer les messages d'une conversation spécifique
router.get('/conversation/:conversationId/messages', getMessages);

// Créer une nouvelle conversation
router.post('/conversation/new', createNewConversation);

// Supprimer une conversation
router.delete('/conversation/:conversationId', deleteConversation);

export default router;