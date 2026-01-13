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

  sendFile: async (conversationId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await axiosInstance.post(`/conversations/${conversationId}/files`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
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

  updateGroupIcon: async (conversationId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await axiosInstance.put(`/conversations/${conversationId}/icon`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  addMember: async (conversationId, userId) => {
    const res = await axiosInstance.post(`/conversations/${conversationId}/members`, { userId });
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