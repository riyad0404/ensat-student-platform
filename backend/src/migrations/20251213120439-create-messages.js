'use strict';

export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable('messages', {
    idmessage: {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },

    idconversation: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'conversations',
        key: 'idconversation',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },

    senderId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'iduser',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },

    content: {
      type: Sequelize.TEXT,
      allowNull: false,
    },

    sentAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn('NOW'),
    },

    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn('NOW'),
    },

    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn('NOW'),
    },
  });
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.dropTable('messages');
};
