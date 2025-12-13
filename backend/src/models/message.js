import sequelize from '../database.js';
import { DataTypes } from 'sequelize';

const Message = sequelize.define(
  'message',
  {
    idmessage: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },

    idconversation: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    sentAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: 'messages',
    timestamps: true,
  }
);

export { Message };
