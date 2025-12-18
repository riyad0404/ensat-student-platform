import { Post } from "../models/post.js";
import { User } from "../models/user.js";
import { Document } from "../models/document.js";

export const createPost = async (req, res) => {
  try {
    const iduser = req.user.iduser;

    // Postman en form-data => req.body = strings
    let { contenu, typeContenu, isAnonymat = false, niveau } = req.body;

    // convertir isAnonymat correctement (form-data => "true"/"false")
    if (typeof isAnonymat === "string") {
      isAnonymat = isAnonymat === "true";
    }

    // Si on upload un fichier, contenu peut être vide (selon ton besoin)
    if (!contenu && !req.file) {
      return res.status(400).json({ message: "contenu obligatoire " });
    }
    if (!typeContenu) {
      return res.status(400).json({ message: "typeContenu obligatoire" });
    }
    // 1) créer le post
    const post = await Post.create({
      contenu: contenu || "",          // si fichier sans texte
      typeContenu,                    // "TEXTE" | "LIEN" | "DOCUMENT"
      isAnonymat,
      iduser,
    });

    // 2) si fichier => créer Document lié au post
    let doc = null;

    if (req.file) {
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      const url = `${baseUrl}/uploads/${req.file.filename}`;

      doc = await Document.create({
        filename: req.file.originalname,
        url,
        type: "DOCUMENT",     // ou tu peux déduire selon mimetype
        niveau: niveau || req.user.niveau || "UNKNOWN",
        idpost: post.idpost,
        idcomment: null,
        iduser,
      });
    }
    // réponse finale
    return res.status(201).json({
      post,
      document: doc,
    });
  } catch (error) {
    console.error("createPost:", error);
    return res.status(500).json({ message: "Erreur lors de la création du publication" });
  }
};

// GET mur : tous les posts + auteur (respect anonymat)
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.findAll({
      order: [["createdAt", "DESC"]],
      include: {
        model: User,
        as: "auteur",
        attributes: ["iduser", "nom", "prenom", "niveau", "photo"],
      },
    });

    const result = posts.map((pInstance) => {
      const p = pInstance.toJSON();

      // Si anonymat et ce n’est pas le propriétaire -> cacher auteur
      if (p.isAnonymat === true && Number(p.iduser) !== Number(req.user.iduser)) {
        p.auteur = null;
      }

      return p;
    });

    return res.json(result);
  } catch (error) {
    console.error("getAllPosts:", error);
    return res.status(500).json({ message: "Erreur affichage posts" });
  }
};

// GET mes posts (iduser vient du cookie)
export const getMyPosts = async (req, res) => {
  try {
    const iduser = req.user.iduser;

    const posts = await Post.findAll({
      where: { iduser },
      order: [["createdAt", "DESC"]],
    });

    return res.json(posts);
  } catch (error) {
    console.error("getMyPosts:", error);
    return res.status(500).json({ message: "Erreur affichage mes posts" });
  }
};

// GET post by id
export const getPostById = async (req, res) => {
  try {
    const idpost = Number(req.params.idpost);
    if (!idpost) return res.status(400).json({ message: "idpost invalide" });

    const post = await Post.findByPk(idpost, {
      include: {
        model: User,
        as: "auteur",
        attributes: ["iduser", "nom", "prenom", "niveau", "photo"],
      },
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

// UPDATE post (auteur seulement)
export const updatePost = async (req, res) => {
  try {
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

    await post.save();
    return res.json(post);
  } catch (error) {
    console.error("updatePost:", error);
    return res.status(500).json({ message: "Erreur lors de la  modification du publication" });
  }
};

// DELETE post (auteur seulement)
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
