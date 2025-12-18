export async function up(queryInterface, Sequelize) {
  await queryInterface.changeColumn("comments", "contenu", {
    type: Sequelize.TEXT,
    allowNull: true, // ✅ autoriser NULL
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.changeColumn("comments", "contenu", {
    type: Sequelize.TEXT,
    allowNull: false, // ⬅️ rollback
  });
}
