import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  createPost,
  getAllPosts,
  getMyPosts,
  getPostById,
  updatePost,
  deletePost,
} from "../controllers/postcontroller.js";

const router = express.Router();

// Créer une publication
router.post("/", authMiddleware, createPost);

// Mur des publications
router.get("/", authMiddleware, getAllPosts);

// Mes publications
router.get("/mesposts", authMiddleware, getMyPosts);

// Une publication par id
router.get("/:idpost", authMiddleware, getPostById);

// Modifier une publication
router.put("/:idpost", authMiddleware, updatePost);

// Supprimer une publication
router.delete("/:idpost", authMiddleware, deletePost);

export default router;
