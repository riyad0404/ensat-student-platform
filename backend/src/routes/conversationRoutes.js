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
  deleteConversation,
  transferOwnership,
  deleteMessage,
  editMessage,
  getSingleConversation,
} from '../controllers/conversationController.js';


const router = express.Router();
// Delete conversation (OWNER only)
router.delete('/:id', authMiddleware, deleteConversation);

// Transfer ownership
router.post('/:id/transfer', authMiddleware, transferOwnership);
// Conversations list
router.get('/', authMiddleware, getMyConversations);

// Create / get direct DM
router.post('/direct', authMiddleware, createOrGetDirectConversation);

// Create group
router.post('/group', authMiddleware, createGroupConversation);

// Messages
router.get('/:id/messages', authMiddleware, getConversationMessages);
router.post('/:id/messages', authMiddleware, sendMessage);

// Edit and delete messages
router.delete('/:id/messages/:messageId', authMiddleware, deleteMessage);
router.put('/:id/messages/:messageId', authMiddleware, editMessage);

// Membership
router.post('/:id/leave', authMiddleware, leaveConversation);
router.post('/:id/members', authMiddleware, addMember);
router.delete('/:id/members/:userId', authMiddleware, removeMember);

// Get a single conversation by ID
router.get('/:id', authMiddleware, getSingleConversation);

export default router;
