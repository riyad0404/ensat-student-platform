import { User } from './user.js';
import { Conversation } from './conversation.js';
import { ConversationMember } from './conversationMember.js';
import { Message } from './message.js';

// Conversation created by a User
User.hasMany(Conversation, { foreignKey: 'createdBy' });
Conversation.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// Membership: users <-> conversations (many-to-many via ConversationMember)
User.hasMany(ConversationMember, { foreignKey: 'iduser' });
ConversationMember.belongsTo(User, { foreignKey: 'iduser' });

Conversation.hasMany(ConversationMember, { foreignKey: 'idconversation' });
ConversationMember.belongsTo(Conversation, { foreignKey: 'idconversation' });

// Messages
Conversation.hasMany(Message, { foreignKey: 'idconversation' });
Message.belongsTo(Conversation, { foreignKey: 'idconversation' });

User.hasMany(Message, { foreignKey: 'senderId' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

export { User, Conversation, ConversationMember, Message };
