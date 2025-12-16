import { Reaction } from "../models/reaction.js";

const ALLOWED = new Set(["LIKE", "LOVE"]);

/**
 * Toggle reaction:
 * - si l'utilisateur a déjà mis ce type (LIKE ou LOVE) sur ce post => on supprime
 * - sinon => on crée
 *
 * Permet LIKE et LOVE en même temps (2 lignes différentes)
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

    return res.status(201).json(reaction);
  } catch (error) {
    console.error("toggleReaction:", error);
    return res.status(500).json({ message: "Erreur réaction" });
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
 * Mes réactions sur un post (utile UI)
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
