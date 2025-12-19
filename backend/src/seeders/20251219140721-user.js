import bcrypt from "bcrypt";
import sequelize from "../database.js";
import { User } from "../models/user.js";

const seedUsers = async () => {
  try {
    await sequelize.authenticate();
    const users = [
      {
        nom: "El Ghazrani ",
        prenom: "Jihane",
        email: "elghazranijihane@gmail.com",
        password: await bcrypt.hash("jihane05", 10),
        niveau: "GINF2",
        secretCode: 200520,
        bio: "Étudiant ENSAT – Génie Informatique",
        photo: null,
      },
      {
        nom: "Moukhliss",
        prenom: "Riyad",
        email: "salma.ait@ensat.ma",
        password: await bcrypt.hash("password123", 10),
        niveau: "GINF2",
        secretCode: 200421,
        bio: "Étudiante ENSAT – Génie Informatique",
        photo: null,
      },
      {
        nom: "El Ghomari",
        prenom: "Zohra",
        email: "hamza.bennani@ensat.ma",
        password: await bcrypt.hash("password123", 10),
        niveau: "GINF2",
        secretCode: 2004211,
        bio: "Étudiant ENSAT – Première année GI",
        photo: null,
      },
      {
        nom: "El mohsine",
        prenom: "Nouhaila",
        email: "imane.zahraoui@ensat.ma",
        password: await bcrypt.hash("password123", 10),
        niveau: "GINF2",
        secretCode: 20042111,
        bio: "Étudiante ENSAT – Cycle ingénieur",
        photo: null,
      },
      {
        nom: "EL Abaid",
        prenom: "Oumnia",
        email: "anas.kabbaj@ensat.ma",
        password: await bcrypt.hash("password123", 10),
        niveau: "GINF2",
        secretCode: 2005200,
        bio: "Étudiant ENSAT – Génie Informatique",
        photo: null,
      },
    ];

    await User.bulkCreate(users, {
      ignoreDuplicates: true, // évite erreur si relancé
    });

    console.log("✅ 5 étudiants insérés avec succès");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur seeder users :", error);
    process.exit(1);
  }
};

seedUsers();
