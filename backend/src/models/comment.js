import sequelize from "../database.js";
import { DataTypes } from "sequelize";

const Comment = sequelize.define(
  "Comment",
  {
    idcomment: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },

    // contenu texte du commentaire (question, réponse, explication...)
    contenu: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // Même logique que Post : le commentaire peut être texte / lien / document
    // Si DOCUMENT => les infos du fichier seront dans la table documents (idcomment)
    typeContenu: {
      type: DataTypes.ENUM("TEXTE", "LIEN", "DOCUMENT"),
      allowNull: false,
      defaultValue: "TEXTE",
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
    idpost: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    // utile maintenant + plus tard : répondre à un commentaire (thread)
    // null = commentaire direct sur le post
    idparent: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
 likedBy: {
  type: DataTypes.JSONB,
  allowNull: false,
  defaultValue: [],
  field: "likedby"
},

likesCount: {
  type: DataTypes.INTEGER,
  allowNull: false,
  defaultValue: 0,
  field: "likescount"
},

lovesCount: {
  type: DataTypes.INTEGER,
  allowNull: false,
  defaultValue: 0,
  field: "lovescount"
},

reactedBy: {
  type: DataTypes.JSONB,
  allowNull: false,
  defaultValue: [],
  field: "reactedby"
},
  },
  {
    tableName: "comments",
    timestamps: true, // createdAt = datecomment
  }
);

export { Comment };
