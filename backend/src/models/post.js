import sequelize from "../database.js";
import { DataTypes } from "sequelize";

const Post = sequelize.define(
  "Post",
  {
    idpost: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },

    contenu: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    typeContenu: {
      type: DataTypes.ENUM("TEXTE", "LIEN", "DOCUMENT"),
      allowNull: false,
    },

    isAnonymat: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    iduser: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "posts",
    timestamps: true,
  }
);

export { Post };
