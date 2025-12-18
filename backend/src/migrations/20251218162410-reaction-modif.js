export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn("reactions", "idcomment", {
    type: Sequelize.INTEGER,
    allowNull: true,
  });

  await queryInterface.changeColumn("reactions", "idpost", {
    type: Sequelize.INTEGER,
    allowNull: true,
  });

  await queryInterface.addConstraint("reactions", {
    fields: ["idcomment"],
    type: "foreign key",
    name: "reactions_idcomment_fkey",
    references: { table: "comments", field: "idcomment" },
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeConstraint("reactions", "reactions_idcomment_fkey");
  await queryInterface.removeColumn("reactions", "idcomment");

  await queryInterface.changeColumn("reactions", "idpost", {
    type: Sequelize.INTEGER,
    allowNull: false,
  });
}
