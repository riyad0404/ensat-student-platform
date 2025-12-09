import axiosInstance from './axiosConfig';

// Toutes les fonctions pour l'authentification
export const authAPI = {
  // Connexion utilisateur
  login: async (credentials) => {
    const response = await axiosInstance.post('/auth/login', credentials);
    return response.data;
  },
  
  // Inscription utilisateur
  register: async (userData) => {
    const response = await axiosInstance.post('/auth/register', userData);
    return response.data;
  },
  
  // Déconnexion
  logout: async () => {
    const response = await axiosInstance.post('/auth/logout');
    return response.data;
  },
  
  // Vérifier si le token est valide
  verifyToken: async () => {
    const response = await axiosInstance.get('/auth/verify');
    return response.data;
  }
};