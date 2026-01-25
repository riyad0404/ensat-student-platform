import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  likePost,
  commentPost,
  replyComment,
  messagePrivate,
  groupInvite,
  inviteAccepted,
  inviteDeclined,
  reactToComment,
  getNotifications,
  markAsRead,
} from "../controllers/notificationcontroller.js";

const router = express.Router();

// Toutes les routes nécessitent l'auth
router.use(authMiddleware);

// Post
router.post("/like/:idpost", likePost);
router.post("/comment/:idpost", commentPost);
router.post("/reply/:idcomment", replyComment);

// Messages privés
router.post("/message", messagePrivate);

// Invitations de groupe
router.post("/group-invite/:idgroup", groupInvite);
router.post("/group-invite/accepted/:idgroup", inviteAccepted);
router.post("/group-invite/declined/:idgroup", inviteDeclined);

// Récupérer et gérer les notifications
router.get("/", getNotifications);
router.put("/mark-as-read/:idNotif", markAsRead);
// Réaction sur un commentaire (ajoutée dans notificationroutes.js)
router.post("/comment/react/:idcomment", reactToComment);

export default router;