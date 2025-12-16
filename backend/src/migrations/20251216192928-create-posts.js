"use strict";

export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable("posts", {
    idpost: {
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
  await queryInterface.dropTable("posts");

  if (queryInterface.sequelize.getDialect() === "postgres") {
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_posts_typeContenu";'
    );
  }
};
