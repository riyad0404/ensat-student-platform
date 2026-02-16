export default {
  async up(queryInterface, Sequelize) {

    const users = await queryInterface.sequelize.query(
      `SELECT iduser, niveau FROM users`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    function randomUser(level) {
      const list = users.filter(u => u.niveau === level);
      if (!list.length) return null;
      return list[Math.floor(Math.random() * list.length)];
    }

    const posts = [];

    function createPost(level, contenu) {
      const user = randomUser(level);
      if (!user) return null;

      const post = {
        contenu,
        typeContenu: "TEXTE",
        isAnonymat: Math.random() < 0.1,
        iduser: user.iduser,
        createdAt: new Date(Date.now() - Math.random() * 1000000000),
        updatedAt: new Date()
      };

      posts.push(post);
      return post;
    }

    // ================= GINF1 - Projet Ghailani =================

    createPost("GINF1", `
Dans le cadre du projet de M. Ghailani, est-ce qu’on peut choisir les membres de notre équipe ou bien les groupes seront imposés ?

On est déjà 4 motivés à travailler ensemble et on aimerait commencer à structurer le travail dès maintenant.
    `);

    createPost("GINF1", `
Concernant le projet web avec Vue.js et backend, est-ce qu’il y aura un temps d’autoformation prévu ?

Certains n’ont jamais utilisé Vue auparavant.
Est-ce qu’on doit apprendre seuls ou bien il y aura un accompagnement ?
    `);

    createPost("GINF1", `
Pour le projet de M. Ghailani, je conseille vivement de configurer Docker dès le début.

Même si ça paraît secondaire, à la fin du semestre ça devient critique.

• créer un Dockerfile propre
• séparer les services
• tester les variables d’environnement
• vérifier la communication API

Sinon le jour de la démo, ça peut bloquer.
    `);

    createPost("GINF1", `
Concernant la gestion des rôles dans l’équipe :

Quelles sont exactement les responsabilités du chef de projet ?
Est-ce qu’il doit seulement coordonner ou aussi coder ?

On aimerait éviter les conflits plus tard.
    `);

    // ================= Projet Oracle APEX =================

    createPost("GINF1", `
Pour le projet Base de Données avec Mme Fissoune (Oracle APEX),

est-ce qu’on doit développer toute l’application uniquement via APEX,
ou bien intégrer aussi du PL/SQL avancé ?

Si quelqu’un a un exemple d’ancienne application validée, ça m’aiderait beaucoup.
    `);

    createPost("GINF1", `
Concernant Oracle APEX,

est-ce que le design de l’interface compte dans la note finale,
ou seulement la structure de la base et les requêtes ?

Je veux savoir sur quoi concentrer l’effort.
    `);

    // ================= Docker Question (GINF1) =================

    createPost("GINF1", `
Est-ce que quelqu’un a déjà utilisé Docker en production réelle ?

Je me pose des questions sur :

• gestion des logs
• configuration des variables d’environnement
• sécurisation des containers

Je voudrais comprendre comment ça se passe en environnement réel.
    `);

    // ================= MVC Post (GINF3 + IMAGE) =================

    const mvcUser = randomUser("GINF3");

    let mvcPostId;

    if (mvcUser) {
      const [insertedPost] = await queryInterface.bulkInsert(
        "posts",
        [{
          contenu: `
Bonjour,

Un petit conseil pour les étudiants en génie informatique :

Pour les projets (Ghailani, stages, projets personnels),
il est fortement recommandé d’utiliser l’architecture MVC.

Cela permet de :

• bien séparer les responsabilités
• structurer le code proprement
• faciliter la maintenance
• travailler en équipe sans conflit

C’est une très bonne pratique professionnelle.
          `,
          typeContenu: "DOCUMENT",
          isAnonymat: false,
          iduser: mvcUser.iduser,
          createdAt: new Date(),
          updatedAt: new Date()
        }],
        { returning: true }
      );

      mvcPostId = insertedPost?.idpost;

      if (mvcPostId) {
        await queryInterface.bulkInsert("documents", [{
          filename: "mvc-architecture.png",
          url: "https://miro.medium.com/v2/resize:fit:940/1*y8Z4MgBS_s8d4o26arDJ4w.png",
          type: "IMAGE",
          niveau: "GINF3",
          idpost: mvcPostId,
          iduser: mvcUser.iduser,
          createdAt: new Date(),
          updatedAt: new Date()
        }]);
      }
    }

    // ================= AP2 Analyse 3 =================

    createPost("AP2", `
Les séries numériques deviennent vraiment complexes.

Je bloque sur les critères de convergence.
Est-ce que quelqu’un pourrait partager la correction détaillée du dernier TD ?

Surtout les exercices sur les séries alternées.
    `);

    createPost("AP2", `
Pour ceux qui préparent Analyse 3,

concentrez-vous sur les anciens examens et les exemples faits en cours.

Le professeur reprend souvent les mêmes types de démonstrations,
mais en changeant légèrement les données.
    `);

    // ================= GINF3 Stage =================

    createPost("GINF3", `
Petit retour d’expérience concernant la recherche de stage :

En deuxième année, j’ai commencé à chercher en juin.
Résultat : beaucoup trop tard.

Cette année, j’ai commencé en mars
et j’ai eu plusieurs réponses positives.

N’attendez pas la fin du semestre.
    `);

    // ================= GSR =================

    createPost("GSR2", `
Est-ce qu’il y a des pièges fréquents dans l’examen de système d’administration ?

Notamment sur la configuration des services Linux et les permissions.
    `);

    createPost("GSR1", `
Quelqu’un aurait un bon résumé ou une vidéo claire sur Packet Tracer ?

Je veux surtout maîtriser le routage inter-VLAN et les ACL.
    `);

    await queryInterface.bulkInsert("posts", posts);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("posts", null, {});
  }
};
