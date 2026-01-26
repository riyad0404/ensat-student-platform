import fs from "fs";
import path from "path";
import { Comment } from "../models/comment.js";
import { Post } from "../models/post.js";
import { createNotification, NOTIF_TYPES } from "../services/notificationservice.js";
import { Document } from "../models/document.js";
import { User } from "../models/user.js";

const UPLOAD_DIR =
  process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");
  // Like / Love / Remove reaction
export const reactComment = async (req, res) => {
  try {
    const iduser = req.user.iduser;
    const idcomment = Number(req.params.idcomment);
    const { type } = req.body; // "LIKE" ou "LOVE"

    if (!["LIKE", "LOVE"].includes(type)) {
      return res.status(400).json({ message: "Type invalide" });
    }

    const comment = await Comment.findByPk(idcomment);
    if (!comment) {
      return res.status(404).json({ message: "Commentaire introuvable" });
    }

    const reactedBy = comment.reactedBy || [];

    // trouver l'utilisateur
    const existing = reactedBy.find((r) => r.iduser === iduser);

    // si pas encore existant, on le crée
    if (!existing) {
      const newEntry = {
        iduser,
        like: type === "LIKE",
        love: type === "LOVE",
      };

      comment.reactedBy = [...reactedBy, newEntry];
      if (type === "LIKE") comment.likesCount++;
      if (type === "LOVE") comment.lovesCount++;

      await comment.save();
      return res.status(200).json({ message: "Réaction ajoutée" });
    }

    // si existant -> on recrée le tableau (important)
    let newReactedBy = reactedBy.map((r) => {
      if (r.iduser !== iduser) return r;
      return { ...r }; // clone
    });

    // on récupère la version clonée
    const userEntry = newReactedBy.find((r) => r.iduser === iduser);

    // ====== LIKE ======
    if (type === "LIKE") {
      // si déjà like => retirer
      if (userEntry.like) {
        userEntry.like = false;
        comment.likesCount = Math.max(0, comment.likesCount - 1);

        comment.reactedBy = newReactedBy;
        await comment.save();
        return res.status(200).json({ message: "Like supprimé" });
      }

      // sinon ajouter like
      userEntry.like = true;
      comment.likesCount++;

      comment.reactedBy = newReactedBy;
      await comment.save();
      return res.status(200).json({ message: "Like ajouté" });
    }

    // ====== LOVE ======
    if (type === "LOVE") {
      // si déjà love => retirer
      if (userEntry.love) {
        userEntry.love = false;
        comment.lovesCount = Math.max(0, comment.lovesCount - 1);

        comment.reactedBy = newReactedBy;
        await comment.save();
        return res.status(200).json({ message: "Love supprimé" });
      }

      // sinon ajouter love
      userEntry.love = true;
      comment.lovesCount++;

      comment.reactedBy = newReactedBy;
      await comment.save();
      return res.status(200).json({ message: "Love ajouté" });
    }

  } catch (error) {
    console.error("reactComment:", error);
    return res.status(500).json({ message: "Erreur réaction", error: error.message });
  }
};



// =========================
// CREATE COMMENT
// =========================
export const createComment = async (req, res) => {
  try {
    const { idpost, contenu, isAnonymat, idparent } = req.body; // Ajout de idparent
    const iduser = req.user.iduser;

    console.log('📦 req.files:', req.files ? `OUI - ${req.files.length} fichier(s)` : 'NON');
    console.log('📝 req.body:', req.body);

    if (!idpost) {
      return res.status(400).json({ message: "idpost manquant" });
    }

    if (!contenu?.trim() && (!req.files || req.files.length === 0)) {
      return res.status(400).json({ message: "Le commentaire doit contenir du texte ou un fichier" });
    }

    let typeContenu = "TEXTE";
    if (req.files && req.files.length > 0) {
      typeContenu = "DOCUMENT";
    }

    // ✅ 1. Créer le commentaire
    const newComment = await Comment.create({
      contenu: contenu?.trim() || '',
      typeContenu,
      isAnonymat: isAnonymat === 'true' || isAnonymat === true,
      iduser,
      idpost: parseInt(idpost),
      idparent: idparent || null, // Ajout de idparent
    });

    console.log('✅ Commentaire créé:', newComment.idcomment);
    
    // 🔔 NOTIFICATION : si c'est un commentaire sur un post
    if (!idparent) {
      const post = await Post.findByPk(idpost);
      if (post) {
        await createNotification({
          toUserId: post.iduser,
          fromUserId: iduser,
          type: NOTIF_TYPES.COMMENT_PUB,
          message: `${req.user.prenom} ${req.user.nom} a commenté votre publication`,
          metadata: {
            idpost: post.idpost,
            idcomment: newComment.idcomment,
            sender: {
              iduser: req.user.iduser,
              nom: req.user.nom,
              prenom: req.user.prenom,
              photo: req.user.photo ?? null,
            },
          },
        });
      }
    } else {
      // 🔔 NOTIFICATION : commentaire sur un autre commentaire
      const parentComment = await Comment.findByPk(idparent);
      if (parentComment) {
        const sender = {
          iduser: req.user.iduser,
          nom: req.user.nom,
          prenom: req.user.prenom,
          photo: req.user.photo ?? null,
        };

        await createNotification({
          toUserId: parentComment.iduser,  // Destinataire : auteur du commentaire parent
          fromUserId: iduser,              // Expéditeur : auteur du commentaire
          type: NOTIF_TYPES.REPLY_COMMENT, // Type de notification
          message: `${sender.prenom} ${sender.nom} a répondu à votre commentaire`,
          metadata: {
            idpost: idpost,
            idcomment: newComment.idcomment,  // Ajouter l'id du nouveau commentaire
            sender, // Sender dans la notification
          },
        });
      }
    }

    // ✅ 2. Si fichier, créer le document
    if (req.files && req.files.length > 0) {
      const file = req.files[0];
      const { niveau } = req.body;

      if (!niveau) {
        await newComment.destroy();
        return res.status(400).json({ message: "Le niveau est obligatoire pour un document" });
      }

      const ext = file.originalname.split('.').pop().toLowerCase();
      let docType = "DOCUMENT";
      if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
        docType = "IMAGE";
      } else if (['xls', 'xlsx', 'csv'].includes(ext)) {
        docType = "TABLEUR";
      } else if (['ppt', 'pptx'].includes(ext)) {
        docType = "PRESENTATION";
      }

      const newDocument = await Document.create({
        filename: file.originalname,
        url: `${req.protocol}://${req.get('host')}/uploads/${file.filename}`,
        type: docType,
        niveau,
        iduser,
        idpost: parseInt(idpost), // ✅ IMPORTANT
        idcomment: newComment.idcomment, // ✅ IMPORTANT
      });

      console.log('✅ Document créé:', {
        iddoc: newDocument.iddoc,
        filename: newDocument.filename,
        idcomment: newDocument.idcomment,
        idpost: newDocument.idpost
      });
    }

    // ✅ 3. Récupérer le commentaire avec relations
    const commentWithRelations = await Comment.findByPk(newComment.idcomment, {
      include: [
        {
          model: User,
          as: 'auteur',
          attributes: ['iduser', 'nom', 'prenom', 'photo', 'niveau'],
        },
        {
          model: Document,
          as: 'documents',
          required: false,
        },
      ],
    });

    console.log('✅ Commentaire récupéré avec relations:', {
      idcomment: commentWithRelations.idcomment,
      hasDocuments: !!commentWithRelations.documents,
      documentsCount: commentWithRelations.documents?.length || 0,
      documents: commentWithRelations.documents?.map(d => ({
        iddoc: d.iddoc,
        filename: d.filename,
        url: d.url
      }))
    });

    return res.status(201).json(commentWithRelations);

  } catch (error) {
    console.error('❌ createComment ERROR:', error);
    console.error('Stack:', error.stack);
    return res.status(500).json({ 
      message: "Erreur lors de la création du commentaire",
      error: error.message 
    });
  }
};

