import express from "express";
import { searchUsers } from "../controllers/userController.js";
import { getUserById } from "../controllers/userController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/search", authMiddleware, searchUsers);
router.get("/:id", authMiddleware, getUserById);
export default router;