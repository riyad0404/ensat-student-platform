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
  /*verifyToken: async () => {
    const response = await axiosInstance.get('/auth/verify');
    return response.data;
  }*/
  verifyToken: async () => {
  // ========================
  // POUR LES TESTS DU SPRINT 1
  // ========================
  
  // 1. Récupère le token du localStorage
  const token = localStorage.getItem('authToken');
  
  // 2. Si pas de token, erreur (comme en vrai)
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  // 3. Pour les tests, retourne un utilisateur mock
  console.log('🔐 Mock verifyToken - Simulation backend');
  
  return {
    id: 1,
    name: 'Étudiant ENSA',
    email: 'etudiant@ensa.com',
    role: 'student',
    niveau: '2ème année',
    filiere: 'Génie Informatique',
    token: token // Inclus le token dans la réponse
  };
  
  // ========================
  // POUR LA PRODUCTION (PLUS TARD)
  // ========================
  // À DÉCOMMENTER QUAND LE BACKEND SERA PRÊT :
  //
  // const response = await axiosInstance.get('/auth/verify');
  // return response.data;
},
};