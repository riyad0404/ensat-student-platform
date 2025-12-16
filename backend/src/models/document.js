import sequelize from "../database.js";
import { DataTypes } from "sequelize";

const Document = sequelize.define(
  "Document",
  {
    iddoc: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },

    filename: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    type: {
      type: DataTypes.ENUM("IMAGE", "TABLEUR", "PRESENTATION", "DOCUMENT"),
      allowNull: false,
    },

    niveau: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    // doc lié à un post (cas 3) -> peut être NULL si doc vient d'un comment
    idpost: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    // doc lié à un commentaire (cas 2) -> peut être NULL si doc vient d'un post
    idcomment: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "documents",
    timestamps: true,
  }
);

export { Document };
