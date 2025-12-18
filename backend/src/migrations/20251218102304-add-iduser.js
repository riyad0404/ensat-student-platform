export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn("documents", "iduser", {
    type: Sequelize.INTEGER,
    allowNull: true,
  });

  // backfill: mettre une valeur par défaut pour les anciennes lignes
  // IMPORTANT: remplace 1 par l’iduser qui existe chez toi (ex: admin)
  await queryInterface.sequelize.query(`
    UPDATE documents
    SET iduser = 1
    WHERE iduser IS NULL
  `);

  // 3) passer en NOT NULL
  await queryInterface.changeColumn("documents", "iduser", {
    type: Sequelize.INTEGER,
    allowNull: false,
  });

  // 4) ajouter la FK
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
}

export async function down(queryInterface) {
  await queryInterface.removeConstraint("documents", "documents_iduser_fkey");
  await queryInterface.removeColumn("documents", "iduser");
}
