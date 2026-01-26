import { createNotification, NOTIF_TYPES } from "../services/notificationservice.js";
import { Post } from "../models/post.js";
import { Comment } from "../models/comment.js";
import { Notification } from "../models/notification.js";

// ======================
// Helpers
// ======================
const getUserId = (req) => req.user?.iduser;

const getSenderFromReq = (req) => ({
  iduser: req.user.iduser,
  nom: req.user.nom,
  prenom: req.user.prenom,
  photo: req.user.photo ?? null,
});

// ======================
// Notifications pour Posts
// ======================

// Like / Love un post
export const likePost = async (req, res) => {
  try {
    const iduser = getUserId(req);
    const sender = getSenderFromReq(req);

    const { idpost } = req.params;
    const { typeReaction } = req.body;

    if (!["LIKE", "LOVE"].includes(typeReaction)) {
      return res
        .status(400)
        .json({ message: "typeReaction doit être LIKE ou LOVE" });
    }

    const post = await Post.findByPk(idpost);
    if (!post) return res.status(404).json({ message: "Post non trouvé" });

    const notif = await createNotification({
      toUserId: post.iduser,
      fromUserId: iduser,
      type: NOTIF_TYPES.REACTION_PUB,
      message: `${sender.prenom} ${sender.nom} a réagi à votre post (${typeReaction})`,
      metadata: {
        postId: post.idpost,
        typeReaction,
        sender,
      },
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
    const sender = getSenderFromReq(req);

    const { idpost } = req.params;
    const { idcomment } = req.body;

    const post = await Post.findByPk(idpost);
    if (!post) return res.status(404).json({ message: "Post non trouvé" });

    const notif = await createNotification({
      toUserId: post.iduser,
      fromUserId: iduser,
      type: NOTIF_TYPES.COMMENT_PUB,
      message: `${sender.prenom} ${sender.nom} a commenté votre post`,
      metadata: {
        postId: post.idpost,
        idcomment,
        sender,
      },
    });
    console.log({
  toUserId: post.iduser,
  fromUserId: req.user.iduser
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
    const sender = getSenderFromReq(req);

    const { idcomment } = req.params;
    const { replyId } = req.body;

    const comment = await Comment.findByPk(idcomment);
    if (!comment)
      return res.status(404).json({ message: "Commentaire non trouvé" });

    const notif = await createNotification({
      toUserId: comment.iduser,
      fromUserId: iduser,
      type: NOTIF_TYPES.REPLY_COMMENT,
      message: `${sender.prenom} ${sender.nom} a répondu à votre commentaire`,
      metadata: {
        idcomment: comment.idcomment,
        replyId,
        sender,
      },
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
    const sender = getSenderFromReq(req);

    const { recipientId, conversationId } = req.body;

    const notif = await createNotification({
      toUserId: recipientId,
      fromUserId: iduser,
      type: NOTIF_TYPES.MESSAGE,
      message: `Nouveau message de ${sender.prenom} ${sender.nom}`,
      metadata: {
        conversationId,
        sender,
      },
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
    const sender = getSenderFromReq(req);

    const { recipientId } = req.body;
    const { idgroup } = req.params;

    const notif = await createNotification({
      toUserId: recipientId,
      fromUserId: iduser,
      type: NOTIF_TYPES.GROUP_INVITE,
      message: `${sender.prenom} ${sender.nom} vous a invité dans un groupe`,
      metadata: {
        groupId: idgroup,
        sender,
      },
    });

    res.json(notif);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const inviteAccepted = async (req, res) => {
  try {
    const iduser = getUserId(req);
    const sender = getSenderFromReq(req);

    const { recipientId } = req.body;
    const { idgroup } = req.params;

    const notif = await createNotification({
      toUserId: recipientId,
      fromUserId: iduser,
      type: NOTIF_TYPES.GROUP_INVITE_ACCEPTED,
      message: `${sender.prenom} ${sender.nom} a accepté votre invitation`,
      metadata: {
        groupId: idgroup,
        sender,
      },
    });

    res.json(notif);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const inviteDeclined = async (req, res) => {
  try {
    const iduser = getUserId(req);
    const sender = getSenderFromReq(req);

    const { recipientId } = req.body;
    const { idgroup } = req.params;

    const notif = await createNotification({
      toUserId: recipientId,
      fromUserId: iduser,
      type: NOTIF_TYPES.GROUP_INVITE_DECLINED,
      message: `${sender.prenom} ${sender.nom} a refusé votre invitation`,
      metadata: {
        groupId: idgroup,
        sender,
      },
    });

    res.json(notif);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ======================
// Récupération / lecture
// ======================
export const getNotifications = async (req, res) => {
  try {
    const iduser = getUserId(req);

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

    const notif = await Notification.findByPk(idNotif);
    if (!notif)
      return res.status(404).json({ message: "Notification non trouvée" });

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

// ======================
// Réaction à un commentaire
// ======================
export const reactToComment = async (req, res) => {
  try {
    const iduser = getUserId(req);
    const sender = getSenderFromReq(req);

    const { idcomment } = req.params;
    const { typeReaction } = req.body;

    if (!["LIKE", "LOVE"].includes(typeReaction)) {
      return res
        .status(400)
        .json({ message: "typeReaction doit être LIKE ou LOVE" });
    }

    const comment = await Comment.findByPk(idcomment);
    if (!comment)
      return res.status(404).json({ message: "Commentaire non trouvé" });

    const notif = await createNotification({
      toUserId: comment.iduser,
      fromUserId: iduser,
      type: NOTIF_TYPES.REACTION_COMMENT,
      message: `${sender.prenom} ${sender.nom} a réagi à votre commentaire (${typeReaction})`,
      metadata: {
        idcomment: comment.idcomment,
        typeReaction,
        sender,
      },
    });

    res.json(notif);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
