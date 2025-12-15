import axios from 'axios';

axios.defaults.withCredentials = true; 

// Configuration de l'instance Axios
const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  // withCredentials: true est déjà défini globalement ci-dessus
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercepteur pour logger les requêtes (optionnel, utile pour le debug)
axiosInstance.interceptors.request.use(
  (config) => {
    console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Erreur requête:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les réponses
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`❌ ${error.response?.status || 'No status'} ${error.config?.url}`);
    
    // ⚠️ NE PAS rediriger pour les routes de reset-password
    const currentPath = window.location.pathname;
    const isResetPasswordRoute = currentPath.startsWith('/reset-password/');
    
    if (error.response?.status === 401 && !isResetPasswordRoute) {
      console.log('🔒 Session expirée, redirection vers login...');
      if (currentPath !== '/login') {
        window.location.href = '/login';
      }
    }
    
    if (!error.response) {
      console.error('🌐 Erreur réseau - Vérifiez votre connexion');
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;