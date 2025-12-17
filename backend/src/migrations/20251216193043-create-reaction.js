"use strict";

export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable("reactions", {
    idreaction: {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },

    typeReaction: {
      type: Sequelize.ENUM("LIKE", "LOVE"),
      allowNull: false,
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

  // Un user peut faire LIKE et LOVE sur le même post,
  // mais une seule fois pour chaque type
  await queryInterface.addConstraint("reactions", {
    fields: ["iduser", "idpost", "typeReaction"],
    type: "unique",
    name: "unique_user_post_type_reaction",
  });
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.dropTable("reactions");

  if (queryInterface.sequelize.getDialect() === "postgres") {
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_reactions_typeReaction";'
    );
  }
};

