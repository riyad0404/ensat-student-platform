"use strict";

export const up = async (queryInterface, Sequelize) => {
  // 1) Ajouter iduser
  await queryInterface.addColumn("documents", "iduser", {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: { model: "users", key: "iduser" },
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  });

  // 2) IMPORTANT: rendre idpost nullable (sinon doc de comment = impossible)
  await queryInterface.changeColumn("documents", "idpost", {
    type: Sequelize.INTEGER,
    allowNull: true,
    references: { model: "posts", key: "idpost" },
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  });
};

export const down = async (queryInterface, Sequelize) => {
  // (remettre idpost NOT NULL si tu veux, sinon laisse)
  await queryInterface.removeColumn("documents", "iduser");
};
