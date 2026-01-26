import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  uploadAny,
  multerErrorHandler
} from "../middleware/uploadMiddleware.js";
import {
  createComment,
  getCommentsByPost,
  getMyComments,
  reactComment,
  replyComment,
  getCommentById,
  updateComment,
  deleteComment,
} from "../controllers/commentController.js";

const router = express.Router();

// CREATE comment (texte / lien / 1 ou plusieurs fichiers)
router.post( "/",authMiddleware,uploadAny,multerErrorHandler,createComment);
// GET comments d'un post
router.get("/post/:idpost", authMiddleware, getCommentsByPost);
// GET mes comments
router.get("/mescomments", authMiddleware, getMyComments);
// UPDATE comment (texte / lien uniquement)
router.get("/:idcomment", authMiddleware, getCommentById);
router.patch("/:idcomment", authMiddleware, updateComment);
// DELETE comment + documents + fichiers
router.delete("/:idcomment", authMiddleware, deleteComment);
// Exemple de route pour répondre à un commentaire
router.post("/comment/reply/:idcomment", authMiddleware, replyComment);
router.post('/:idcomment/react', authMiddleware, reactComment);

export default router;
