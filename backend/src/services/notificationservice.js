import { Notification } from "../models/notification.js";
import { io, onlineUsers } from "../server.js";

export const NOTIF_TYPES = {
  REACTION_PUB: "REACTION_PUB",
  COMMENT_PUB: "COMMENT_PUB",
  REPLY_COMMENT: "REPLY_COMMENT",
  MESSAGE: "MESSAGE",
  GROUP_INVITE: "GROUP_INVITE",
  GROUP_INVITE_ACCEPTED: "GROUP_INVITE_ACCEPTED",
  GROUP_INVITE_DECLINED: "GROUP_INVITE_DECLINED",
  JOIN_REQUEST: "JOIN_REQUEST",
  REACTION_COMMENT: "REACTION_COMMENT",
    JOIN_ACCEPTED: "JOIN_ACCEPTED",  // Quand un admin accepte une demande
  GROUP_ADD: "GROUP_ADD",  // Quand un admin ajoute un membre
};

export async function createNotification({
  toUserId,
  fromUserId = null,
  type,
  message,
  metadata = null,
}) {
  // sécurité
  if (!toUserId) return null;
  if (fromUserId && Number(toUserId) === Number(fromUserId)) return null;

  // 1. Création en BDD
  const notif = await Notification.create({
    idDestinataire: toUserId,
    idSourceUser: fromUserId,
    type,
    message,
    metadata,
    isRead: false,
  });

  // 2. Émission temps réel si utilisateur en ligne
  const socketId = onlineUsers.get(String(toUserId));
  if (socketId) {
    io.to(socketId).emit("receive_notification", notif);
  }

  return notif;
}
