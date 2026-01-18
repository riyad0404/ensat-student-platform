import { Post } from "../models/post.js";
import { User } from "../models/user.js";
import { Document } from "../models/document.js";
import { Op } from 'sequelize';

// ===== CREATE POST ====

export const createPost = async (req, res) => {
  try {
    const { contenu, isAnonymat, niveau } = req.body;
    const iduser = req.user.iduser;

    console.log('🔵 Début création post');
    console.log('📝 Body:', { contenu, isAnonymat, niveau });
    console.log('📦 Files:', req.files?.length || 0);

    // 1. Création du Post
    const newPost = await Post.create({
      contenu: contenu?.trim() || '',
      typeContenu: (req.files && req.files.length > 0) ? "DOCUMENT" : "TEXTE",
      isAnonymat: isAnonymat === 'true' || isAnonymat === true,
      iduser,
    });

    console.log('✅ Post créé ID:', newPost.idpost);

    // 2. Création des Documents
    if (req.files && req.files.length > 0) {
      const promises = req.files.map(file => {
        const ext = file.originalname.split('.').pop().toLowerCase();
        console.log('📎 Création document:', file.originalname);
        return Document.create({
          filename: file.originalname,
          url: `${req.protocol}://${req.get('host')}/uploads/${file.filename}`,
          type: ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext) ? "IMAGE" : "DOCUMENT",
          niveau: niveau || 'GINF1',
          iduser,
          idpost: newPost.idpost
        });
      });
      await Promise.all(promises);
      console.log('✅ Documents créés');
    }

    // 3. RÉCUPÉRER LE POST COMPLET
    const postFinal = await Post.findByPk(newPost.idpost, {
      include: [
        { 
          model: User, 
          as: 'auteur', 
          attributes: ['iduser', 'nom', 'prenom', 'photo', 'niveau'] 
        },
        { 
          model: Document, 
          as: 'documents',
          required: false
        }
      ]
    });

    console.log('🔍 Post final récupéré:');
    console.log('  - idpost:', postFinal.idpost);
    console.log('  - contenu:', postFinal.contenu);
    console.log('  - documents:', postFinal.documents);
    console.log('  - nombre de documents:', postFinal.documents?.length || 0);
    
    if (postFinal.documents && postFinal.documents.length > 0) {
      console.log('  - Premier document:', {
        iddoc: postFinal.documents[0].iddoc,
        filename: postFinal.documents[0].filename,
        url: postFinal.documents[0].url,
        type: postFinal.documents[0].type
      });
    }

    console.log('📤 Envoi de la réponse au frontend');

    return res.status(201).json(postFinal);
  } catch (error) {
    console.error('❌ Erreur createPost:', error);
    res.status(500).json({ message: "Erreur lors de la création" });
  }
};
// ===== GET ALL POSTS =====
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
          required: false,
          where: {
            idpost: { [Op.ne]: null },
            idcomment: null
          }
        },
      ],
    });

    const result = posts.map((pInstance) => {
      const p = pInstance.toJSON();

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