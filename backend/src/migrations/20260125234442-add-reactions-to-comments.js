'use strict';

export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn('comments', 'likedby', {
    type: Sequelize.JSONB,
    allowNull: false,
    defaultValue: [],
  });

  await queryInterface.addColumn('comments', 'likescount', {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0,
  });

  await queryInterface.addColumn('comments', 'lovescount', {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0,
  });

  await queryInterface.addColumn('comments', 'reactedby', {
    type: Sequelize.JSONB,
    allowNull: false,
    defaultValue: [],
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn('comments', 'reactedby');
  await queryInterface.removeColumn('comments', 'lovescount');
  await queryInterface.removeColumn('comments', 'likescount');
  await queryInterface.removeColumn('comments', 'likedby');
}
