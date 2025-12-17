import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  toggleReaction,
  getReactionCountsByPost,
  getMyReactionsOnPost,
} from "../controllers/reactionControllers.js";

const router = express.Router();

// ajouter / retirer une réaction (LIKE ou LOVE)
router.post("/toggle", authMiddleware, toggleReaction);

// compter les réactions d’un post
router.get("/post/:idpost/counts", authMiddleware, getReactionCountsByPost);

// mes réactions sur un post
router.get("/post/:idpost/mes", authMiddleware, getMyReactionsOnPost);

export default router;
