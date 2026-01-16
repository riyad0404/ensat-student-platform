import { Op } from "sequelize";
import { User } from "../models/user.js";

export const searchUsers = async (req, res) => {
  try {
    const q = (req.query.q ?? "").trim();

    if (!q) {
      return res.status(400).json({
        message: "Le paramètre de recherche est obligatoire",
      });
    }

    // Découper la recherche en mots (nom composé, prénom, etc.)
    const words = q.split(/\s+/);

    // Chaque mot doit matcher nom OU prénom OU niveau
    const andConditions = words.map((word) => ({
      [Op.or]: [
        { nom: { [Op.iLike]: `%${word}%` } },
        { prenom: { [Op.iLike]: `%${word}%` } },
        { niveau: { [Op.iLike]: `%${word}%` } },
      ],
    }));

    const users = await User.findAll({
      where: {
        [Op.and]: andConditions,
      },
      attributes: ["iduser", "nom", "prenom", "niveau", "photo"],
    });

    return res.json(users);
  } catch (error) {
    console.error("searchUsers:", error);
    return res.status(500).json({ message: "Erreur recherche utilisateurs" });
  }
};
