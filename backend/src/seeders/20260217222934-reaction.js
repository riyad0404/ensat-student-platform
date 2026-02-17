export default {
  async up(queryInterface, Sequelize) {

    const now = new Date();

    const users = await queryInterface.sequelize.query(
      `SELECT iduser FROM users`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const posts = await queryInterface.sequelize.query(
      `SELECT idpost FROM posts`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const comments = await queryInterface.sequelize.query(
      `SELECT idcomment FROM comments`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!users.length) return;

    const reactions = [];
    const used = new Set();

    function randomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function randomSubset(arr, count) {
      return [...arr]
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.min(count, arr.length));
    }

    function randomReactionType() {
      const r = Math.random();
      if (r < 0.65) return "LIKE";   // majorité LIKE
      if (r < 0.9) return "LOVE";    // moins de LOVE
      return "LIKE";                 // petite variation
    }

    // =====================================
    // 🔥 POSTS (distribution réaliste)
    // =====================================

    for (const post of posts) {

      let reactionCount;

      const popularity = Math.random();

      if (popularity < 0.2) {
        reactionCount = randomInt(40, 70); // post viral
      } else if (popularity < 0.6) {
        reactionCount = randomInt(10, 25); // post moyen
      } else {
        reactionCount = randomInt(2, 8);   // post discret
      }

      const reactors = randomSubset(users, reactionCount);

      for (const user of reactors) {

        const typeReaction = randomReactionType();
        const key = `${user.iduser}-post-${post.idpost}`;

        if (used.has(key)) continue;
        used.add(key);

        reactions.push({
          typeReaction,
          iduser: user.iduser,
          idpost: post.idpost,
          idcomment: null,
          createdAt: now,
          updatedAt: now
        });
      }
    }

    // =====================================
    // 🔥 COMMENTS (moins que posts)
    // =====================================

    for (const comment of comments) {

      let reactionCount;

      const popularity = Math.random();

      if (popularity < 0.15) {
        reactionCount = randomInt(15, 30); // commentaire populaire
      } else if (popularity < 0.5) {
        reactionCount = randomInt(5, 12);
      } else {
        reactionCount = randomInt(0, 4);   // certains sans réactions
      }

      const reactors = randomSubset(users, reactionCount);

      for (const user of reactors) {

        const typeReaction = randomReactionType();
        const key = `${user.iduser}-comment-${comment.idcomment}`;

        if (used.has(key)) continue;
        used.add(key);

        reactions.push({
          typeReaction,
          iduser: user.iduser,
          idpost: null,
          idcomment: comment.idcomment,
          createdAt: now,
          updatedAt: now
        });
      }
    }

    if (reactions.length) {
      await queryInterface.bulkInsert("reactions", reactions);
    }

    console.log(`🔥 ${reactions.length} réactions réalistes insérées.`);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("reactions", null, {});
  }
};
