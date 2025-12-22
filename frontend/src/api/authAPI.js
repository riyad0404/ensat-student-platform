import axiosInstance from './axiosConfig';

//  IMPORTANT : Avec les cookies HTTP-only, on ne gère PAS les tokens manuellement
// Le backend les envoie/supprime automatiquement dans les cookies

export const authAPI = {
  //  Connexion - Le token est stocké automatiquement dans un cookie HTTP-only
  login: async (credentials) => {
    try {
      console.log(' Tentative de connexion...');
      const response = await axiosInstance.post('/auth/login', credentials);
      
      console.log(' Connexion réussie:', response.data);
      return response.data; // Retourne { message, user }
      
    } catch (error) {
      console.error(' Erreur de connexion:', {
        status: error.response?.status,
        message: error.response?.data?.error || error.message
      });
      throw error; // Laissez le contexte gérer l'erreur
    }
  },

  //  Inscription
 register: async (userData) => {
  try {
    console.log('📝 Tentative d\'inscription...');
    
    // Log des données envoyées
    console.log('📤 Données envoyées:', JSON.stringify(userData, null, 2));
    
    const response = await axiosInstance.post('/auth/signup', userData);
    
    console.log('✅ Inscription réussie:', response.data);
    return response.data;
    
  } catch (error) {
    // ⚠️ AFFICHEZ L'ERREUR COMPLÈTE
    console.error('❌ ERREUR DÉTAILLÉE inscription:');
    
    if (error.response) {
      // Le serveur a répondu avec un statut d'erreur
      console.error('Status:', error.response.status);
      console.error('Status Text:', error.response.statusText);
      console.error('Headers:', error.response.headers);
      console.error('Data:', error.response.data);
      
      // Extrayez le message d'erreur spécifique
      const errorMessage = error.response.data?.error || 
                          error.response.data?.message || 
                          error.response.data?.details ||
                          'Erreur d\'inscription';
      
      console.error('Message d\'erreur:', errorMessage);
      
      // Lancez l'erreur avec les détails
      throw {
        message: errorMessage,
        status: error.response.status,
        data: error.response.data
      };
    } else if (error.request) {
      // La requête a été faite mais pas de réponse
      console.error('Request:', error.request);
      throw { message: 'Pas de réponse du serveur' };
    } else {
      // Erreur de configuration
      console.error('Error:', error.message);
      throw { message: error.message };
    }
  }
},
  // Vérification de session - Utilise le cookie HTTP-only automatiquement
  verifyToken: async () => {
    try {
      console.log('🔍 Vérification de la session...');
      const response = await axiosInstance.get('/auth/me');
      
      console.log(' Session active:', response.data.user?.email);
      return response.data; // Retourne { user }
      
    } catch (error) {
      console.log(' Session expirée ou non authentifié');
      throw new Error('Non authentifié');
    }
  },

  // Déconnexion - Le backend supprime le cookie
  logout: async () => {
    try {
      console.log(' Déconnexion en cours...');
      const response = await axiosInstance.post('/auth/logout');
      
      console.log(' Déconnexion réussie');
      return response.data; // Retourne { message }
      
    } catch (error) {
      console.error(' Erreur lors de la déconnexion:', error);
      // Même en cas d'erreur, on considère l'utilisateur déconnecté côté front
      return { success: false };
    }
  },
 //  Mettre à jour le profil
  updateProfile: async (userData) => {
    try {
      console.log('🔄 Tentative de mise à jour du profil...');
      
      // Log des données envoyées
      console.log('📤 Données envoyées:', JSON.stringify(userData, null, 2));
      
      const response = await axiosInstance.put('/auth/update-profile', userData);
      
      console.log('✅ Profil mis à jour:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('❌ ERREUR DÉTAILLÉE updateProfile:');
      
      if (error.response) {
        // Le serveur a répondu avec un statut d'erreur
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
        
        const errorMessage = error.response.data?.error || 
                            error.response.data?.message || 
                            error.response.data?.details ||
                            'Erreur de mise à jour du profil';
        
        console.error('Message d\'erreur:', errorMessage);
        
        throw {
          message: errorMessage,
          status: error.response.status,
          data: error.response.data
        };
      } else if (error.request) {
        // La requête a été faite mais pas de réponse
        console.error('Request:', error.request);
        throw { message: 'Pas de réponse du serveur' };
      } else {
        // Erreur de configuration
        console.error('Error:', error.message);
        throw { message: error.message };
      }
    }
  }
 
};    