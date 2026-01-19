export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn("documents", "idcomment", {
    type: Sequelize.INTEGER,
    allowNull: true,
  });

  await queryInterface.addConstraint("documents", {
    fields: ["idcomment"],
    type: "foreign key",
    name: "documents_idcomment_fkey",
    references: {
      table: "comments", 
      field: "idcomment",
    },
    onUpdate: "CASCADE",
    onDelete: "SET NULL",
  });
}

export async function down(queryInterface) {
  await queryInterface.removeConstraint("documents", "documents_idcomment_fkey");
  await queryInterface.removeColumn("documents", "idcomment");
}
