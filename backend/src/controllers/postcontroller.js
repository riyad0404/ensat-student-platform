import fs from "fs";
import path from "path";
import { Post } from "../models/post.js";
import { User } from "../models/user.js";
import { Document } from "../models/document.js";
import { Op } from 'sequelize';

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");

// ===== CREATE POST ====

export const createPost = async (req, res) => {
  try {
    const iduser = req.user?.iduser;
    if (!iduser) return res.status(401).json({ message: "Utilisateur non authentifié" });

    let { contenu, typeContenu, isAnonymat = false, niveau } = req.body;

    // Conversion correcte du boolean depuis form-data
    if (typeof isAnonymat === "string") isAnonymat = isAnonymat === "true";

    // Gestion robuste : req.files (array) ou req.file (single)
    const files = req.files || (req.file ? [req.file] : []);

    // Validations de base
    if (!contenu && files.length === 0) {
      return res.status(400).json({ message: "Contenu ou fichier obligatoire" });
    }

    // Sécurité : Forcer le type DOCUMENT si un fichier est présent
    if (files.length > 0) {
      typeContenu = "DOCUMENT";
      if (!niveau) {
        // Supprimer le fichier uploadé car la requête va échouer
        files.forEach(f => fs.unlinkSync(f.path));
        return res.status(400).json({ message: "Le niveau est obligatoire pour un document" });
      }
    }

    // 1) Créer le post
    const post = await Post.create({
      contenu: contenu || "",
      typeContenu: typeContenu || "TEXTE",
      isAnonymat,
      iduser,
    });

    // 2) Si fichier => Créer Document lié
    let docs = [];
    if (files.length > 0) {
      // ✅ Correction des backticks ici
      const baseUrl = `${req.protocol}://${req.get("host")}`;

      // Normaliser niveau en tableau pour gérer l'indexation
      const niveaux = Array.isArray(niveau) ? niveau : [niveau];

      const filePromises = files.map((file, index) => {
        const url = `${baseUrl}/uploads/${file.filename}`;
        // Utiliser le niveau correspondant à l'index du fichier, ou le premier/seul niveau disponible par défaut
        const fileLevel = niveaux[index] || niveaux[0] || "UNKNOWN";

        return Document.create({
          filename: file.originalname,
          url,
          type: "DOCUMENT",
          niveau: fileLevel,
          idpost: post.idpost,
          iduser,
        });
      });

      docs = await Promise.all(filePromises);
    }

    return res.status(201).json({ post, documents: docs });

  } catch (error) {
    // Nettoyage en cas d'erreur serveur
    if (req.files) req.files.forEach(f => fs.unlinkSync(f.path));
    else if (req.file) fs.unlinkSync(req.file.path);
    
    console.error("Erreur createPost:", error);
    return res.status(500).json({ message: "Erreur lors de la création de la publication" });
  }
};
// ===== GET ALL POSTS ====

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.findAll({
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          as: "auteur",
          attributes: ["iduser", "nom", "prenom", "niveau", "photo"],
        },
        {
          model: Document,
          as: "documents",
          required: false, // 👈 Garde le post même s'il n'y a pas de document
          where: {
            // Simplification : On cherche juste si idcomment est nul
            // car l'association s'occupe déjà de idpost
            idcomment: null 
          }
        },
      ],
    });

    const result = posts.map((pInstance) => {
      const p = pInstance.get({ plain: true }); // Plus propre que toJSON()

      // Gestion de l'anonymat
      if (p.isAnonymat && Number(p.iduser) !== Number(req.user.iduser)) {
        p.auteur = { nom: "Anonyme", prenom: "", photo: null }; 
      }

      return p;
    });

    return res.json(result);
  } catch (error) {
    console.error("Détails de l'erreur getAllPosts:", error);
    return res.status(500).json({ message: "Erreur affichage posts" });
  }
};

// ===== GET MY POSTS =====
export const getMyPosts = async (req, res) => {
  try {
    const iduser = req.user.iduser;

    const posts = await Post.findAll({
      where: { iduser },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Document,
          as: "documents",
          required: false,
          where: {
            idpost: { [Op.ne]: null },
            idcomment: null
          }
        },
      ],
    });

    return res.json(posts);
  } catch (error) {
    console.error("getMyPosts:", error);
    return res.status(500).json({ message: "Erreur affichage mes posts" });
  }
};

