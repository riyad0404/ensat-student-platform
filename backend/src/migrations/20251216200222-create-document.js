"use strict";

export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable("documents", {
    iddoc: {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },

    filename: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    url: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    type: {
      type: Sequelize.ENUM("IMAGE", "TABLEUR", "PRESENTATION", "DOCUMENT"),
      allowNull: false,
    },

    niveau: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    idpost: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: "posts", key: "idpost" },
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
  await queryInterface.dropTable("documents");

  if (queryInterface.sequelize.getDialect() === "postgres") {
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_documents_type";'
    );
  }
};
