import bcrypt from "bcrypt";

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
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

    const count = 150;

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

    /* Photos humaines (jeunes + cadrage propre) */
    const malePhotos = Array.from({ length: 30 }, (_, i) =>
      `https://randomuser.me/api/portraits/men/${i}.jpg`
    );

    const femalePhotos = Array.from({ length: 30 }, (_, i) =>
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

    const hashedPassword = await bcrypt.hash("P@ssw0rd2026!", 10);

    const users = [];
    const usedEmails = new Set();

    for (let i = 0; i < count; i++) {

      const prenom = randomItem(prenoms);
      const nom = randomItem(noms);
      const niveau = randomItem(niveaux);
      const isFemale = femaleNames.includes(prenom);

      /* Email sécurisé */
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

      /* PHOTO LOGIQUE */
      let photo;

      if (Math.random() < 0.3) {
        // 30% avatars LinkedIn style (initiales)
        photo = `https://ui-avatars.com/api/?name=${encodeURIComponent(
          prenom + " " + nom
        )}&background=0A66C2&color=ffffff&size=256`;
      } else {
        // 70% vraies photos humaines
        photo = isFemale
          ? randomItem(femalePhotos)
          : randomItem(malePhotos);
      }

      const bio = isFemale
        ? randomItem(bioFemale)
        : randomItem(bioMale);

      users.push({
        nom,
        prenom,
        email,
        password: hashedPassword,
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

    await queryInterface.bulkInsert("users", users);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("users", null, {});
  }
};
