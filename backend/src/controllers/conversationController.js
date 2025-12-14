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
 * List my conversations with members + last message preview
 */
export const getMyConversations = async (req, res) => {
  try {
    const myUserId = req.user.iduser;

    const memberships = await ConversationMember.findAll({
      where: { iduser: myUserId, leftAt: null },
      attributes: ['idconversation'],
    });

    const ids = memberships.map((m) => m.idconversation);
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

    const result = conversations.map((conv) => {
      const members = (conv.conversation_members || []).map((cm) => cm.user);

      const lastMessage = conv.messages?.[0]
        ? {
            idmessage: conv.messages[0].idmessage,
            content: conv.messages[0].content,
            sentAt: conv.messages[0].sentAt,
            senderId: conv.messages[0].senderId,
          }
        : null;

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
        updatedAt: conv.updatedAt,
      };
    });

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
 */
export const getConversationMessages = async (req, res) => {
  try {
    const myUserId = req.user.iduser;
    const idconversation = Number(req.params.id);

    const member = await requireMembership(idconversation, myUserId);
    if (!member) return res.status(403).json({ message: 'Not a member of this conversation' });

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
