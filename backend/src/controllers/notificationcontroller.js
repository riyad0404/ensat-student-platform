import Notification from "../models/Notification.js";

/*
  GET /api/notifications
  → retourne les notifications de l'utilisateur connecté
*/
export async function getMyNotifications(req, res) {
  try {
    const userId = req.user.iduser;

    const notifications = await Notification.findAll({
      where: { idDestinataire: userId },
      order: [["createdAt", "DESC"]],
    });

    return res.json(notifications);
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

/*
  PATCH /api/notifications/:id/read
  → marque UNE notification comme lue
*/
export async function markNotificationRead(req, res) {
  try {
    const userId = req.user.iduser;
    const notifId = req.params.id;

    const [updated] = await Notification.update(
      { isRead: true },
      { where: { idNotif: notifId, idDestinataire: userId } }
    );

    if (!updated) {
      return res.status(404).json({ message: "Notification introuvable" });
    }

    return res.json({ message: "Notification marquée comme lue" });
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur" });
  }
}
