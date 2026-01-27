'use strict';

export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn('comments', 'likedBy', {
    type: Sequelize.JSONB,
    allowNull: false,
    defaultValue: [],
  });

  await queryInterface.addColumn('comments', 'likesCount', {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0,
  });

  await queryInterface.addColumn('comments', 'lovesCount', {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0,
  });

  await queryInterface.addColumn('comments', 'reactedBy', {
    type: Sequelize.JSONB,
    allowNull: false,
    defaultValue: [],
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn('comments', 'reactedBy');
  await queryInterface.removeColumn('comments', 'lovesCount');
  await queryInterface.removeColumn('comments', 'likesCount');
  await queryInterface.removeColumn('comments', 'likedBy');
}
