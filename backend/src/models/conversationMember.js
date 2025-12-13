import sequelize from '../database.js';
import { DataTypes } from 'sequelize';

const ConversationMember = sequelize.define(
  'conversation_member',
  {
    idmember: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },

    idconversation: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    iduser: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    role: {
      type: DataTypes.ENUM('OWNER', 'MEMBER'),
      allowNull: false,
      defaultValue: 'MEMBER',
    },

    joinedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    leftAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'conversation_members',
    timestamps: true,
  }
);

export { ConversationMember };
