export default {
  async up(queryInterface, Sequelize) {

    const now = new Date();

    // ===============================
    // 🔹 RÉCUPÉRATION DES POSTS
    // ===============================

    const mvcPost = await queryInterface.sequelize.query(
      `SELECT idpost FROM posts WHERE contenu LIKE '%architecture MVC%' LIMIT 1`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const packetPost = await queryInterface.sequelize.query(
      `SELECT idpost FROM posts WHERE contenu LIKE '%Packet Tracer%' LIMIT 1`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const ghailaniPost = await queryInterface.sequelize.query(
      `SELECT idpost FROM posts WHERE contenu LIKE '%projet de M. Ghailani%' LIMIT 1`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const apexPost = await queryInterface.sequelize.query(
      `SELECT idpost FROM posts WHERE contenu LIKE '%Oracle APEX%' AND contenu LIKE '%design%' LIMIT 1`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const vuePost = await queryInterface.sequelize.query(
      `SELECT idpost FROM posts WHERE contenu LIKE '%Vue.js%' LIMIT 1`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const dockerPost = await queryInterface.sequelize.query(
      `SELECT idpost FROM posts WHERE contenu LIKE '%Docker en production%' LIMIT 1`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const rolesPost = await queryInterface.sequelize.query(
      `SELECT idpost FROM posts WHERE contenu LIKE '%gestion des rôles%' LIMIT 1`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const adminPost = await queryInterface.sequelize.query(
      `SELECT idpost FROM posts WHERE contenu LIKE '%système d’administration%' LIMIT 1`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    // ===============================
    // 🔹 RÉCUPÉRATION USERS EXISTANTS
    // ===============================

    const ginfUsers = await queryInterface.sequelize.query(
      `SELECT iduser FROM users WHERE niveau LIKE 'GINF%' ORDER BY iduser ASC LIMIT 6`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const ginf2 = await queryInterface.sequelize.query(
      `SELECT iduser FROM users WHERE niveau='GINF2' LIMIT 1`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const ginf3 = await queryInterface.sequelize.query(
      `SELECT iduser FROM users WHERE niveau='GINF3' LIMIT 1`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const gsr2 = await queryInterface.sequelize.query(
      `SELECT iduser FROM users WHERE niveau='GSR2' LIMIT 1`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (ginfUsers.length < 6 || !ginf2.length || !ginf3.length) return;

    // =====================================
    // 🔹 POST MVC (5 comments + 1 reply)
    // =====================================

    if (mvcPost.length) {
      const mvcId = mvcPost[0].idpost;

      const mvcMain = [
        "Merci beaucoup pour cette information, c’est très utile 🙏",
        "Oui je suis totalement d’accord avec vous, MVC est indispensable.",
        "Merci pour le conseil, je vais l’appliquer dans mon prochain projet.",
        "Je confirme, travailler en MVC facilite vraiment la maintenance.",
        "Très bon rappel, surtout pour les projets de fin d’année."
      ];

      const inserted = await queryInterface.bulkInsert(
        "comments",
        mvcMain.map((text, index) => ({
          contenu: text,
          typeContenu: "TEXTE",
          isAnonymat: false,
          iduser: ginfUsers[index].iduser,
          idpost: mvcId,
          idparent: null,
          createdAt: now,
          updatedAt: now
        })),
        { returning: true }
      );

      await queryInterface.bulkInsert("comments", [{
        contenu: "Oui exactement, MVC évite beaucoup de problèmes en équipe 👍",
        typeContenu: "TEXTE",
        isAnonymat: false,
        iduser: ginfUsers[5].iduser,
        idpost: mvcId,
        idparent: inserted[0].idcomment,
        createdAt: now,
        updatedAt: now
      }]);
    }

    // =====================================
    // 🔹 POST Packet Tracer
    // =====================================

    if (packetPost.length) {
      await queryInterface.bulkInsert("comments", [
        {
          contenu: "Voici une très bonne vidéo YouTube pour maîtriser le routage inter-VLAN : https://www.youtube.com/watch?v=0g2iF7k9p6Q",
          typeContenu: "TEXTE",
          isAnonymat: false,
          iduser: ginfUsers[0].iduser,
          idpost: packetPost[0].idpost,
          idparent: null,
          createdAt: now,
          updatedAt: now
        },
        {
          contenu: "Je te conseille aussi de bien comprendre les ACL standard et étendues avant de faire les labs.",
          typeContenu: "TEXTE",
          isAnonymat: false,
          iduser: ginfUsers[1].iduser,
          idpost: packetPost[0].idpost,
          idparent: null,
          createdAt: now,
          updatedAt: now
        }
      ]);
    }

    // =====================================
    // 🔹 POST Ghailani
    // =====================================

    if (ghailaniPost.length) {
      await queryInterface.bulkInsert("comments", [
        {
          contenu: "Pour l’année dernière il a fait un tirage au sort pour les membres et aussi pour les tâches.",
          typeContenu: "TEXTE",
          isAnonymat: false,
          iduser: ginf2[0].iduser,
          idpost: ghailaniPost[0].idpost,
          idparent: null,
          createdAt: now,
          updatedAt: now
        },
        {
          contenu: "Pour notre cas on a choisi les membres, mais puisque l’année dernière il a changé la manière de choisir, donc c’est le cas pour cette année.",
          typeContenu: "TEXTE",
          isAnonymat: false,
          iduser: ginf3[0].iduser,
          idpost: ghailaniPost[0].idpost,
          idparent: null,
          createdAt: now,
          updatedAt: now
        }
      ]);
    }

    // =====================================
    // 🔹 ORACLE APEX
    // =====================================

    if (apexPost.length) {
      await queryInterface.bulkInsert("comments", [
        {
          contenu: "Le professeur va vous préciser les critères d’évaluation. La structure de la base est prioritaire, mais le design APEX compte aussi.",
          typeContenu: "TEXTE",
          isAnonymat: false,
          iduser: ginf2[0].iduser,
          idpost: apexPost[0].idpost,
          idparent: null,
          createdAt: now,
          updatedAt: now
        },
        {
          contenu: "Les requêtes SQL sont essentielles, mais une interface claire améliore la note finale.",
          typeContenu: "TEXTE",
          isAnonymat: false,
          iduser: gsr2.length ? gsr2[0].iduser : ginf2[0].iduser,
          idpost: apexPost[0].idpost,
          idparent: null,
          createdAt: now,
          updatedAt: now
        }
      ]);
    }

    // =====================================
    // 🔹 PROJET VUE.JS
    // =====================================

    if (vuePost.length) {
      await queryInterface.bulkInsert("comments", [
        {
          contenu: "L’autoformation est nécessaire. Il faut chercher, tester et s’interroger avant le projet.",
          typeContenu: "TEXTE",
          isAnonymat: false,
          iduser: ginf2[0].iduser,
          idpost: vuePost[0].idpost,
          idparent: null,
          createdAt: now,
          updatedAt: now
        },
        {
          contenu: "Il y a de l’aide au début, mais il faut s’autoformer avant pour comprendre Vue et le backend.",
          typeContenu: "TEXTE",
          isAnonymat: false,
          iduser: ginf3[0].iduser,
          idpost: vuePost[0].idpost,
          idparent: null,
          createdAt: now,
          updatedAt: now
        }
      ]);
    }

    // =====================================
    // 🔹 DOCKER
    // =====================================

    if (dockerPost.length) {
      await queryInterface.bulkInsert("comments", [
        {
          contenu: "Tu peux m’interroger en privé, je connais bien Docker en production (logs, variables d’environnement et sécurisation).",
          typeContenu: "TEXTE",
          isAnonymat: false,
          iduser: ginf3[0].iduser,
          idpost: dockerPost[0].idpost,
          idparent: null,
          createdAt: now,
          updatedAt: now
        }
      ]);
    }
    // =====================================
// 🔹 AJOUT GESTION DES RÔLES
// =====================================

if (rolesPost.length) {
  await queryInterface.bulkInsert("comments", [
    {
      contenu: "Christian, le chef de projet est responsable de la gestion de Jira : création des tâches, détermination des priorités et distribution des tâches aux membres de l’équipe.",
      typeContenu: "TEXTE",
      isAnonymat: false,
      iduser: ginf2[0].iduser,
      idpost: rolesPost[0].idpost,
      idparent: null,
      createdAt: now,
      updatedAt: now
    },
    {
      contenu: "Il peut aussi participer au développement backend avec l’équipe, analyser la conception UML, structurer l’architecture MVC et travailler sur les maquettes avec Figma.",
      typeContenu: "TEXTE",
      isAnonymat: false,
      iduser: ginf3[0].iduser,
      idpost: rolesPost[0].idpost,
      idparent: null,
      createdAt: now,
      updatedAt: now
    },
    {
      contenu: "Le chef de projet est également responsable de la rédaction des rapports, la définition des milestones, le suivi des délais et la coordination globale pour éviter les conflits dans l’équipe.",
      typeContenu: "TEXTE",
      isAnonymat: false,
      iduser: ginf3[0].iduser,
      idpost: rolesPost[0].idpost,
      idparent: null,
      createdAt: now,
      updatedAt: now
    }
  ]);
}
// =====================================
// 🔹 AJOUT SYSTÈME D’ADMINISTRATION
// =====================================

if (adminPost.length && gsr2.length) {
  await queryInterface.bulkInsert("comments", [
    {
      contenu: "L’examen est vraiment facile si tu prépares bien. Il n’y a pas de pièges particuliers si tu maîtrises la configuration des services Linux et les permissions.",
      typeContenu: "TEXTE",
      isAnonymat: false,
      iduser: gsr2[0].iduser,
      idpost: adminPost[0].idpost,
      idparent: null,
      createdAt: now,
      updatedAt: now
    },
    {
      contenu: "Les examens de l’année dernière existent sur le site du professeur. Veuillez les consulter, car les questions sont presque les mêmes et se répètent souvent.",
      typeContenu: "TEXTE",
      isAnonymat: false,
      iduser: gsr2[0].iduser,
      idpost: adminPost[0].idpost,
      idparent: null,
      createdAt: now,
      updatedAt: now
    }
  ]);
}


  },
  

  async down(queryInterface, Sequelize) {
    // volontairement vide pour ne pas supprimer les anciens commentaires
  }
};
