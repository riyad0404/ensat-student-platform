import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { uploadSingle } from "../middleware/uploadMiddleware.js";
import { uploadDocument ,getAllDocuments} from "../controllers/documentControllers.js";
const router = express.Router();

// POST /api/documents/upload
router.post("/upload", authMiddleware, uploadSingle, uploadDocument);
router.get("/library", getAllDocuments);

export default router;
