import sequelize from "../database.js";
import { DataTypes } from "sequelize";

const Notification = sequelize.define(
  "Notification",
  {
    idNotif: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },

    idDestinataire: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    idSourceUser: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    type: {
      type: DataTypes.ENUM(
        "REACTION_PUB",
        "COMMENT_PUB",
        "REPLY_COMMENT",
        "MESSAGE",
        "GROUP_INVITE",
        "GROUP_INVITE_ACCEPTED",
        "GROUP_INVITE_DECLINED",
         "REACTION_COMMENT",
          "JOIN_REQUEST",
          "JOIN_ACCEPTED", // Nouveau type
    "GROUP_ADD" // Nouveau type
      ),
      allowNull: false,
    },

    message: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    metadata: {
     type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    tableName: "Notifications",
    timestamps: true, // ajout pour suivre création et modification
  }
);

export { Notification };