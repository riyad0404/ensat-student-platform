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
    // Pour FormData (avec fichier), ne pas définir Content-Type
    // Laisser axios ajouter automatiquement multipart/form-data avec boundary
    const config = {};
    if (postData instanceof FormData) {
      config.headers = {
        'Content-Type': undefined  // Supprime l'en-tête par défaut
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

export const createComment = async (idpost, contenu) => {
  try {
    const response = await axiosInstance.post('/comments', {
      idpost,
      contenu,
      isAnonymat: false
    });
    return response.data;
  } catch (error) {
    console.error('Error creating comment:', error);
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
    return { LIKE: 0 }; // Retourner 0 par défaut
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
    // VÉRIFIER LE TOKEN AVANT D'ENVOYER
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
    console.log('🔍 idpost parsé:', payload.idpost, 'type:', typeof payload.idpost);

    const response = await axiosInstance.post('/reactions/toggle', payload);

    console.log('✅ Réponse reçue:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error toggling reaction:', error);
    
    // SI ERREUR 401 = TOKEN INVALIDE OU EXPIRÉ
    if (error.response?.status === 401) {
      console.error('🚨 ERREUR 401: TOKEN INVALIDE OU EXPIRÉ!');
      console.error('🚨 VOUS DEVEZ VOUS RECONNECTER!');
      alert('Session expirée. Veuillez vous reconnecter.');
      // Optionnel: rediriger vers login
      // window.location.href = '/login';
    }
    
    console.error('📋 Erreur complète:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      requestData: {
        idpost: parseInt(idpost),
        typeReaction: typeReaction.toUpperCase()
      }
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