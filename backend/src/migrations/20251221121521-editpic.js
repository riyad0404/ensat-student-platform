export async function up(queryInterface, Sequelize) {
  await queryInterface.changeColumn('users', 'photo', {
    type: Sequelize.STRING(10000),
    allowNull: true
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.changeColumn('users', 'photo', {
    type: Sequelize.STRING(255),
    allowNull: true
  });
}
