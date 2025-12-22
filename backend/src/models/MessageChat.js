import sequelize from '../database.js';
import { DataTypes } from 'sequelize';

const MessageChat = sequelize.define('message_chat', {
  idMsgChat: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  idConvChat: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'conversation_chat',
      key: 'idConvChat'
    },
    onDelete: 'CASCADE'
  },
  role: {
    type: DataTypes.ENUM('user', 'bot'),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'message_chat',
  timestamps: false
});

export { MessageChat };