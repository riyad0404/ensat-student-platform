import fs from "fs";
import path from "path";
import { Comment } from "../models/comment.js";
import { Post } from "../models/post.js";
import { Document } from "../models/document.js";

const UPLOAD_DIR =
  process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");

// =========================
// CREATE COMMENT
// =========================
export const createComment = async (req, res) => {
  try {
    const iduser = req.user.iduser;
    const idpost = Number(req.body.idpost);

    if (!idpost) {
      return res.status(400).json({ message: "idpost obligatoire" });
    }

    // Vérifier que le post existe
    const post = await Post.findByPk(idpost);
    if (!post) {
      return res.status(404).json({ message: "Post introuvable" });
    }

    const contenu = (req.body.contenu ?? "").trim();
    const lien = (req.body.lien ?? "").trim();
    const isAnonymat =
      req.body.isAnonymat === true || req.body.isAnonymat === "true";

    // Récupérer tous les fichiers possibles
    const files = [];
    if (Array.isArray(req.files)) files.push(...req.files);
    if (req.file) files.push(req.file);

    // Validation métier
    if (!contenu && !lien && files.length === 0) {
      return res.status(400).json({
        message: "Un commentaire doit contenir texte, lien ou fichier.",
      });
    }

    // Créer le commentaire
    const comment = await Comment.create({
      contenu: contenu || null,
      lien: lien || null,
      isAnonymat,
      idpost,
      iduser,
    });

    // Créer les documents liés
    let documents = [];
    if (files.length > 0) {
      const baseUrl = `${req.protocol}://${req.get("host")}`;

      documents = await Promise.all(
        files.map((f) =>
          Document.create({
            filename: f.originalname,
            url: `${baseUrl}/uploads/${f.filename}`,
            type: guessDocType(f.mimetype, f.originalname),
            niveau: req.user.niveau ?? "UNKNOWN",
            idpost: null,
            idcomment: comment.idcomment,
            iduser,
          })
        )
      );
    }

    return res.status(201).json({ comment, documents });
  } catch (error) {
    console.error("createComment:", error);
    return res.status(500).json({ message: "Erreur création commentaire" });
  }
};
// =========================
// GET COMMENT BY ID (détails)
// =========================
export const getCommentById = async (req, res) => {
  try {
    const idcomment = Number(req.params.idcomment);
    if (!idcomment) {
      return res.status(400).json({ message: "idcomment invalide" });
    }

    const comment = await Comment.findByPk(idcomment, {
      include: [
        {
          model: Document,
          as: "documents",
          required: false,
        },
        {
          model: Comment,
          as: "replies",
          required: false,
        },
      ],
    });

    if (!comment) {
      return res.status(404).json({ message: "Commentaire introuvable" });
    }

    return res.json(comment);
  } catch (error) {
    console.error("getCommentById:", error);
    return res.status(500).json({ message: "Erreur affichage commentaire" });
  }
};

// =========================
// GET COMMENTS BY POST
// =========================
export const getCommentsByPost = async (req, res) => {
  try {
    const idpost = Number(req.params.idpost);
    if (!idpost) {
      return res.status(400).json({ message: "idpost invalide" });
    }

    const comments = await Comment.findAll({
      where: { idpost },
      order: [["createdAt", "ASC"]],
      include: [
        {
          model: Document,
          as: "documents",
          required: false,
        },
      ],
    });

    return res.json(comments);
  } catch (error) {
    console.error("getCommentsByPost:", error);
    return res.status(500).json({ message: "Erreur affichage commentaires" });
  }
};

// =========================
// GET MY COMMENTS
// =========================
export const getMyComments = async (req, res) => {
  try {
    const comments = await Comment.findAll({
      where: { iduser: req.user.iduser },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Document,
          as: "documents",
          required: false,
        },
      ],
    });

    return res.json(comments);
  } catch (error) {
    console.error("getMyComments:", error);
    return res.status(500).json({ message: "Erreur affichage commentaires" });
  }
};

// =========================
// UPDATE COMMENT
// (contenu / lien / anonymat)
// =========================
export const updateComment = async (req, res) => {
  try {
    const idcomment = Number(req.params.idcomment);
    if (!idcomment) {
      return res.status(400).json({ message: "idcomment invalide" });
    }

    const comment = await Comment.findByPk(idcomment);
    if (!comment) {
      return res.status(404).json({ message: "Commentaire introuvable" });
    }

    if (Number(comment.iduser) !== Number(req.user.iduser)) {
      return res.status(403).json({ message: "Interdit" });
    }

    // Valeurs finales
    const newContenu =
      req.body.contenu !== undefined
        ? String(req.body.contenu).trim()
        : comment.contenu;

    const newLien =
      req.body.lien !== undefined
        ? String(req.body.lien).trim()
        : comment.lien;

    const newIsAnonymat =
      req.body.isAnonymat !== undefined
        ? req.body.isAnonymat === true || req.body.isAnonymat === "true"
        : comment.isAnonymat;

    // Vérifier fichiers existants
    const docsCount = await Document.count({
      where: { idcomment },
    });

    // Validation métier
    if (!newContenu && !newLien && docsCount === 0) {
      return res.status(400).json({
        message: "Le commentaire ne peut pas être vide (texte / lien / fichier).",
      });
    }

    // Appliquer modifications
    comment.contenu = newContenu || null;
    comment.lien = newLien || null;
    comment.isAnonymat = newIsAnonymat;

    await comment.save();

    return res.json(comment);
  } catch (error) {
    console.error("updateComment:", error);
    return res.status(500).json({ message: "Erreur modification commentaire" });
  }
};

// =========================
// DELETE COMMENT + FILES
// =========================
export const deleteComment = async (req, res) => {
  try {
    const idcomment = Number(req.params.idcomment);
    if (!idcomment) {
      return res.status(400).json({ message: "idcomment invalide" });
    }

    const comment = await Comment.findByPk(idcomment);
    if (!comment) {
      return res.status(404).json({ message: "Commentaire introuvable" });
    }

    if (Number(comment.iduser) !== Number(req.user.iduser)) {
      return res.status(403).json({ message: "Interdit" });
    }

    // Récupérer documents liés
    const docs = await Document.findAll({
      where: { idcomment },
    });

    // Supprimer fichiers sur disque
    for (const d of docs) {
      const filename = String(d.url).split("/uploads/").pop();
      if (filename) {
        const filePath = path.join(UPLOAD_DIR, filename);
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
          } catch (e) {
            console.warn("Impossible de supprimer:", filePath);
          }
        }
      }
    }

    // Supprimer documents + commentaire
    await Document.destroy({ where: { idcomment } });
    await comment.destroy();

    return res.json({ message: "Commentaire supprimé" });
  } catch (error) {
    console.error("deleteComment:", error);
    return res.status(500).json({ message: "Erreur suppression commentaire" });
  }
};

// =========================
// DOCUMENT TYPE DETECTION
// =========================
function guessDocType(mimetype, filename = "") {
  const ext = filename.toLowerCase();

  if (mimetype?.startsWith("image/")) return "IMAGE";

  if (
    mimetype?.includes("excel") ||
    ext.endsWith(".xls") ||
    ext.endsWith(".xlsx")
  ) {
    return "TABLEUR";
  }

  if (
    mimetype?.includes("powerpoint") ||
    ext.endsWith(".ppt") ||
    ext.endsWith(".pptx")
  ) {
    return "PRESENTATION";
  }

  return "DOCUMENT";
}
