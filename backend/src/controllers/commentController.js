import fs from "fs";
import path from "path";
import { Op } from "sequelize";
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
    const senderUser = await User.findByPk(iduser);
    if (!senderUser) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }
    const idcomment = Number(req.params.idcomment);
    const { type } = req.body; // "LIKE" ou "LOVE"

    if (!["LIKE", "LOVE"].includes(type)) {
      return res.status(400).json({ message: "Type invalide" });
    }

    const comment = await Comment.findByPk(idcomment);
    if (!comment) {
      return res.status(404).json({ message: "Commentaire introuvable" });
    }

    // Récupérer le post pour avoir l'ID de l'auteur (nécessaire pour la redirection notif)
    const post = await Post.findByPk(comment.idpost);

    const reactedBy = comment.reactedBy || [];
    const existing = reactedBy.find((r) => Number(r.iduser) === Number(iduser));

    if (!existing) {
      const newEntry = { iduser, like: type === "LIKE", love: type === "LOVE" };
      comment.reactedBy = [...reactedBy, newEntry];
      if (type === "LIKE") comment.likesCount++;
      if (type === "LOVE") comment.lovesCount++;

      // 🔔 NOTIFICATION (Nouvelle réaction)
      if (Number(comment.iduser) !== Number(iduser)) {
        console.log(`🔔 [reactComment] New reaction ${type} from ${iduser} to ${comment.iduser}`);
        try {
          await createNotification({
            toUserId: comment.iduser,
            fromUserId: iduser,
            type: NOTIF_TYPES.REACTION_COMMENT,
            message: `${senderUser.prenom} ${senderUser.nom} a réagi à votre commentaire (${type})`,
            metadata: {
              idpost: comment.idpost,
              idcomment: comment.idcomment,
              postAuthorId: post ? post.iduser : null,
              typeReaction: type,
              sender: {
                iduser: senderUser.iduser, nom: senderUser.nom, prenom: senderUser.prenom, photo: senderUser.photo
              }
            },
          });
        } catch (err) {
          console.error("Notification error (reactComment):", err);
        }
      }
    } else {
      let newReactedBy = reactedBy.map((r) => {
        if (Number(r.iduser) !== Number(iduser)) return r;
        return { ...r };
      });
      const userEntry = newReactedBy.find((r) => Number(r.iduser) === Number(iduser));

      if (type === "LIKE") {
        if (userEntry.like) {
          userEntry.like = false;
          comment.likesCount = Math.max(0, comment.likesCount - 1);
        } else {
          userEntry.like = true;
          comment.likesCount++;
          // 🔔 NOTIFICATION (Ajout Like sur existant)
          if (Number(comment.iduser) !== Number(iduser)) {
            console.log(`🔔 [reactComment] Toggle LIKE from ${iduser} to ${comment.iduser}`);
            try {
              await createNotification({
                toUserId: comment.iduser,
                fromUserId: iduser,
                type: NOTIF_TYPES.REACTION_COMMENT,
                message: `${senderUser.prenom} ${senderUser.nom} a aimé votre commentaire`,
                metadata: {
                  idpost: comment.idpost,
                  idcomment: comment.idcomment,
                  postAuthorId: post ? post.iduser : null,
                  typeReaction: "LIKE",
                  sender: {
                    iduser: senderUser.iduser, nom: senderUser.nom, prenom: senderUser.prenom, photo: senderUser.photo
                  }
                },
              });
            } catch (err) {
              console.error("Notification error (reactComment update):", err);
            }
          }
        }
      } else if (type === "LOVE") {
        if (userEntry.love) {
          userEntry.love = false;
          comment.lovesCount = Math.max(0, comment.lovesCount - 1);
        } else {
          userEntry.love = true;
          comment.lovesCount++;
          // 🔔 NOTIFICATION (Ajout Love sur existant)
          if (Number(comment.iduser) !== Number(iduser)) {
            console.log(`🔔 [reactComment] Toggle LOVE from ${iduser} to ${comment.iduser}`);
            try {
              await createNotification({
                toUserId: comment.iduser,
                fromUserId: iduser,
                type: NOTIF_TYPES.REACTION_COMMENT,
                message: `${senderUser.prenom} ${senderUser.nom} a adoré votre commentaire`,
                metadata: {
                  idpost: comment.idpost,
                  idcomment: comment.idcomment,
                  postAuthorId: post ? post.iduser : null,
                  typeReaction: "LOVE",
                  sender: {
                    iduser: senderUser.iduser, nom: senderUser.nom, prenom: senderUser.prenom, photo: senderUser.photo
                  }
                },
              });
            } catch (err) {
              console.error("Notification error (reactComment update):", err);
            }
          }
        }
      }
      comment.reactedBy = newReactedBy;
    }

    await comment.save();
    return res.status(200).json({ message: "Réaction mise à jour" });
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
    const senderUser = await User.findByPk(iduser);

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
        const isAnon = newComment.isAnonymat;
        const senderName = isAnon ? "Someone" : `${senderUser.prenom} ${senderUser.nom}`;
        const senderData = isAnon ? null : {
          iduser: senderUser.iduser,
          nom: senderUser.nom,
          prenom: senderUser.prenom,
          photo: senderUser.photo ?? null,
        };

        await createNotification({
          toUserId: post.iduser,
          fromUserId: iduser,
          type: NOTIF_TYPES.COMMENT_PUB,
          message: `${senderName} a commenté votre publication`,
          metadata: {
            idpost: post.idpost,
            idcomment: newComment.idcomment,
            sender: senderData,
          },
        });
      }
    } else {
      // 🔔 NOTIFICATION : commentaire sur un autre commentaire
      const parentComment = await Comment.findByPk(idparent);
      if (parentComment) {
        const post = await Post.findByPk(idpost, {
             include: [{ model: User, as: 'auteur', attributes: ['iduser', 'nom', 'prenom'] }]
        });

        const isAnon = newComment.isAnonymat;
        const senderName = isAnon ? "Someone" : `${senderUser.prenom} ${senderUser.nom}`;
        const senderData = isAnon ? null : {
          iduser: senderUser.iduser,
          nom: senderUser.nom,
          prenom: senderUser.prenom,
          photo: senderUser.photo ?? null,
        };

        await createNotification({
          toUserId: parentComment.iduser,  // Destinataire : auteur du commentaire parent
          fromUserId: iduser,              // Expéditeur : auteur du commentaire
          type: NOTIF_TYPES.REPLY_COMMENT, // Type de notification
          message: `${senderName} a répondu à votre commentaire`,
          metadata: {
            idpost: idpost,
            idcomment: newComment.idcomment,  // Ajouter l'id du nouveau commentaire
            postAuthorId: post ? post.iduser : null,
            postAuthorName: post && post.auteur ? `${post.auteur.prenom} ${post.auteur.nom}` : "Unknown",
            replyContent: newComment.contenu ? newComment.contenu.substring(0, 50) : "File/Image",
            sender: senderData, // Sender dans la notification
          },
        });
      }
    }

    // ✅ 2. Si fichier, créer le document
    if (req.files && req.files.length > 0) {
      const { niveau } = req.body;

      if (!niveau) {
        await newComment.destroy();
        return res.status(400).json({ message: "Level is required for a document" });
      }

      // Normaliser niveau en tableau
      const niveaux = Array.isArray(niveau) ? niveau : [niveau];

      const filePromises = req.files.map(async (file, index) => {
        const ext = file.originalname.split('.').pop().toLowerCase();
        let docType = "DOCUMENT";
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
          docType = "IMAGE";
        } else if (['xls', 'xlsx', 'csv'].includes(ext)) {
          docType = "TABLEUR";
        } else if (['ppt', 'pptx'].includes(ext)) {
          docType = "PRESENTATION";
        }

        const fileLevel = niveaux[index] || niveaux[0] || "UNKNOWN";

        return Document.create({
          filename: file.originalname,
          url: `${req.protocol}://${req.get('host')}/uploads/${file.filename}`,
          type: docType,
          niveau: fileLevel,
          iduser,
          idpost: parseInt(idpost),
          idcomment: newComment.idcomment,
        });
      });

      await Promise.all(filePromises);
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
    const senderUser = await User.findByPk(iduser);
    const idcomment = req.params.idcomment; // L'ID du commentaire parent

    // Vérifier si le commentaire parent existe
    const parentComment = await Comment.findByPk(idcomment);
    if (!parentComment) {
      return res.status(404).json({ message: "Commentaire parent non trouvé" });
    }

    // Créer la réponse (commentaire sur un commentaire)
    const post = await Post.findByPk(parentComment.idpost, {
      include: [{ model: User, as: 'auteur', attributes: ['iduser', 'nom', 'prenom'] }]
    });

    const newComment = await Comment.create({
      contenu: contenu?.trim() || '',
      typeContenu: "TEXTE",
      isAnonymat: isAnonymat === 'true' || isAnonymat === true,
      iduser,
      idpost: parentComment.idpost, // On associe la réponse au même post
      idparent: idcomment, // Le commentaire parent est associé ici
    });

    // Notifier l'auteur du commentaire parent
    const isAnon = newComment.isAnonymat;
    const senderName = isAnon ? "Someone" : `${senderUser.prenom} ${senderUser.nom}`;
    const senderData = isAnon ? null : {
      iduser: senderUser.iduser,
      nom: senderUser.nom,
      prenom: senderUser.prenom,
      photo: senderUser.photo ?? null,
    };

    await createNotification({
      toUserId: parentComment.iduser,  // Destinataire : auteur du commentaire parent
      fromUserId: iduser,              // Expéditeur : auteur de la réponse
      type: NOTIF_TYPES.REPLY_COMMENT, // Type de notification
      message: `${senderName} a répondu à votre commentaire`,
      metadata: {
        idpost: parentComment.idpost,
        idcomment: newComment.idcomment,  // Ajouter l'id du nouveau commentaire
        postAuthorId: post ? post.iduser : null,
        postAuthorName: post && post.auteur ? `${post.auteur.prenom} ${post.auteur.nom}` : "Unknown",
        replyContent: newComment.contenu ? newComment.contenu.substring(0, 50) : "File/Image",
        sender: senderData, // Sender dans la notification
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
if (comment.isAnonymat && Number(comment.iduser) !== Number(req.user.iduser)) {
  comment.auteur = { nom: "Anonyme", prenom: "", photo: null };
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
    const iduser = req.user.iduser;

    console.log('🔍 Récupération commentaires pour post:', idpost);

    const comments = await Comment.findAll({
      where: { idpost },
      include: [
        {
          model: User,
          as: "auteur",
          attributes: ["iduser", "nom", "prenom", "photo", "niveau"],
        },
        {
          model: Document,
          as: "documents",
          required: false,
        },
      ],
      order: [["createdAt", "ASC"]],
    });

    if (comments.length === 0) {
      return res.status(200).json([]);
    }

    const final = comments.map((c) => {
      const json = c.toJSON();
      const existing = (json.reactedBy || []).find((r) => r.iduser === iduser);
        if (json.isAnonymat && Number(json.iduser) !== Number(iduser)) {
  json.auteur = { nom: "Anonyme", prenom: "", photo: null };
}

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
    const iduser = req.user.iduser;
    if (!idcomment) {
      return res.status(400).json({ message: "idcomment invalide" });
    }

    const comment = await Comment.findByPk(idcomment);
    if (!comment) {
      return res.status(404).json({ message: "Commentaire introuvable" });
    }

    if (Number(comment.iduser) !== Number(iduser)) {
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

    // --- GESTION DES FICHIERS ---

    // 1. Suppression des fichiers demandés
    if (req.body.deleteFiles) {
      const idsToDelete = Array.isArray(req.body.deleteFiles) 
          ? req.body.deleteFiles 
          : [req.body.deleteFiles];
      
      const docsToDelete = await Document.findAll({
          where: { 
              iddoc: { [Op.in]: idsToDelete },
              idcomment: idcomment 
          }
      });

      for (const doc of docsToDelete) {
           // Supprimer le fichier physique
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
        else if (['xls', 'xlsx', 'csv'].includes(ext)) docType = "TABLEUR";
        else if (['ppt', 'pptx'].includes(ext)) docType = "PRESENTATION";

        const fileLevel = niveaux[index] || niveaux[0] || "UNKNOWN";

        return Document.create({
          filename: file.originalname,
          url: `${req.protocol}://${req.get('host')}/uploads/${file.filename}`,
          type: docType,
          niveau: fileLevel,
          iduser,
          idpost: comment.idpost,
          idcomment: comment.idcomment,
        });
      });
      await Promise.all(filePromises);
    }

    // Vérifier fichiers existants
    const docsCount = await Document.count({ where: { idcomment } });

    // Validation métier
    if (!newContenu && !newLien && docsCount === 0 && (!req.files || req.files.length === 0)) {
      return res.status(400).json({
        message: "Le commentaire ne peut pas être vide (texte / lien / fichier).",
      });
    }

    // Appliquer modifications
    comment.contenu = newContenu || null;
    comment.lien = newLien || null;
    comment.isAnonymat = newIsAnonymat;
    
    // Mettre à jour le typeContenu si nécessaire
    if (docsCount > 0 || (req.files && req.files.length > 0)) comment.typeContenu = "DOCUMENT";
    else if (newLien) comment.typeContenu = "LIEN";
    else comment.typeContenu = "TEXTE";

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
