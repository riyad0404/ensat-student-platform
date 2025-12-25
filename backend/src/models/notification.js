export default (sequelize, DataTypes) => {
  const Notification = sequelize.define(
    "Notification",
    {
      idNotif: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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
          "GROUP_INVITE_DECLINED"
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
         type: DataTypes.JSON,
         allowNull: true,
      },
    },
    {
      tableName: "Notifications",
    }
  );

  return Notification;
};
