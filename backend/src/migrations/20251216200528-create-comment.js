"use strict";

export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable("comments", {
    idcomment: {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    contenu: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    typeContenu: {
      type: Sequelize.ENUM("TEXTE", "LIEN", "DOCUMENT"),
      allowNull: false,
      defaultValue: "TEXTE",
    },
    isAnonymat: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    iduser: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: "users", key: "iduser" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    idpost: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: "posts", key: "idpost" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
// replies: commentaire -> commentaire
    idparent: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: "comments", key: "idcomment" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },

    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },

    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  });
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.dropTable("comments");

  if (queryInterface.sequelize.getDialect() === "postgres") {
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_comments_typeContenu";'
    );
  }
};
