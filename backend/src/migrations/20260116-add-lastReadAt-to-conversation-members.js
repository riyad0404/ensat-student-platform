'use strict';

export const up = async (queryInterface, Sequelize) => {
  await queryInterface.addColumn('conversation_members', 'lastReadAt', {
    type: Sequelize.DATE,
    allowNull: true,
    defaultValue: null,
  });
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.removeColumn('conversation_members', 'lastReadAt');
};
