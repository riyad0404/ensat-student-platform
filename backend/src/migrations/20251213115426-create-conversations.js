'use strict';

export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable('conversations', {
    idconversation: {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },

    type: {
      // Postgres ENUM is fine; we’ll also clean it in down()
      type: Sequelize.ENUM('DIRECT', 'GROUP'),
      allowNull: false,
    },

    name: {
      type: Sequelize.STRING,
      allowNull: true, // only for GROUP
    },

    description: {
      type: Sequelize.STRING,
      allowNull: true,
    },

    createdBy: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'iduser',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
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
  await queryInterface.dropTable('conversations');
  // Important for Postgres: drop ENUM type explicitly
  await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_conversations_type";');
};
