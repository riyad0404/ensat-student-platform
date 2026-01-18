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
    // ✅ Toujours envoyer en FormData maintenant (comme createPost)
    console.log('📤 Envoi commentaire avec FormData');
    
    if (commentPayload instanceof FormData) {
      console.log('📦 Contenu FormData:');
      for (let pair of commentPayload.entries()) {
        console.log(`  ${pair[0]}:`, pair[1] instanceof File ? `[FILE: ${pair[1].name}]` : pair[1]);
      }
    }

    const config = {
      headers: { 'Content-Type': 'multipart/form-data' }
    };

    const response = await axiosInstance.post('/comments', commentPayload, config);
    
    console.log('✅ Réponse backend:', response.data);
    
    // Le backend renvoie le commentaire directement avec l'utilisateur
    return response.data;
  } catch (error) {
    console.error('❌ Error creating comment:', error);
    console.error('📋 Détails:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
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
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    console.log('🔐 Token présent?', !!token);
    console.log('🔐 Token (premiers chars):', token ? token.substring(0, 20) + '...' : 'PAS DE TOKEN');
    
    console.log('📤 Envoi de la requête toggle reaction:', {
      idpost,
      typeReaction,
      url: '/reactions/toggle'
    });

    const payload = {
      idpost: parseInt(idpost),
      typeReaction: typeReaction.toUpperCase()
    };

    console.log('📦 Payload envoyé:', payload);

    const response = await axiosInstance.post('/reactions/toggle', payload);

    console.log('✅ Réponse reçue:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error toggling reaction:', error);
    
    if (error.response?.status === 401) {
      console.error('🚨 ERREUR 401: TOKEN INVALIDE OU EXPIRÉ!');
      alert('Session expirée. Veuillez vous reconnecter.');
    }
    
    console.error('📋 Erreur complète:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
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