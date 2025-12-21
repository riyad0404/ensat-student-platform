import bcrypt from "bcrypt";

export async function up(queryInterface, Sequelize) {
  const users = [
    {
      nom: "El Ghazrani",
      prenom: "Jihane",
      email: "elghazranijihane@gmail.com",
      password: await bcrypt.hash("jihane05", 10),
      niveau: "GINF2",
      secretCode: 200520,
      bio: "Étudiante ENSAT – Génie Informatique",
      photo: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      nom: "Moukhliss",
      prenom: "Riyad",
      email: "moukhliss.riyad@etu.uae.ac.ma",
      password: await bcrypt.hash("riyad04", 10),
      niveau: "GINF2",
      secretCode: 200421,
      bio: null,
      photo: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      nom: "El Ghomari",
      prenom: "Zohra",
      email: "elghomarizohra@gmail.com",
      password: await bcrypt.hash("zohra04", 10),
      niveau: "GINF2",
      secretCode: 2004211,
      bio: null,
      photo: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      nom: "El Mohsine",
      prenom: "Nouhaila",
      email: "elmohsine.nouhaila@etu.uae.ac.ma",
      password: await bcrypt.hash("password123", 10),
      niveau: "GINF2",
      secretCode: 20042111,
      bio: null,
      photo: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      nom: "El Abaid",
      prenom: "Oumnia",
      email: "elabaid.oumnia@etu.uae.ac.ma",
      password: await bcrypt.hash("oumnia", 10),
      niveau: "GINF2",
      secretCode: 2005200,
      bio: null,
      photo: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  await queryInterface.bulkInsert("users", users);
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.bulkDelete(
    "users",
    {
      email: [
        "elghazranijihane@gmail.com",
        "moukhliss.riyad@etu.uae.ac.ma",
        "elghomarizohra@gmail.com",
        "elmohsine.nouhaila@etu.uae.ac.ma",
        "elabaid.oumnia@etu.uae.ac.ma",
      ],
    }
  );
}
