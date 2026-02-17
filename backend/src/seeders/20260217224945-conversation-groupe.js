export default {
  async up(queryInterface, Sequelize) {

    const now = new Date();

    // 🔹 Récupérer Jihane
    const jihane = await queryInterface.sequelize.query(
      `SELECT iduser FROM users WHERE email='elghazranijihane@gmail.com' LIMIT 1`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!jihane.length) return;
    const jihaneId = jihane[0].iduser;

    // 🔹 Récupérer plusieurs users
    const users = await queryInterface.sequelize.query(
      `SELECT iduser, prenom FROM users WHERE iduser != ${jihaneId} LIMIT 15`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (users.length < 6) return;

    // Séparer quelques filles pour conversations féminines
    const girls = users.slice(0, 4);
    const others = users.slice(4);

    // =====================================================
    // 🔥 FONCTION CRÉATION GROUPE AVEC MESSAGES
    // =====================================================

    async function createGroup(name, description, messagesData) {

      const [group] = await queryInterface.bulkInsert("conversations", [{
        type: "GROUP",
        name,
        description,
        createdBy: jihaneId,
        createdAt: now,
        updatedAt: now
      }], { returning: true });

      const groupId = group.idconversation;

      // 🔹 Construire liste membres unique
      const memberIds = [
        jihaneId,
        ...messagesData.map(m => m.sender)
      ];

      const uniqueMembers = [...new Set(memberIds)];

      await queryInterface.bulkInsert(
        "conversation_members",
        uniqueMembers.map(id => ({
          idconversation: groupId,
          iduser: id,
          role: id === jihaneId ? "OWNER" : "MEMBER",
          joinedAt: now,
          createdAt: now,
          updatedAt: now
        }))
      );

      // 🔹 Insérer messages ordonnés
      await queryInterface.bulkInsert(
        "messages",
        messagesData.map((m, index) => ({
          idconversation: groupId,
          senderId: m.sender,
          content: m.content,
          sentAt: new Date(now.getTime() - (600000 - index * 60000)),
          createdAt: now,
          updatedAt: now
        }))
      );
    }

    // =====================================================
    // 🔥 GROUPE 1
    // =====================================================

    await createGroup(
      "Projet Web GINF2",
      "Organisation du projet",
      [
        { sender: jihaneId, content: "Salut l’équipe 👋 on commence la répartition ?" },
        { sender: others[0].iduser, content: "Oui je peux prendre le backend." },
        { sender: others[1].iduser, content: "Je fais le frontend Vue.js." },
        { sender: jihaneId, content: "Parfait, je prends UML + Jira." },
        { sender: others[2].iduser, content: "On fixe une deadline ?" }
      ]
    );

    // =====================================================
    // 🔥 GROUPE 2 (filles uniquement)
    // =====================================================

    await createGroup(
      "Team Girls GINF2 💻",
      "Groupe d’entraide",
      [
        { sender: jihaneId, content: "Les filles vous avez compris Docker ?" },
        { sender: girls[0].iduser, content: "Pas totalement 😅 surtout les volumes." },
        { sender: girls[1].iduser, content: "Moi c’est les networks qui me bloquent." },
        { sender: jihaneId, content: "On révise ensemble demain ?" },
        { sender: girls[2].iduser, content: "Ouiii bonne idée !" }
      ]
    );

    // =====================================================
    // 🔥 GROUPE 3
    // =====================================================

    await createGroup(
      "Préparation Examen Admin",
      "Linux & permissions",
      [
        { sender: others[3].iduser, content: "Quelqu’un maîtrise chmod ?" },
        { sender: jihaneId, content: "Oui c’est rwx avec valeurs numériques." },
        { sender: others[4].iduser, content: "Et systemctl restart ?" },
        { sender: jihaneId, content: "Très important pour l’examen." }
      ]
    );

    // =====================================================
    // 🔥 DIRECT CONVERSATIONS
    // =====================================================

    async function createDirectConversation(userId, messagesData) {

      const [conv] = await queryInterface.bulkInsert("conversations", [{
        type: "DIRECT",
        name: null,
        description: null,
        createdBy: jihaneId,
        createdAt: now,
        updatedAt: now
      }], { returning: true });

      const convId = conv.idconversation;

      await queryInterface.bulkInsert("conversation_members", [
        {
          idconversation: convId,
          iduser: jihaneId,
          role: "MEMBER",
          joinedAt: now,
          createdAt: now,
          updatedAt: now
        },
        {
          idconversation: convId,
          iduser: userId,
          role: "MEMBER",
          joinedAt: now,
          createdAt: now,
          updatedAt: now
        }
      ]);

      await queryInterface.bulkInsert(
        "messages",
        messagesData.map((m, index) => ({
          idconversation: convId,
          senderId: m.sender,
          content: m.content,
          sentAt: new Date(now.getTime() - (300000 - index * 50000)),
          createdAt: now,
          updatedAt: now
        }))
      );
    }

    // 🔹 DIRECT 1
    await createDirectConversation(others[0].iduser, [
      { sender: jihaneId, content: "Tu peux m’envoyer le repo Git ?" },
      { sender: others[0].iduser, content: "Oui je te l’envoie maintenant." },
      { sender: jihaneId, content: "Merci beaucoup 🙏" }
    ]);

    // 🔹 DIRECT 2 (fille)
    await createDirectConversation(girls[0].iduser, [
      { sender: girls[0].iduser, content: "Tu as compris les ACL ?" },
      { sender: jihaneId, content: "Oui un peu, je peux t’expliquer." },
      { sender: girls[0].iduser, content: "Super merci ❤️" }
    ]);

    // 🔹 DIRECT 3
    await createDirectConversation(others[1].iduser, [
      { sender: jihaneId, content: "On présente quand ?" },
      { sender: others[1].iduser, content: "Vendredi normalement." }
    ]);

    console.log("🔥 Groupes et conversations créés avec succès !");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("messages", null, {});
    await queryInterface.bulkDelete("conversation_members", null, {});
    await queryInterface.bulkDelete("conversations", null, {});
  }
};
