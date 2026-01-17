'use strict';

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('conversation_chat', {
    idConvChat: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'iduser'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    titre: {
      type: Sequelize.STRING(200),
      allowNull: false,
      defaultValue: 'Nouvelle conversation'
    },
    isActive: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    }
  });

  // Ajouter des index pour améliorer les performances
  await queryInterface.addIndex('conversation_chat', ['userId'], {
    name: 'conversation_chat_userId_idx'
  });

  await queryInterface.addIndex('conversation_chat', ['createdAt'], {
    name: 'conversation_chat_createdAt_idx'
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('conversation_chat');
}