// =========================
// Répondre à un commentaire
// =========================
export const replyComment = async (req, res) => {
  try {
    const { contenu, isAnonymat } = req.body;
    const iduser = req.user.iduser;
    const idcomment = req.params.idcomment; // L'ID du commentaire parent

    // Vérifier si le commentaire parent existe
    const parentComment = await Comment.findByPk(idcomment);
    if (!parentComment) {
      return res.status(404).json({ message: "Commentaire parent non trouvé" });
    }

    // Créer la réponse (commentaire sur un commentaire)
    const newComment = await Comment.create({
      contenu: contenu?.trim() || '',
      typeContenu: "TEXTE",
      isAnonymat: isAnonymat === 'true' || isAnonymat === true,
      iduser,
      idpost: parentComment.idpost, // On associe la réponse au même post
      idparent: idcomment, // Le commentaire parent est associé ici
    });

    // Notifier l'auteur du commentaire parent
    const sender = {
      iduser: req.user.iduser,
      nom: req.user.nom,
      prenom: req.user.prenom,
      photo: req.user.photo ?? null,
    };

    await createNotification({
      toUserId: parentComment.iduser,  // Destinataire : auteur du commentaire parent
      fromUserId: iduser,              // Expéditeur : auteur de la réponse
      type: NOTIF_TYPES.REPLY_COMMENT, // Type de notification
      message: `${sender.prenom} ${sender.nom} a répondu à votre commentaire`,
      metadata: {
        idpost: parentComment.idpost,
        idcomment: newComment.idcomment,  // Ajouter l'id du nouveau commentaire
        sender, // Sender dans la notification
      },
    });

    // Retourner le nouveau commentaire créé
    return res.status(201).json(newComment);

  } catch (error) {
    console.error('❌ replyComment ERROR:', error);
    return res.status(500).json({ 
      message: "Erreur lors de la réponse au commentaire",
      error: error.message 
    });
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
    const { idpost } = req.params;
    
    console.log('🔍 Récupération commentaires pour post:', idpost);

    const comments = await Comment.findAll({
      where: { idpost },
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
      ],
      order: [['createdAt', 'ASC']]
    });

    console.log('📝 Nombre de commentaires trouvés:', comments.length);
    
    comments.forEach((c, index) => {
      console.log(`📌 Commentaire ${index + 1}:`, {
        idcomment: c.idcomment,
        contenu: c.contenu?.substring(0, 20),
        hasDocuments: !!c.documents,
        documentsCount: c.documents?.length || 0,
        documentsData: c.documents
      });
    });

    const iduser = req.user.iduser;

const final = comments.map((c) => {
  const json = c.toJSON();

const existing = (json.reactedBy || []).find((r) => r.iduser === iduser);

return {
  ...json,
  isLiked: existing?.like === true,
  isLoved: existing?.love === true,
  likesCount: json.likesCount,
  lovesCount: json.lovesCount,
};


});

return res.status(200).json(final);

  } catch (error) {
    console.error("❌ getCommentsByPost ERROR:", error);
    return res.status(500).json({ 
      message: "Erreur récupération commentaires",
      error: error.message 
    });
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
