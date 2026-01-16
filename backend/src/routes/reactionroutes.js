import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  toggleReaction,
  toggleReactionOnComment,
  getReactionCountsByPost,
  getMyReactionsOnPost,
   getMyReactionsOnComment,
  getReactionCountsByComment,
} from "../controllers/reactionControllers.js";

const router = express.Router();

// ajouter / retirer une réaction (LIKE ou LOVE)
router.post("/toggle", authMiddleware, toggleReaction);
router.post("/comment", authMiddleware, toggleReactionOnComment);
// compter les réactions d’un post
router.get("/post/:idpost/counts", authMiddleware, getReactionCountsByPost);

// mes réactions sur un post
router.get("/post/:idpost/mes", authMiddleware, getMyReactionsOnPost);
// GET compte réactions commentaire
router.get("/comment/:idcomment/counts", authMiddleware, getReactionCountsByComment);

// GET mes réactions sur commentaire
router.get("/comment/:idcomment/mes", authMiddleware, getMyReactionsOnComment);
export default router;
