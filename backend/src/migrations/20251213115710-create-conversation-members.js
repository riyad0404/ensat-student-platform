'use strict';

export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable('conversation_members', {
    idmember: {
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

    iduser: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'iduser',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },

    role: {
      type: Sequelize.ENUM('OWNER', 'MEMBER'),
      allowNull: false,
      defaultValue: 'MEMBER',
    },

    joinedAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn('NOW'),
    },

    leftAt: {
      type: Sequelize.DATE,
      allowNull: true,
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

  // Unique constraint: user cannot join same conversation twice
  await queryInterface.addConstraint('conversation_members', {
    fields: ['idconversation', 'iduser'],
    type: 'unique',
    name: 'unique_conversation_member',
  });
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.dropTable('conversation_members');
  await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_conversation_members_role";');
};
