import sequelize from '../database.js';
import { DataTypes } from 'sequelize';

const Conversation = sequelize.define(
  'conversation',
  {
    idconversation: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },

    type: {
      type: DataTypes.ENUM('DIRECT', 'GROUP'),
      allowNull: false,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: 'conversations',
    timestamps: true,
  }
);

export { Conversation };
