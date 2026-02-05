import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { anonymousSafety } from "../middleware/anonymousSafety.js";
import {uploadSingle,uploadMany,multerErrorHandler} from "../middleware/uploadMiddleware.js";
import {
  createPost,
  getAllPosts,
  getMyPosts,
  getPostById,
  updatePost,
  deletePost,
} from "../controllers/postcontroller.js";

const router = express.Router();

// Créer une publication (0 ou 1 fichier => champ: "file")
router.post("/pubdoc", authMiddleware, uploadSingle, multerErrorHandler, createPost);
// Créer une publication (plusieurs fichiers => champ: "files")
router.post("/pldoc", authMiddleware, uploadMany, multerErrorHandler, createPost);
// Mur des publications
router.get(
  "/",
  authMiddleware,
  getAllPosts,
  anonymousSafety,
  (req, res) => res.json(res.locals.data)
);

// Mes publications
router.get("/mesposts", authMiddleware, getMyPosts);

// Une publication par id
router.get(
  "/:idpost",
  authMiddleware,
  getPostById,
  anonymousSafety,
  (req, res) => res.json(res.locals.data)
);

// Modifier une publication
router.patch("/:idpost", authMiddleware, updatePost);

// Supprimer une publication
router.delete("/:idpost", authMiddleware, deletePost);

export default router;