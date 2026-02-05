import axiosInstance from './axiosConfig';

export const conversationAPI = {
  getConversations: async () => {
    const res = await axiosInstance.get('/conversations');
    return res.data;
  },

  getConversation: async (conversationId) => {
    const res = await axiosInstance.get(`/conversations/${conversationId}`);
    return res.data;
  },

  getMessages: async (conversationId) => {
    const res = await axiosInstance.get(`/conversations/${conversationId}/messages`);
    return res.data;
  },

  sendMessage: async (conversationId, content) => {
    const res = await axiosInstance.post(`/conversations/${conversationId}/messages`, { content });
    return res.data;
  },

  deleteMessage: async (conversationId, messageId) => {
    const res = await axiosInstance.delete(`/conversations/${conversationId}/messages/${messageId}`);
    return res.data;
  },

  editMessage: async (conversationId, messageId, content) => {
    const res = await axiosInstance.put(`/conversations/${conversationId}/messages/${messageId}`, { content });
    return res.data;
  },

  createDirect: async (otherUserId) => {
    const res = await axiosInstance.post('/conversations/direct', { otherUserId });
    return res.data;
  },

  createGroup: async ({ name, description, memberIds }) => {
    const res = await axiosInstance.post('/conversations/group', { name, nom: name, title: name, description, memberIds });
    return res.data;
  },

  addMember: async (conversationId, userId) => {
    const res = await axiosInstance.post(`/conversations/${conversationId}/members`, { userId });
    return res.data;
  },

  declineJoinRequest: async (conversationId, userId) => {
    const res = await axiosInstance.post(`/conversations/${conversationId}/join/decline`, { userId });
    return res.data;
  },

  transferOwnership: async (conversationId, newOwnerId) => {
    const res = await axiosInstance.post(`/conversations/${conversationId}/transfer`, { newOwnerId });
    return res.data;
  },

  removeMember: async (conversationId, userId) => {
    const res = await axiosInstance.delete(`/conversations/${conversationId}/members/${userId}`);
    return res.data;
  },

  leaveConversation: async (conversationId) => {
    const res = await axiosInstance.post(`/conversations/${conversationId}/leave`);
    return res.data;
  },

  deleteConversation: async (conversationId) => {
    const res = await axiosInstance.delete(`/conversations/${conversationId}`);
    return res.data;
  },

  searchUsers: async (query) => {
    const res = await axiosInstance.get(`/users/search`, { params: { q: query } });
    return res.data;
  },
};

export default conversationAPI;