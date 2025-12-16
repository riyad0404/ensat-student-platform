import { User } from './user.js';
import { Post } from "./post.js";
import { Document } from "./document.js";
import { Reaction } from "./reaction.js";
import { Comment } from "./comment.js";
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
// Posts and Documents
Post.hasMany(Document, { foreignKey: "idpost", as: "documents" });
Document.belongsTo(Post, { foreignKey: "idpost", as: "post" });
// Users and Posts
User.hasMany(Post, { foreignKey: "iduser" });
Post.belongsTo(User, { foreignKey: "iduser", as: "auteur" });
// Posts and Reactions
Post.hasMany(Reaction, { foreignKey: "idpost" });
Reaction.belongsTo(Post, { foreignKey: "idpost" });
// Users and Reactions
User.hasMany(Reaction, { foreignKey: "iduser" });
Reaction.belongsTo(User, { foreignKey: "iduser" });
// Post -> Comment
Post.hasMany(Comment, { foreignKey: "idpost", as: "comments" });
Comment.belongsTo(Post, { foreignKey: "idpost", as: "post" });

// User -> Comment
User.hasMany(Comment, { foreignKey: "iduser" });
Comment.belongsTo(User, { foreignKey: "iduser", as: "auteur" });

// Replies (thread)
Comment.hasMany(Comment, { foreignKey: "idparent", as: "replies" });
Comment.belongsTo(Comment, { foreignKey: "idparent", as: "parent" });

// Comment -> Document (car documents.idcomment existe)
Comment.hasMany(Document, { foreignKey: "idcomment", as: "documents" });
Document.belongsTo(Comment, { foreignKey: "idcomment", as: "comment" });