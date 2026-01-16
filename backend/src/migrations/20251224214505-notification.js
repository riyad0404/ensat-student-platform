export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("Notifications", {
    idNotif: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },

    idDestinataire: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },

    idSourceUser: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },

    type: {
      type: Sequelize.ENUM(
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
      type: Sequelize.STRING,
      allowNull: false,
    },

    isRead: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    metadata: {
      type: Sequelize.JSON,
      allowNull: true,
    },

    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn("NOW"),
    },

    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn("NOW"),
    },
  });

  // Index utile pour performance (notifications par utilisateur)
  await queryInterface.addIndex("Notifications", [
    "idDestinataire",
    "isRead",
    "createdAt",
  ]);
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("Notifications");

  // suppression propre de l'ENUM PostgreSQL
  await queryInterface.sequelize.query(
    'DROP TYPE IF EXISTS "enum_Notifications_type";'
  );
}
