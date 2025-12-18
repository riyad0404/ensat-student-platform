import { Document } from "../models/document.js";

export const uploadDocument = async (req, res) => {
  try {
    // 1️⃣ utilisateur authentifié (vient de authMiddleware)
    const iduser = req.user.iduser;

    // 2️⃣ vérification du fichier
    if (!req.file) {
      return res.status(400).json({
        message: "Aucun fichier envoyé (champ attendu : file)",
      });
    }

    // 3️⃣ récupération des champs texte
    const { niveau, type } = req.body;

    // conversion explicite en INTEGER (TRÈS IMPORTANT)
    const idpost = req.body.idpost ? Number(req.body.idpost) : null;
    const idcomment = req.body.idcomment ? Number(req.body.idcomment) : null;

    // 4️⃣ règles métier
    if (!idpost && !idcomment) {
      return res.status(400).json({
        message: "idpost ou idcomment est obligatoire",
      });
    }

    if (idpost && idcomment) {
      return res.status(400).json({
        message: "Donnez soit idpost soit idcomment, pas les deux",
      });
    }

    // 5️⃣ construction URL publique
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const url = `${baseUrl}/uploads/${req.file.filename}`;

    // 6️⃣ insertion en base
    const document = await Document.create({
      filename: req.file.originalname,
      url,
      type,        // ENUM : IMAGE | TABLEUR | PRESENTATION | DOCUMENT
      niveau,
      idpost,
      idcomment,
      iduser,
    });

    // 7️⃣ succès
    return res.status(201).json(document);

  } catch (error) {
    // ⚠️ LOG OBLIGATOIRE pour debug
    console.error("UPLOAD DOCUMENT ERROR :", error);

    return res.status(500).json({
      message: "Erreur upload document",
      error: error.message,
    });
  }
};
