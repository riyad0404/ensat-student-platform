import bcrypt from "bcrypt";

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function takeAndRemoveRandom(arr) {
  if (!arr || arr.length === 0) return null;
  const idx = Math.floor(Math.random() * arr.length);
  return arr.splice(idx, 1)[0];
}

function slugify(text) {
  return (text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

export default {
  async up(queryInterface, Sequelize) {

    // Nettoyer la table avant d'insérer les nouvelles données
    await queryInterface.bulkDelete("users", null, {});

    const count = 150; // ✅ FIX ICI

    const prenoms = [
      "Youssef","Salma","Omar","Aya","Imane","Hamza","Sara","Mehdi",
      "Nour","Hajar","Anas","Rania","Walid","Malak","Ilyas","Lina",
      "Hiba","Amine","Kenza","Ismail","Najat","Soufiane","Zineb",
      "Khadija","Mohamed","Siham","Reda","Othmane","Chaimaa","Fatima"
    ];

    const femaleNames = [
      "Salma","Aya","Imane","Sara","Nour","Hajar","Rania","Malak",
      "Lina","Hiba","Kenza","Najat","Zineb","Khadija",
      "Siham","Chaimaa","Fatima"
    ];

    const noms = [
      "El Amrani","Benali","Alaoui","El Idrissi","Bennani","El Fassi",
      "Toumi","Belkadi","Rami","Berrada","Rahmani","Haddad",
      "Karim","Mansouri","Ziani","Daoudi","Bouzid","Saidi"
    ];

    const niveaux = [
      "AP1","AP2",
      "GINF1","GINF2","GINF3",
      "GIL1","GIL2","GIL3",
      "GSR1","GSR2","GSR3",
      "G2EI1","G2EI2","G2EI3",
      "GSEA1","GSEA2","GSEA3",
      "GSYC1","GSYC2","GSYC3"
    ];

    const malePhotos = Array.from({ length: 100 }, (_, i) =>
      `https://randomuser.me/api/portraits/men/${i}.jpg`
    );

    const femalePhotos = Array.from({ length: 100 }, (_, i) =>
      `https://randomuser.me/api/portraits/women/${i}.jpg`
    );

    const bioMale = [
      "Étudiant en école d’ingénieur passionné par l’innovation technologique et le développement personnel.",
      "Futur ingénieur motivé par les défis techniques et l’excellence académique.",
      "Passionné par les nouvelles technologies et l’apprentissage continu."
    ];

    const bioFemale = [
      "Étudiante en école d’ingénieur passionnée par l’innovation technologique.",
      "Future ingénieure ambitieuse et déterminée à exceller.",
      "Passionnée par la technologie et l’apprentissage continu."
    ];

    const hashedPasswordDefault = await bcrypt.hash("P@ssw0rd2026!", 10);
    const hashedJihanePassword = await bcrypt.hash("Jihane2005@", 10);

    const users = [];
    const usedEmails = new Set();

    // =============================
    // 🔹 150 USERS RANDOM
    // =============================

    for (let i = 0; i < count; i++) {

      const prenom = randomItem(prenoms);
      const nom = randomItem(noms);
      const niveau = randomItem(niveaux);
      const isFemale = femaleNames.includes(prenom);

      let baseEmail = `${slugify(prenom)}.${slugify(nom)}`;
      let email;
      let counter = 0;

      do {
        email =
          counter === 0
            ? `${baseEmail}@gmail.com`
            : `${baseEmail}${counter}@gmail.com`;
        counter++;
      } while (usedEmails.has(email));

      usedEmails.add(email);

      let photo = isFemale
        ? takeAndRemoveRandom(femalePhotos) ?? takeAndRemoveRandom(malePhotos)
        : takeAndRemoveRandom(malePhotos) ?? takeAndRemoveRandom(femalePhotos);

      if (!photo) {
        throw new Error("Pas assez d'images disponibles.");
      }

      const bio = isFemale ? randomItem(bioFemale) : randomItem(bioMale);

      users.push({
        nom,
        prenom,
        email,
        password: hashedPasswordDefault,
        niveau,
        secretCode: Math.floor(Math.random() * 900000) + 100000,
        bio,
        photo,
        resetPasswordToken: null,
        resetPasswordExpires: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // =============================
    // 🔹 AJOUT MANUEL DE JIHANE
    // =============================

    const jihanePhoto = takeAndRemoveRandom(femalePhotos) ?? takeAndRemoveRandom(malePhotos);
    if (!jihanePhoto) {
      throw new Error("Pas assez d'images pour la photo de Jihane.");
    }

    users.push({
      nom: "El Ghazrani",
      prenom: "Jihane",
      email: "elghazranijihane@gmail.com",
      password: hashedJihanePassword,
      niveau: "GINF2",
      secretCode: 200520,
      bio: "Étudiante en école d'ingénieur passionnée par l'innovation technologique.",
      photo: jihanePhoto,
      resetPasswordToken: null,
      resetPasswordExpires: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await queryInterface.bulkInsert("users", users);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("users", null, {});
  }
};
