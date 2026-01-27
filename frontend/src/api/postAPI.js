import axiosInstance from './axiosConfig';

export const getAllPosts = async () => {
  try {
    const response = await axiosInstance.get('/posts'); 
    return response.data;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
};

export const getMyPosts = async () => {
  try {
    const response = await axiosInstance.get('/posts/my-posts');
    return response.data;
  } catch (error) {
    console.error('Error fetching my posts:', error);
    throw error;
  }
};

export const getPostById = async (idpost) => {
  try {
    const response = await axiosInstance.get(`/posts/${idpost}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching post:', error);
    throw error;
  }
};

export const createPost = async (postData) => {
  try {
    const config = {};
    if (postData instanceof FormData) {
      config.headers = {
        'Content-Type': undefined
      };
    }
    
    const response = await axiosInstance.post('/posts/pubdoc', postData, config);
    return response.data;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

// COMMENTS
export const getCommentsByPost = async (idpost) => {
  try {
    const response = await axiosInstance.get(`/comments/post/${idpost}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
};

export const createComment = async (idpost, commentPayload) => {
  try {
    let config = {};

    if (commentPayload instanceof FormData) {
      config.headers = { 'Content-Type': 'multipart/form-data' };
    } else {
      commentPayload = {
        idpost: parseInt(idpost),
        contenu: commentPayload.contenu.trim(),
        isAnonymat: commentPayload.isAnonymat === true,
        idparent: commentPayload.idparent // ✅ Ajout du support pour idparent
      };
    }

    const response = await axiosInstance.post('/comments', commentPayload, config);
    const newComment = response.data.comment || response.data;
    return newComment;
  } catch (error) {
    console.error('❌ Error creating comment:', error);
    throw error;
  }
};

// REACTIONS
export const getReactionCounts = async (idpost) => {
  try {
    const response = await axiosInstance.get(`/reactions/post/${idpost}/counts`);
    return response.data;
  } catch (error) {
    console.error('Error fetching reaction counts:', error);
    return { LIKE: 0 };
  }
};

export const getMyReactions = async (idpost) => {
  try {
    const response = await axiosInstance.get(`/reactions/post/${idpost}/mes`);
    return response.data;
  } catch (error) {
    console.error('Error fetching my reactions:', error);
    return null;
  }
};

export const toggleReaction = async (idpost, typeReaction = 'LIKE') => {
  try {
    const payload = {
      idpost: parseInt(idpost),
      typeReaction: typeReaction.toUpperCase()
    };
    const response = await axiosInstance.post('/reactions/toggle', payload);
    return response.data;
  } catch (error) {
    console.error('❌ Error toggling reaction:', error);
    throw error;
  }
};

export const deletePost = async (idpost) => {
  const response = await axiosInstance.delete(`/posts/${idpost}`);
  return response.data;
};

export const updatePost = async (idpost, data) => {
  const response = await axiosInstance.patch(`/posts/${idpost}`, data); 
  return response.data;
};

export const searchUsers = async (query) => {
  const response = await axiosInstance.get(`/users/search?q=${query}`);
  return response.data;
};
// Supprimer un commentaire
export const deleteComment = async (id) => {
  const response = await axiosInstance.delete(`/comments/${id}`);
  return response.data;
};

// Modifier un commentaire
export const updateComment = async (id, data) => {
  const response = await axiosInstance.patch(`/comments/${id}`, data);
  return response.data;
};

export const toggleCommentReaction = async (id, type) => {
  // Utilisation de la route de réaction générique ou spécifique selon configuration backend
  const response = await axiosInstance.post(`/reactions/toggle-comment`, { 
    idcomment: parseInt(id),
    typeReaction: type 
  });
  return response.data;
};

export const replyToComment = async (id, data) => {
  // Contournement : Utiliser la route de création standard qui gère idparent
  // data doit contenir { contenu, idpost }
  const response = await axiosInstance.post(`/comments`, {
    idparent: id,
    idpost: data.idpost,
    contenu: data.contenu,
    isAnonymat: false
  });
  return response.data;
};