import { Post } from "../models/post.js";
import { User } from "../models/user.js";

// CREATE post (TEXTE / LIEN / DOCUMENT)
// Pour l’instant tu vas utiliser surtout TEXTE et LIEN
export const createPost = async (req, res) => {
  try {
    const iduser = req.user.iduser;
    const { contenu, typeContenu, isAnonymat = false } = req.body;

    if (!contenu) {
      return res.status(400).json({ message: "contenu obligatoire" });
    }
    if (!typeContenu) {
      return res.status(400).json({ message: "typeContenu obligatoire" });
    }

    // Ici on laisse passer DOCUMENT même si tu n’as pas encore AWS,
    // mais tu ne vas pas l'utiliser maintenant (ou tu peux refuser si tu veux)
    const post = await Post.create({
      contenu,
      typeContenu,
      isAnonymat,
      iduser,
    });

    return res.status(201).json(post);
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
