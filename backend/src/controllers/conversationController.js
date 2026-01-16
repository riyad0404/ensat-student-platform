/**
 * 9) DELETE /api/conversations/:id
 * OWNER can delete the conversation (hard delete)
 */
export const deleteConversation = async (req, res) => {
  try {
    const myUserId = req.user.iduser;
    const idconversation = Number(req.params.id);
    // Fetch conversation to check type
    const conv = await Conversation.findByPk(idconversation);
    if (!conv) return res.status(404).json({ message: 'Conversation not found' });
    if (conv.type !== 'GROUP') {
      return res.status(403).json({ message: 'Direct messages cannot be deleted' });
    }
    // Now check owner
    const owner = await requireOwner(idconversation, myUserId);
    if (!owner) return res.status(403).json({ message: 'Only owner can delete the conversation' });
    // Delete conversation (cascades to members/messages)
    await Conversation.destroy({ where: { idconversation } });
    return res.status(200).json({ message: 'Conversation deleted' });
  } catch (error) {
    console.error('deleteConversation error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * 10) POST /api/conversations/:id/transfer
 * OWNER can transfer ownership to another member
 * Body: { newOwnerId }
 */
export const transferOwnership = async (req, res) => {
  try {
    const myUserId = req.user.iduser;
    const idconversation = Number(req.params.id);
    const { newOwnerId } = req.body;
    if (!newOwnerId || Number(newOwnerId) === myUserId) {
      return res.status(400).json({ message: 'Invalid new owner' });
    }
    // Must be owner
    const owner = await requireOwner(idconversation, myUserId);
    if (!owner) return res.status(403).json({ message: 'Only owner can transfer ownership' });
    // New owner must be a member
    const newOwner = await requireMembership(idconversation, newOwnerId);
    if (!newOwner) return res.status(404).json({ message: 'New owner must be a member' });
    // Update roles
    owner.role = 'MEMBER';
    await owner.save();
    newOwner.role = 'OWNER';
    await newOwner.save();
    return res.status(200).json({ message: 'Ownership transferred' });
  } catch (error) {
    console.error('transferOwnership error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
import { Conversation, ConversationMember, Message, User } from '../models/associations.js';
import { Op } from 'sequelize';
import sequelize from '../database.js';

/**
 * Small helper: checks if a user is an active member of a conversation
 */
const requireMembership = async (idconversation, iduser) => {
  return ConversationMember.findOne({
    where: { idconversation, iduser, leftAt: null },
  });
};

/**
 * Small helper: checks if user is OWNER in a group
 */
const requireOwner = async (idconversation, iduser) => {
  return ConversationMember.findOne({
    where: { idconversation, iduser, leftAt: null, role: 'OWNER' },
  });
};

/**
 * 1) GET /api/conversations
 * List my conversations with members + last message preview + unreadCount
 */
export const getMyConversations = async (req, res) => {
  try {
    const myUserId = req.user.iduser;

    const memberships = await ConversationMember.findAll({
      where: { iduser: myUserId, leftAt: null },
      attributes: ['idconversation', 'lastReadAt'],
    });

    const ids = memberships.map((m) => m.idconversation);
    const membershipMap = {};
    memberships.forEach(m => {
      membershipMap[m.idconversation] = m.lastReadAt;
    });

    if (ids.length === 0) return res.status(200).json([]);

    const conversations = await Conversation.findAll({
      where: { idconversation: { [Op.in]: ids } },
      order: [['updatedAt', 'DESC']],
      include: [
        {
          model: ConversationMember,
          where: { leftAt: null },
          required: false,
          attributes: ['iduser', 'role', 'joinedAt', 'leftAt'],
          include: [{ model: User, attributes: ['iduser', 'nom', 'prenom', 'photo', 'niveau'] }],
        },
        {
          model: Message,
          limit: 1,
          separate: true,
          order: [['sentAt', 'DESC']],
          attributes: ['idmessage', 'content', 'sentAt', 'senderId'],
        },
        ],
    });

    const result = await Promise.all(conversations.map(async (conv) => {

      // Include role and joinedAt/leftAt for each member
      const members = (conv.conversation_members || []).map((cm) => ({
        iduser: cm.user.iduser,
        nom: cm.user.nom,
        prenom: cm.user.prenom,
        photo: cm.user.photo,
        niveau: cm.user.niveau,
        role: cm.role,
        joinedAt: cm.joinedAt,
        leftAt: cm.leftAt,
      }));

      const lastMessage = conv.messages?.[0]
        ? {
            idmessage: conv.messages[0].idmessage,
            content: conv.messages[0].content,
            sentAt: conv.messages[0].sentAt,
            senderId: conv.messages[0].senderId,
          }
        : null;

      // Calculate unreadCount
      const lastReadAt = membershipMap[conv.idconversation];
      const unreadCount = await Message.count({
        where: {
          idconversation: conv.idconversation,
          sentAt: lastReadAt ? { [Op.gt]: lastReadAt } : undefined,
        },
      });

      let otherUser = null;
      let title = conv.name || null;

      if (conv.type === 'DIRECT') {
        otherUser = members.find((u) => u.iduser !== myUserId) || null;
        title = otherUser ? `${otherUser.prenom} ${otherUser.nom}` : 'Direct Chat';
      }

      if (conv.type === 'GROUP') {
        title = conv.name || 'Group';
      }

      return {
        idconversation: conv.idconversation,
        type: conv.type,
        title,
        description: conv.description || null,
        createdBy: conv.createdBy,
        members,
        otherUser,
        lastMessage,
        unreadCount,
        updatedAt: conv.updatedAt,
      };
    }));

    return res.status(200).json(result);
  } catch (error) {
    console.error('getMyConversations error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};


/**
 * 2) POST /api/conversations/direct
 * Create or return an existing DM between current user and otherUserId
 */
export const createOrGetDirectConversation = async (req, res) => {
  try {
    const myUserId = req.user.iduser;
    const { otherUserId } = req.body;

    if (!otherUserId || Number(otherUserId) === myUserId) {
      return res.status(400).json({ message: 'Invalid otherUserId' });
    }

    // Confirm the other user exists
    const otherUser = await User.findByPk(otherUserId, {
      attributes: ['iduser', 'nom', 'prenom', 'photo', 'niveau'],
    });
    if (!otherUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    /**
     * Find existing DIRECT conversation between the two users.
     * We do this by finding DIRECT conversations where BOTH users are members.
     */
    const myDirectMemberships = await ConversationMember.findAll({
      where: { iduser: myUserId, leftAt: null },
      attributes: ['idconversation'],
      include: [{ model: Conversation, where: { type: 'DIRECT' }, attributes: ['idconversation'] }],
    });

    const candidateIds = myDirectMemberships.map((m) => m.idconversation);
    if (candidateIds.length > 0) {
      const existing = await ConversationMember.findOne({
        where: {
          idconversation: { [Op.in]: candidateIds },
          iduser: otherUserId,
          leftAt: null,
        },
      });

      if (existing) {
        return res.status(200).json({ idconversation: existing.idconversation, type: 'DIRECT' });
      }
    }

    // Create new DIRECT conversation
    const conv = await Conversation.create({
      type: 'DIRECT',
      name: null,
      description: null,
      createdBy: myUserId,
    });

    // Add both members
    await ConversationMember.bulkCreate([
      { idconversation: conv.idconversation, iduser: myUserId, role: 'MEMBER' },
      { idconversation: conv.idconversation, iduser: otherUserId, role: 'MEMBER' },
    ]);

    return res.status(201).json({ idconversation: conv.idconversation, type: conv.type });
  } catch (error) {
    console.error('createOrGetDirectConversation error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * 3) POST /api/conversations/group
 * Create a GROUP conversation and add members.
 * Body: { name, description?, memberIds: [] }
 */
export const createGroupConversation = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const myUserId = req.user.iduser;
    const { name, description, memberIds } = req.body;

    // validations...

    const conv = await Conversation.create({
      type: 'GROUP',
      name: name.trim(),
      description: description?.trim() || null,
      createdBy: myUserId,
    }, { transaction: t });

    const uniqueMemberIds = Array.isArray(memberIds)
      ? [...new Set(memberIds.map(Number).filter(Boolean))]
      : [];

    if (!uniqueMemberIds.includes(myUserId)) uniqueMemberIds.push(myUserId);

    const rows = uniqueMemberIds.map((id) => ({
      idconversation: conv.idconversation,
      iduser: id,
      role: id === myUserId ? 'OWNER' : 'MEMBER',
      joinedAt: new Date(),
    }));

    await ConversationMember.bulkCreate(rows, { transaction: t });

    await t.commit();
    return res.status(201).json({ idconversation: conv.idconversation, type: conv.type });
  } catch (error) {
    await t.rollback();
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};


/**
 * 4) GET /api/conversations/:id/messages
 * Fetch messages for a conversation (basic version: no pagination)
 * Automatically updates lastReadAt for the current user
 */
export const getConversationMessages = async (req, res) => {
  try {
    const myUserId = req.user.iduser;
    const idconversation = Number(req.params.id);

    const member = await requireMembership(idconversation, myUserId);
    if (!member) return res.status(403).json({ message: 'Not a member of this conversation' });

    // Automatically update lastReadAt to current time
    member.lastReadAt = new Date();
    await member.save();

    const messages = await Message.findAll({
      where: { idconversation },
      order: [['sentAt', 'ASC']],
      include: [{ model: User, as: 'sender', attributes: ['iduser', 'nom', 'prenom', 'photo'] }],
      attributes: ['idmessage', 'content', 'sentAt', 'senderId'],
    });

    return res.status(200).json(messages);
  } catch (error) {
    console.error('getConversationMessages error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * 5) POST /api/conversations/:id/messages
 * Send a message to a conversation
 */
export const sendMessage = async (req, res) => {
  try {
    const myUserId = req.user.iduser;
    const idconversation = Number(req.params.id);
    const { content } = req.body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    const member = await requireMembership(idconversation, myUserId);
    if (!member) return res.status(403).json({ message: 'Not a member of this conversation' });

    const msg = await Message.create({
      idconversation,
      senderId: myUserId,
      content: content.trim(),
      sentAt: new Date(),
    });

    // Update conversation updatedAt so it sorts to top in inbox
    await Conversation.update(
      { updatedAt: new Date() },
      { where: { idconversation } }
    );

    return res.status(201).json(msg);
  } catch (error) {
    console.error('sendMessage error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * 6) POST /api/conversations/:id/leave
 * Leave a conversation (mainly for GROUP)
 */
export const leaveConversation = async (req, res) => {
  try {
    const myUserId = req.user.iduser;
    const idconversation = Number(req.params.id);

    const membership = await requireMembership(idconversation, myUserId);
    if (!membership) return res.status(403).json({ message: 'Not a member' });

    // Prevent owner from leaving without transferring ownership (simple rule)
    if (membership.role === 'OWNER') {
      return res.status(400).json({ message: 'Owner cannot leave the group (transfer ownership first)' });
    }

    membership.leftAt = new Date();
    await membership.save();

    return res.status(200).json({ message: 'Left conversation successfully' });
  } catch (error) {
    console.error('leaveConversation error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * 7) POST /api/conversations/:id/members
 * Owner adds a user to a GROUP conversation
 * Body: { userId }
 */
export const addMember = async (req, res) => {
  try {
    const myUserId = req.user.iduser;
    const idconversation = Number(req.params.id);
    const { userId } = req.body;

    if (!userId) return res.status(400).json({ message: 'userId is required' });

    // Must be owner
    const owner = await requireOwner(idconversation, myUserId);
    if (!owner) return res.status(403).json({ message: 'Only owner can add members' });

    const conv = await Conversation.findByPk(idconversation);
    if (!conv) return res.status(404).json({ message: 'Conversation not found' });

    if (conv.type !== 'GROUP') {
      return res.status(400).json({ message: 'Cannot add members to a DIRECT conversation' });
    }

    // 1) check if there is an active membership
    const active = await ConversationMember.findOne({
      where: { idconversation, iduser: Number(userId), leftAt: null },
    });

    if (active) {
      return res.status(200).json({ message: 'User already a member' });
    }

    // 2) check if there is an old membership (leftAt not null)
    const old = await ConversationMember.findOne({
      where: { idconversation, iduser: Number(userId) }, // no leftAt condition
    });

    if (old) {
      old.leftAt = null;
      old.joinedAt = new Date();
      await old.save();

      return res.status(200).json({ message: 'User re-added successfully' });
    }

    // 3) otherwise create brand new membership
    await ConversationMember.create({
      idconversation,
      iduser: Number(userId),
      role: 'MEMBER',
      joinedAt: new Date(),
    });

    return res.status(201).json({ message: 'Member added successfully' });
  } catch (error) {
    console.error('addMember error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * 8) DELETE /api/conversations/:id/members/:userId
 * Owner removes a user from a GROUP conversation
 */
export const removeMember = async (req, res) => {
  try {
    const myUserId = req.user.iduser;
    const idconversation = Number(req.params.id);
    const userId = Number(req.params.userId);

    const owner = await requireOwner(idconversation, myUserId);
    if (!owner) return res.status(403).json({ message: 'Only owner can remove members' });

    if (userId === myUserId) {
      return res.status(400).json({ message: 'Owner cannot remove themselves' });
    }

    const membership = await requireMembership(idconversation, userId);
    if (!membership) return res.status(404).json({ message: 'User is not an active member' });

    membership.leftAt = new Date();
    await membership.save();

    return res.status(200).json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('removeMember error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * 11) DELETE /api/conversations/:id/messages/:messageId
 * Delete a message in a conversation (only sender can delete)
 */
export const deleteMessage = async (req, res) => {
  try {
    const myUserId = req.user.iduser;
    const idconversation = Number(req.params.id);
    const idmessage = Number(req.params.messageId);

    // Find message
    const message = await Message.findOne({ where: { idmessage, idconversation } });
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Only sender can delete
    if (message.senderId !== myUserId) {
      return res.status(403).json({ message: 'Not authorized to delete this message' });
    }

    await message.destroy();
    return res.status(200).json({ message: 'Message deleted' });
  } catch (error) {
    console.error('deleteMessage error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * 12) PUT /api/conversations/:id/messages/:messageId
 * Edit a message in a conversation (only sender can edit)
 * Body: { content }
 */
export const editMessage = async (req, res) => {
  try {
    const myUserId = req.user.iduser;
    const idconversation = Number(req.params.id);
    const idmessage = Number(req.params.messageId);
    const { content } = req.body;

    if (!content || typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({ message: 'Content required' });
    }

    // Find message
    const message = await Message.findOne({ where: { idmessage, idconversation } });
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Only sender can edit
    if (message.senderId !== myUserId) {
      return res.status(403).json({ message: 'Not authorized to edit this message' });
    }

    message.content = content.trim();
    await message.save();
    return res.status(200).json({ message: 'Message updated', messageId: message.idmessage });
  } catch (error) {
    console.error('editMessage error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * GET /api/conversations/:id
 * Get details for a single conversation (if member), including all messages
 */
export const getSingleConversation = async (req, res) => {
  try {
    const myUserId = req.user.iduser;
    const idconversation = Number(req.params.id);

    // Check membership
    const membership = await ConversationMember.findOne({
      where: { idconversation, iduser: myUserId, leftAt: null },
    });
    if (!membership) return res.status(403).json({ message: 'Not a member of this conversation' });

    // Fetch conversation with members and all messages
    const conv = await Conversation.findOne({
      where: { idconversation },
      include: [
        {
          model: ConversationMember,
          where: { leftAt: null },
          required: false,
          attributes: ['iduser', 'role', 'joinedAt', 'leftAt'],
          include: [{ model: User, attributes: ['iduser', 'nom', 'prenom', 'photo', 'niveau'] }],
        },
        {
          model: Message,
          order: [['sentAt', 'ASC']],
          include: [{ model: User, as: 'sender', attributes: ['iduser', 'nom', 'prenom', 'photo'] }],
          attributes: ['idmessage', 'content', 'sentAt', 'senderId'],
        },
      ],
    });
    if (!conv) return res.status(404).json({ message: 'Conversation not found' });

    // Format result
    const members = (conv.conversation_members || []).map((cm) => ({
      iduser: cm.user.iduser,
      nom: cm.user.nom,
      prenom: cm.user.prenom,
      photo: cm.user.photo,
      niveau: cm.user.niveau,
      role: cm.role,
      joinedAt: cm.joinedAt,
      leftAt: cm.leftAt,
    }));
    const messages = (conv.messages || []).map((msg) => ({
      idmessage: msg.idmessage,
      content: msg.content,
      sentAt: msg.sentAt,
      senderId: msg.senderId,
      sender: msg.sender ? {
        iduser: msg.sender.iduser,
        nom: msg.sender.nom,
        prenom: msg.sender.prenom,
        photo: msg.sender.photo
      } : null
    }));
    let otherUser = null;
    let title = conv.name || null;
    if (conv.type === 'DIRECT') {
      otherUser = members.find((u) => u.iduser !== myUserId) || null;
      title = otherUser ? `${otherUser.prenom} ${otherUser.nom}` : 'Direct Chat';
    }
    if (conv.type === 'GROUP') {
      title = conv.name || 'Group';
    }
    const result = {
      idconversation: conv.idconversation,
      type: conv.type,
      title,
      description: conv.description || null,
      createdBy: conv.createdBy,
      members,
      otherUser,
      messages,
      updatedAt: conv.updatedAt,
    };
    return res.status(200).json(result);
  } catch (error) {
    console.error('getSingleConversation error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * 13) POST /api/conversations/:id/hide
 * Hide a conversation for the current user (set leftAt without actually leaving)
 * This allows the user to remove the conversation from their list without affecting the other user
 */
export const hideConversation = async (req, res) => {
  try {
    const myUserId = req.user.iduser;
    const idconversation = Number(req.params.id);

    const membership = await requireMembership(idconversation, myUserId);
    if (!membership) return res.status(403).json({ message: 'Not a member of this conversation' });

    // Mark conversation as hidden by setting leftAt
    membership.leftAt = new Date();
    await membership.save();

    return res.status(200).json({ message: 'Conversation hidden successfully' });
  } catch (error) {
    console.error('hideConversation error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * 14) POST /api/conversations/:id/unhide
 * Unhide a hidden conversation (set leftAt back to null)
 */
export const unhideConversation = async (req, res) => {
  try {
    const myUserId = req.user.iduser;
    const idconversation = Number(req.params.id);

    const membership = await ConversationMember.findOne({
      where: { idconversation, iduser: myUserId },
    });
    if (!membership) return res.status(403).json({ message: 'Not a member of this conversation' });

    if (!membership.leftAt) {
      return res.status(400).json({ message: 'Conversation is not hidden' });
    }

    // Unhide by clearing leftAt
    membership.leftAt = null;
    await membership.save();

    return res.status(200).json({ message: 'Conversation unhidden successfully' });
  } catch (error) {
    console.error('unhideConversation error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * 15) POST /api/conversations/:id/join
 * Allow any authenticated user to join a group conversation
 * (could be extended with invitation tokens if needed)
 */
export const joinConversation = async (req, res) => {
  try {
    const myUserId = req.user.iduser;
    const idconversation = Number(req.params.id);

    const conv = await Conversation.findByPk(idconversation);
    if (!conv) return res.status(404).json({ message: 'Conversation not found' });

    // Only allow joining GROUP conversations
    if (conv.type !== 'GROUP') {
      return res.status(400).json({ message: 'Can only join GROUP conversations' });
    }

    // Check if already an active member
    const activeMember = await ConversationMember.findOne({
      where: { idconversation, iduser: myUserId, leftAt: null },
    });

    if (activeMember) {
      return res.status(200).json({ message: 'Already a member of this conversation' });
    }

    // Check if there's an old membership (user left before)
    const oldMember = await ConversationMember.findOne({
      where: { idconversation, iduser: myUserId },
    });

    if (oldMember) {
      // Re-join: restore membership
      oldMember.leftAt = null;
      oldMember.joinedAt = new Date();
      await oldMember.save();
      return res.status(200).json({ message: 'Rejoined conversation successfully' });
    }

    // Create new membership
    await ConversationMember.create({
      idconversation,
      iduser: myUserId,
      role: 'MEMBER',
      joinedAt: new Date(),
    });

    return res.status(201).json({ message: 'Joined conversation successfully' });
  } catch (error) {
    console.error('joinConversation error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * 16) POST /api/conversations/:id/read
 * Mark a conversation as read by setting lastReadAt to current time
 */
export const markConversationAsRead = async (req, res) => {
  try {
    const myUserId = req.user.iduser;
    const idconversation = Number(req.params.id);

    const membership = await requireMembership(idconversation, myUserId);
    if (!membership) return res.status(403).json({ message: 'Not a member of this conversation' });

    membership.lastReadAt = new Date();
    await membership.save();

    return res.status(200).json({ message: 'Conversation marked as read' });
  } catch (error) {
    console.error('markConversationAsRead error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
