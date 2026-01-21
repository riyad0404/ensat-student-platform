import { createNotification, NOTIF_TYPES } from "../services/notificationservice.js";
import { Post } from "../models/post.js";
import { Comment } from "../models/comment.js";
import { Notification } from "../models/notification.js";
// Helper pour récupérer l'iduser depuis body (Postman) ou req.user si JWT
const getUserId = (req) => req.body.iduser || req.user?.iduser;

// ======================
// Notifications pour Posts
// ======================

// Like un post
// Like ou Love un post (modification minime)
export const likePost = async (req, res) => {
  try {
    const iduser = getUserId(req);
    const { idpost } = req.params;
    const { typeReaction } = req.body; // <-- ajout pour récupérer LIKE ou LOVE

    if (!typeReaction || !["LIKE", "LOVE"].includes(typeReaction)) {
      return res.status(400).json({ message: "typeReaction doit être LIKE ou LOVE" });
    }

    const post = await Post.findByPk(idpost);
    if (!post) return res.status(404).json({ message: "Post non trouvé" });

    const notif = await createNotification({
      toUserId: post.iduser,
      fromUserId: iduser,
      type: NOTIF_TYPES.REACTION_PUB,
      message: `Votre post a reçu une réaction : ${typeReaction}`, // message dynamique
      metadata: { postId: post.idpost, typeReaction }, // metadata inclut typeReaction
    });

    res.json(notif);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Commenter un post
export const commentPost = async (req, res) => {
  try {
    const iduser = getUserId(req);
    const { idpost } = req.params;
    const { idcomment } = req.body;

    const post = await Post.findByPk(idpost);
    if (!post) return res.status(404).json({ message: "Post non trouvé" });

    const notif = await createNotification({
      toUserId: post.iduser,
      fromUserId: iduser,
      type: NOTIF_TYPES.COMMENT_PUB,
      message: `Votre post a reçu un commentaire`,
      metadata: { postId: post.idpost, idcomment },
    });

    res.json(notif);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Répondre à un commentaire
export const replyComment = async (req, res) => {
  try {
    const iduser = getUserId(req);
    const { idcomment } = req.params;
    const { replyId } = req.body;

    const comment = await Comment.findByPk(idcomment);
    if (!comment) return res.status(404).json({ message: "Commentaire non trouvé" });

    const notif = await createNotification({
      toUserId: comment.iduser,
      fromUserId: iduser,
      type: NOTIF_TYPES.REPLY_COMMENT,
      message: `Quelqu'un a répondu à votre commentaire`,
      metadata: { idcomment: comment.idcomment, replyId },
    });

    res.json(notif);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ======================
// Messages privés
// ======================
export const messagePrivate = async (req, res) => {
  try {
    const iduser = getUserId(req);
    const { recipientId, conversationId } = req.body;

    const notif = await createNotification({
      toUserId: recipientId,
      fromUserId: iduser,
      type: NOTIF_TYPES.MESSAGE,
      message: `Vous avez reçu un message`,
      metadata: { conversationId },
    });

    res.json(notif);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ======================
// Invitations de groupe
// ======================
export const groupInvite = async (req, res) => {
  try {
    const iduser = getUserId(req);
    const { recipientId } = req.body;
    const { idgroup } = req.params;

    const notif = await createNotification({
      toUserId: recipientId,
      fromUserId: iduser,
      type: NOTIF_TYPES.GROUP_INVITE,
      message: `Vous avez été invité à un groupe`,
      metadata: { groupId: idgroup },
    });

    res.json(notif);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const inviteAccepted = async (req, res) => {
  try {
    const iduser = getUserId(req);
    const { recipientId } = req.body;
    const { idgroup } = req.params;

    const notif = await createNotification({
      toUserId: recipientId,
      fromUserId: iduser,
      type: NOTIF_TYPES.GROUP_INVITE_ACCEPTED,
      message: `Votre invitation a été acceptée`,
      metadata: { groupId: idgroup },
    });

    res.json(notif);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const inviteDeclined = async (req, res) => {
  try {
    const iduser = getUserId(req);
    const { recipientId } = req.body;
    const { idgroup } = req.params;

    const notif = await createNotification({
      toUserId: recipientId,
      fromUserId: iduser,
      type: NOTIF_TYPES.GROUP_INVITE_DECLINED,
      message: `Votre invitation a été refusée`,
      metadata: { groupId: idgroup },
    });

    res.json(notif);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ======================
// Récupérer et gérer les notifications
// ======================
export const getNotifications = async (req, res) => {
  try {
    const iduser = req.user.iduser; // récupéré depuis le cookie

    const notifications = await Notification.findAll({
      where: { idDestinataire: iduser },
      order: [["createdAt", "DESC"]],
    });

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



export const markAsRead = async (req, res) => {
  try {
    const iduser = getUserId(req);
    const { idNotif } = req.params;

    const notif = await createNotification.Notification.findByPk(idNotif);
    if (!notif) return res.status(404).json({ message: "Notification non trouvée" });

    if (notif.idDestinataire !== iduser) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    notif.isRead = true;
    await notif.save();
    res.json(notif);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// Fonction pour créer une notification lorsqu'un utilisateur réagit à un commentaire
export const commentReactionNotification = async (req, res) => {
  try {
    const iduser = getUserId(req); // L'utilisateur qui réagit
    const { typeReaction } = req.body; // Le type de réaction (LIKE ou LOVE)
    const { idcomment } = req.params; // L'ID du commentaire auquel l'utilisateur réagit

    if (!typeReaction || !["LIKE", "LOVE"].includes(typeReaction)) {
      return res.status(400).json({ message: "typeReaction doit être LIKE ou LOVE" });
    }

    // Récupérer le commentaire auquel l'utilisateur réagit
    const comment = await Comment.findByPk(idcomment);
    if (!comment) {
      return res.status(404).json({ message: "Commentaire non trouvé" });
    }

    // Création de la notification pour le propriétaire du commentaire
    const notif = await createNotification({
      toUserId: comment.iduser, // Le destinataire est l'utilisateur qui a posté le commentaire
      fromUserId: iduser, // L'utilisateur qui réagit
      type: NOTIF_TYPES.REACTION_PUB, // Type de notification
      message: `Votre commentaire a reçu une réaction : ${typeReaction}`, // Message de notification
      metadata: { idcomment, typeReaction }, // Metadata avec l'ID du commentaire et le type de réaction
    });

    // Réponse avec la notification créée
    res.json(notif);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
