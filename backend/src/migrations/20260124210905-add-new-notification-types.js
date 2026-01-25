'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Modifie l'énumération de la colonne "type"
    await queryInterface.changeColumn('Notifications', 'type', {
      type: Sequelize.ENUM(
        "REACTION_PUB",
        "COMMENT_PUB",
        "REPLY_COMMENT",
        "MESSAGE",
        "GROUP_INVITE",
        "GROUP_INVITE_ACCEPTED",
        "GROUP_INVITE_DECLINED",
        "REACTION_COMMENT",
        "JOIN_ACCEPTED", // Nouveau type
        "GROUP_ADD" // Nouveau type
      ),
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revenir à la version précédente de l'énumération si nécessaire
    await queryInterface.changeColumn('Notifications', 'type', {
      type: Sequelize.ENUM(
        "REACTION_PUB",
        "COMMENT_PUB",
        "REPLY_COMMENT",
        "MESSAGE",
        "GROUP_INVITE",
        "GROUP_INVITE_ACCEPTED",
        "GROUP_INVITE_DECLINED",
        "REACTION_COMMENT",
        "JOIN_REQUEST"
      ),
      allowNull: false,
    });
  }
};
