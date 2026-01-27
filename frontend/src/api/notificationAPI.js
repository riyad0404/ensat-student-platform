import axiosInstance from './axiosConfig';

const notificationAPI = {
  // Récupérer toutes les notifications
  getAll: async () => {
    const res = await axiosInstance.get('/notifications');
    return res.data;
  },

  // Marquer une notification comme lue
  markAsRead: async (id) => {
    const res = await axiosInstance.put(`/notifications/mark-as-read/${id}`);
    return res.data;
  },

  // --- Méthodes de déclenchement manuel (si nécessaire) ---
  // Note: Si vos contrôleurs backend (ex: createComment) créent déjà les notifs, 
  // vous n'avez pas besoin d'appeler ces méthodes depuis le front pour éviter les doublons.
  
  notifyLike: async (idpost, typeReaction) => {
    const res = await axiosInstance.post(`/notifications/like/${idpost}`, { typeReaction });
    return res.data;
  },
  
  notifyComment: async (idpost, idcomment) => {
    const res = await axiosInstance.post(`/notifications/comment/${idpost}`, { idcomment });
    return res.data;
  },
  
  notifyReply: async (idcomment, replyId) => {
    const res = await axiosInstance.post(`/notifications/reply/${idcomment}`, { replyId });
    return res.data;
  },
  
  notifyMessage: async (recipientId, conversationId) => {
    const res = await axiosInstance.post('/notifications/message', { recipientId, conversationId });
    return res.data;
  },
  
  notifyGroupInvite: async (idgroup, recipientId) => {
    const res = await axiosInstance.post(`/notifications/group-invite/${idgroup}`, { recipientId });
    return res.data;
  }
};

export default notificationAPI;