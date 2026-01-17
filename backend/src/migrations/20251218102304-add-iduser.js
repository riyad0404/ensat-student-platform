export async function up(queryInterface, Sequelize) {
  // iduser column already exists, only add constraint if not present
  // If the constraint already exists, this will fail safely
  try {
    await queryInterface.addConstraint("documents", {
      fields: ["iduser"],
      type: "foreign key",
      name: "documents_iduser_fkey",
      references: {
        table: "users",
        field: "iduser",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
  } catch (e) {
    // Ignore error if constraint already exists
  }
}

export async function down(queryInterface) {
  await queryInterface.removeConstraint("documents", "documents_iduser_fkey");
  // Do not remove iduser column, as it was added by a previous migration
}
