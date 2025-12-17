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

    idpost: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "reactions",
    timestamps: true,
  }
);

export { Reaction };