// ===== GET POST BY ID =====
export const getPostById = async (req, res) => {
  try {
    const idpost = Number(req.params.idpost);
    if (!idpost) return res.status(400).json({ message: "idpost invalide" });

    const post = await Post.findByPk(idpost, {
      include: [
        {
          model: User,
          as: "auteur",
          attributes: ["iduser", "nom", "prenom", "niveau", "photo"],
        },
        {
          model: Document,
          as: "documents",
          required: false,
          where: {
            idpost: { [Op.ne]: null },
            idcomment: null
          }
        },
      ],
    });

    if (!post) return res.status(404).json({ message: "Post introuvable" });

    const p = post.toJSON();
    if (p.isAnonymat === true && Number(p.iduser) !== Number(req.user.iduser)) {
      p.auteur = null;
    }

    return res.json(p);
  } catch (error) {
    console.error("getPostById:", error);
    return res.status(500).json({ message: "Erreur affichage post" });
  }
};

// ===== UPDATE POST =====
export const updatePost = async (req, res) => {
  try {
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const idpost = Number(req.params.idpost);
    if (!idpost) return res.status(400).json({ message: "idpost invalide" });

    const post = await Post.findByPk(idpost);
    if (!post) return res.status(404).json({ message: "Post introuvable" });

    if (Number(post.iduser) !== Number(req.user.iduser)) {
      return res.status(403).json({ message: "Interdit" });
    }

    const { contenu, typeContenu, isAnonymat } = req.body;

    if (contenu !== undefined) post.contenu = contenu;
    if (typeContenu !== undefined) post.typeContenu = typeContenu;
    if (isAnonymat !== undefined) post.isAnonymat = isAnonymat;

    // --- GESTION DES FICHIERS ---

    // 1. Suppression des fichiers demandés
    if (req.body.deleteFileIds) {
      const idsToDelete = Array.isArray(req.body.deleteFileIds) 
          ? req.body.deleteFileIds 
          : [req.body.deleteFileIds];
      
      const docsToDelete = await Document.findAll({
          where: { 
              iddoc: { [Op.in]: idsToDelete },
              idpost: idpost 
          }
      });

      for (const doc of docsToDelete) {
           const filename = String(doc.url).split("/uploads/").pop();
           if (filename) {
              const filePath = path.join(UPLOAD_DIR, filename);
              if (fs.existsSync(filePath)) {
                try { fs.unlinkSync(filePath); } catch(e) {}
              }
           }
           await doc.destroy();
      }
    }

    // 2. Ajout de nouveaux fichiers
    if (req.files && req.files.length > 0) {
      const { niveau } = req.body;
      const niveaux = Array.isArray(niveau) ? niveau : [niveau];

      const filePromises = req.files.map(async (file, index) => {
        const ext = file.originalname.split('.').pop().toLowerCase();
        let docType = "DOCUMENT";
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) docType = "IMAGE";

        const fileLevel = niveaux[index] || niveaux[0] || "UNKNOWN";

        return Document.create({
          filename: file.originalname,
          url: `${baseUrl}/uploads/${file.filename}`,
          type: docType,
          niveau: fileLevel,
          idpost: post.idpost,
          iduser: req.user.iduser
        });
      });
      await Promise.all(filePromises);
    }

    // Mettre à jour le typeContenu si nécessaire
    const docCount = await Document.count({ where: { idpost } });
    if (docCount > 0) post.typeContenu = "DOCUMENT";
    else post.typeContenu = "TEXTE";

    await post.save();

    // Renvoyer le post complet avec les documents mis à jour
    const updatedPost = await Post.findByPk(idpost, {
      include: [
        { model: User, as: "auteur", attributes: ["iduser", "nom", "prenom", "niveau", "photo"] },
        { model: Document, as: "documents", required: false, where: { idcomment: null } }
      ]
    });

    return res.json(updatedPost);
  } catch (error) {
    console.error("updatePost:", error);
    return res.status(500).json({ message: "Erreur modification du post" });
  }
};

// ===== DELETE POST =====
export const deletePost = async (req, res) => {
  try {
    const idpost = Number(req.params.idpost);
    if (!idpost) return res.status(400).json({ message: "idpost invalide" });

    const post = await Post.findByPk(idpost);
    if (!post) return res.status(404).json({ message: "Post introuvable" });

    if (Number(post.iduser) !== Number(req.user.iduser)) {
      return res.status(403).json({ message: "Interdit" });
    }

    await post.destroy();
    return res.json({ message: "Post supprimé" });
  } catch (error) {
    console.error("deletePost:", error);
    return res.status(500).json({ message: "Erreur suppression post" });
  }
};