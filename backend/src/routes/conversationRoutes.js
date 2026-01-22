
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
  hideConversation,
  unhideConversation,
  joinConversation,
  markConversationAsRead,
   getAvailableGroups
} from '../controllers/conversationController.js';


const router = express.Router();
// Delete conversation (OWNER only)
router.delete('/:id', authMiddleware, deleteConversation);

// Transfer ownership
router.post('/:id/transfer', authMiddleware, transferOwnership);

// Hide/unhide conversation
router.post('/:id/hide', authMiddleware, hideConversation);
router.post('/:id/unhide', authMiddleware, unhideConversation);

// Join conversation
router.post('/:id/join', authMiddleware, joinConversation);

// Mark as read
router.post('/:id/read', authMiddleware, markConversationAsRead);

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
// List available group chats (not DMs, not joined)
router.get('/groups/available', authMiddleware, getAvailableGroups);

export default router;
