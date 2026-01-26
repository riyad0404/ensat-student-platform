export const up = async (queryInterface, Sequelize) => {
  // Ajoute explicitement toutes les nouvelles valeurs à l'énum PostgreSQL
  const newEnumValues = [
    'JOIN_REQUEST',
    'JOIN_ACCEPTED',
    'GROUP_ADD'
  ];
  for (const value of newEnumValues) {
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_Notifications_type" ADD VALUE IF NOT EXISTS '${value}';`
    );
  }
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
      "JOIN_REQUEST", // Ajouté pour supporter la notification de demande d'adhésion
      "JOIN_ACCEPTED",
      "GROUP_ADD"
    ),
    allowNull: false,
  });
};

export const down = async (queryInterface, Sequelize) => {
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
};
