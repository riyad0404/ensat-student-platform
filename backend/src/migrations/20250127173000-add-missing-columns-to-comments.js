export async function up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('comments');

    // Ajout de la colonne 'likedby' (JSON)
    if (!tableInfo.likedby) {
      await queryInterface.addColumn('comments', 'likedby', {
        type: Sequelize.JSON,
        defaultValue: [],
        allowNull: true
      });
    }

    // Ajout de la colonne 'likescount' (INTEGER)
    if (!tableInfo.likescount) {
      await queryInterface.addColumn('comments', 'likescount', {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      });
    }

    // Ajout de la colonne 'lovescount' (INTEGER)
    if (!tableInfo.lovescount) {
      await queryInterface.addColumn('comments', 'lovescount', {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      });
    }

    // Ajout de la colonne 'reactedby' (JSON)
    if (!tableInfo.reactedby) {
      await queryInterface.addColumn('comments', 'reactedby', {
        type: Sequelize.JSON,
        defaultValue: [],
        allowNull: true
      });
    }

    // Ajout de la colonne 'idparent' (INTEGER) pour les réponses
    if (!tableInfo.idparent) {
      await queryInterface.addColumn('comments', 'idparent', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'comments',
          key: 'idcomment'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      });
    }
  }

export async function down(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('comments');

    if (tableInfo.likedby) await queryInterface.removeColumn('comments', 'likedby');
    if (tableInfo.likescount) await queryInterface.removeColumn('comments', 'likescount');
    if (tableInfo.lovescount) await queryInterface.removeColumn('comments', 'lovescount');
    if (tableInfo.reactedby) await queryInterface.removeColumn('comments', 'reactedby');
    if (tableInfo.idparent) await queryInterface.removeColumn('comments', 'idparent');
  }
