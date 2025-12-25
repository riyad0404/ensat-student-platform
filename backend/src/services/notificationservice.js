import NotificationModel from "../models/Notification.js";
import sequelize from "./database.js";
import { DataTypes } from "sequelize";

const Notification = NotificationModel(sequelize, DataTypes);

export const NOTIF_TYPES = {
  REACTION_PUB: "REACTION_PUB",
  COMMENT_PUB: "COMMENT_PUB",
  REPLY_COMMENT: "REPLY_COMMENT",
  MESSAGE: "MESSAGE",
  GROUP_INVITE: "GROUP_INVITE",
  GROUP_INVITE_ACCEPTED: "GROUP_INVITE_ACCEPTED",
  GROUP_INVITE_DECLINED: "GROUP_INVITE_DECLINED",
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

  return await Notification.create({
    idDestinataire: toUserId,
    idSourceUser: fromUserId,
    type,
    message,
    metadata,
    isRead: false,
  });
}
