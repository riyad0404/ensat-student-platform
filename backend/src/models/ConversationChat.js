import sequelize from '../database.js';
import { DataTypes } from 'sequelize';

const ConversationChat = sequelize.define('conversation_chat', {
  idConvChat: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'iduser'
    }
  },
  titre: {
    type: DataTypes.STRING(200),
    allowNull: false,
    defaultValue: 'Nouvelle conversation'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'conversation_chat',
  timestamps: true
});

export { ConversationChat };