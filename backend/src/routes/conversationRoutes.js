import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  getMyConversations,
  createOrGetDirectConversation,
  createGroupConversation,
  getConversationMessages,
  sendMessage,
  leaveConversation,
  addMember,
  removeMember,
} from '../controllers/conversationController.js';

const router = express.Router();

// Conversations list
router.get('/', authMiddleware, getMyConversations);

// Create / get direct DM
router.post('/direct', authMiddleware, createOrGetDirectConversation);

// Create group
router.post('/group', authMiddleware, createGroupConversation);

// Messages
router.get('/:id/messages', authMiddleware, getConversationMessages);
router.post('/:id/messages', authMiddleware, sendMessage);

// Membership
router.post('/:id/leave', authMiddleware, leaveConversation);
router.post('/:id/members', authMiddleware, addMember);
router.delete('/:id/members/:userId', authMiddleware, removeMember);

export default router;
