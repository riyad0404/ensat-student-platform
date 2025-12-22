'use strict';

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('message_chat', {
    idMsgChat: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    idConvChat: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'conversation_chat',
        key: 'idConvChat'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    role: {
      type: Sequelize.ENUM('user', 'bot'),
      allowNull: false
    },
    content: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    timestamp: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    }
  });

  // Ajouter des index pour améliorer les performances
  await queryInterface.addIndex('message_chat', ['idConvChat'], {
    name: 'message_chat_idConvChat_idx'
  });

  await queryInterface.addIndex('message_chat', ['timestamp'], {
    name: 'message_chat_timestamp_idx'
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('message_chat');
}