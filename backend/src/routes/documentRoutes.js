import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { uploadSingle } from "../middleware/uploadMiddleware.js";
import { uploadDocument } from "../controllers/documentControllers.js";

const router = express.Router();

// POST /api/documents/upload
router.post("/upload", authMiddleware, uploadSingle, uploadDocument);

export default router;
