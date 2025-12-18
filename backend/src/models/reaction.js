import sequelize from "../database.js";
import { DataTypes } from "sequelize";

const Reaction = sequelize.define(
  "Reaction",
  {
    idreaction: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },

    typeReaction: {
      type: DataTypes.ENUM("LIKE", "LOVE"),
      allowNull: false,
    },

    iduser: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    // 🔹 pour réaction sur post
    idpost: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    // 🔹 pour réaction sur commentaire
    idcomment: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "reactions",
    timestamps: true,
  }
);

export { Reaction };
