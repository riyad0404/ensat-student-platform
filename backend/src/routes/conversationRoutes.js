import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { checkMember } from '../middleware/checkMember.js';
import { checkOwner } from '../middleware/checkOwner.js';
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
  declineJoinRequest,
  markConversationAsRead,
  getAvailableGroups
} from '../controllers/conversationController.js';

const router = express.Router();

// ---------------------- OWNER ONLY ----------------------
// Delete conversation (OWNER only)
router.delete('/:id', authMiddleware, checkOwner, deleteConversation);

// Transfer ownership
router.post('/:id/transfer', authMiddleware, checkOwner, transferOwnership);

// Membership management (OWNER only)
router.post('/:id/members', authMiddleware, checkOwner, addMember);
router.delete('/:id/members/:userId', authMiddleware, checkOwner, removeMember);

// ---------------------- MEMBER ONLY ----------------------
// Messages
router.get('/:id/messages', authMiddleware, checkMember, getConversationMessages);
router.post('/:id/messages', authMiddleware, checkMember, sendMessage);

// Leave conversation
router.post('/:id/leave', authMiddleware, checkMember, leaveConversation);

// Hide/unhide conversation
router.post('/:id/hide', authMiddleware, checkMember, hideConversation);
router.post('/:id/unhide', authMiddleware, checkMember, unhideConversation);

// Decline join request
router.post('/:id/join/decline', authMiddleware, declineJoinRequest);

// Mark as read
router.post('/:id/read', authMiddleware, checkMember, markConversationAsRead);

// Get a single conversation by ID
router.get('/:id', authMiddleware, checkMember, getSingleConversation);

// ---------------------- PUBLIC / CREATION ----------------------
// Conversations list
router.get('/', authMiddleware, getMyConversations);

// Create / get direct DM
router.post('/direct', authMiddleware, createOrGetDirectConversation);

// Create group
router.post('/group', authMiddleware, createGroupConversation);

// Join conversation
router.post('/:id/join', authMiddleware, joinConversation);

// List available group chats (not DMs, not joined)
router.get('/groups/available', authMiddleware, getAvailableGroups);

// ---------------------- MESSAGE OWNER / SENDER ----------------------
// Edit and delete messages (handled in controller: sender check)
router.delete('/:id/messages/:messageId', authMiddleware, deleteMessage);
router.put('/:id/messages/:messageId', authMiddleware, editMessage);

export default router;
