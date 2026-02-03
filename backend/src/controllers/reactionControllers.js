import { Reaction } from "../models/reaction.js";
import { Post } from "../models/post.js";
import { Comment } from "../models/comment.js";
import { createNotification, NOTIF_TYPES } from "../services/notificationservice.js";

const ALLOWED = new Set(["LIKE", "LOVE"]);

/**
 * Toggle reaction on a post:
 * - si l'utilisateur a déjà mis ce type (LIKE ou LOVE) sur ce post => on supprime
 * - sinon => on crée
 */
export const toggleReaction = async (req, res) => {
  try {
    const iduser = req.user.iduser;
    const { idpost, typeReaction } = req.body;

    if (!idpost) {
      return res.status(400).json({ message: "idpost obligatoire" });
    }
    if (!typeReaction || !ALLOWED.has(typeReaction)) {
      return res.status(400).json({ message: "typeReaction doit être LIKE ou LOVE" });
    }

    const existing = await Reaction.findOne({
      where: { iduser, idpost, typeReaction },
    });

    // déjà existante => supprimer (retirer la réaction)
    if (existing) {
      await existing.destroy();
      return res.json({ message: "Réaction supprimée", removed: true });
    }

    // sinon créer
    const reaction = await Reaction.create({
      iduser,
      idpost,
      typeReaction,
    });

    // 🔔 NOTIFICATION : réaction sur un post
    const post = await Post.findByPk(idpost);
    if (post) {
      await createNotification({
        toUserId: post.iduser,
        fromUserId: iduser,
        type: NOTIF_TYPES.REACTION_PUB,
        message: `${req.user.prenom} ${req.user.nom} a réagi à votre post (${typeReaction})`,
        metadata: {
          idpost: post.idpost,
          idcomment: null, // Aucun commentaire, c'est une réaction sur un post
          typeReaction,
          sender: {
            iduser: req.user.iduser,
            nom: req.user.nom,
            prenom: req.user.prenom,
            photo: req.user.photo ?? null,
          },
        },
      });
    }

    return res.status(201).json(reaction);
  } catch (error) {
    console.error("toggleReaction:", error);
    return res.status(500).json({ message: "Erreur réaction" });
  }
};

/**
 * Toggle reaction on a comment
 * - si l'utilisateur a déjà mis ce type (LIKE ou LOVE) sur ce commentaire => on supprime
 * - sinon => on crée
 */
export const toggleReactionOnComment = async (req, res) => {
  try {
    const iduser = req.user.iduser;
    const idcomment = Number(req.body.idcomment);
    const { typeReaction } = req.body;

    if (!idcomment) {
      return res.status(400).json({ message: "idcomment obligatoire" });
    }

    if (!typeReaction || !ALLOWED.has(typeReaction)) {
      return res.status(400).json({ message: "typeReaction invalide" });
    }

    const existing = await Reaction.findOne({
      where: { iduser, idcomment, typeReaction },
    });

    // toggle OFF
    if (existing) {
      await existing.destroy();
      return res.json({ message: "Réaction supprimée", removed: true });
    }

    // toggle ON
    const reaction = await Reaction.create({
      iduser,
      idcomment,
      idpost: null,
      typeReaction,
    });

    // 🔔 NOTIFICATION : réaction sur un commentaire
    const comment = await Comment.findByPk(idcomment);
    if (comment) {
      await createNotification({
        toUserId: comment.iduser,  // Destinataire : auteur du commentaire
        fromUserId: iduser,        // Expéditeur : utilisateur qui réagit
        type: NOTIF_TYPES.REACTION_COMMENT,
        message: `${req.user.prenom} ${req.user.nom} a réagi à votre commentaire (${typeReaction})`,
        metadata: {
          idpost: comment.idpost,
          idcomment: comment.idcomment,  // Commentaire auquel la réaction est ajoutée
          sender: {
            iduser: req.user.iduser,
            nom: req.user.nom,
            prenom: req.user.prenom,
            photo: req.user.photo ?? null,
          },
        },
      });
    }

    return res.status(201).json(reaction);
  } catch (error) {
    console.error("toggleReactionOnComment:", error);
    return res.status(500).json({ message: "Erreur réaction commentaire" });
  }
};

/**
 * Compter les réactions d’un post
 * Retour: { likes: X, loves: Y }
 */
export const getReactionCountsByPost = async (req, res) => {
  try {
    const idpost = Number(req.params.idpost);
    if (!idpost) return res.status(400).json({ message: "idpost invalide" });

    const likes = await Reaction.count({ where: { idpost, typeReaction: "LIKE" } });
    const loves = await Reaction.count({ where: { idpost, typeReaction: "LOVE" } });

    return res.json({ idpost, likes, loves });
  } catch (error) {
    console.error("getReactionCountsByPost:", error);
    return res.status(500).json({ message: "Erreur compte réactions" });
  }
};

/**
 * Compter les réactions d’un commentaire
 * Retour: { likes: X, loves: Y }
 */
export const getReactionCountsByComment = async (req, res) => {
  try {
    const idcomment = Number(req.params.idcomment);
    if (!idcomment) {
      return res.status(400).json({ message: "idcomment invalide" });
    }

    const likes = await Reaction.count({
      where: { idcomment, typeReaction: "LIKE" },
    });

    const loves = await Reaction.count({
      where: { idcomment, typeReaction: "LOVE" },
    });

    return res.json({ idcomment, likes, loves });
  } catch (error) {
    console.error("getReactionCountsByComment:", error);
    return res.status(500).json({ message: "Erreur compte réactions commentaire" });
  }
};

/**
 * Mes réactions sur un post
 * Retour: { hasLike: true/false, hasLove: true/false }
 */
export const getMyReactionsOnPost = async (req, res) => {
  try {
    const iduser = req.user.iduser;
    const idpost = Number(req.params.idpost);
    if (!idpost) return res.status(400).json({ message: "idpost invalide" });

    const my = await Reaction.findAll({
      where: { iduser, idpost },
      attributes: ["typeReaction"],
    });

    const types = my.map((r) => r.typeReaction);
    return res.json({
      idpost,
      hasLike: types.includes("LIKE"),
      hasLove: types.includes("LOVE"),
    });
  } catch (error) {
    console.error("getMyReactionsOnPost:", error);
    return res.status(500).json({ message: "Erreur mes réactions" });
  }
};

/**
 * Mes réactions sur un commentaire
 * Retour: { hasLike: true/false, hasLove: true/false }
 */
export const getMyReactionsOnComment = async (req, res) => {
  try {
    const iduser = req.user.iduser;
    const idcomment = Number(req.params.idcomment);

    if (!idcomment) {
      return res.status(400).json({ message: "idcomment invalide" });
    }

    const my = await Reaction.findAll({
      where: { iduser, idcomment },
      attributes: ["typeReaction"],
    });

    const types = my.map((r) => r.typeReaction);

    return res.json({
      idcomment,
      hasLike: types.includes("LIKE"),
      hasLove: types.includes("LOVE"),
    });
  } catch (error) {
    console.error("getMyReactionsOnComment:", error);
    return res.status(500).json({ message: "Erreur mes réactions commentaire" });
  }
};
