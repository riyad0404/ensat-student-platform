export async function up(queryInterface, Sequelize) {
  await queryInterface.sequelize.query(`
    ALTER TABLE "Notifications"
    ALTER COLUMN metadata
    TYPE JSONB
    USING metadata::jsonb;
  `);
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.sequelize.query(`
    ALTER TABLE "Notifications"
    ALTER COLUMN metadata
    TYPE JSON
    USING metadata::json;
  `);
}
