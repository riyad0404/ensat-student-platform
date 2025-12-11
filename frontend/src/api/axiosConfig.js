// src/api/axiosConfig.js - AJOUTER LA GESTION 401
import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';
import { authAPI } from './authAPI'; // ⭐ IMPORT IMPORTANT

// Variables globales pour gérer le refresh
let isRefreshing = false;
let failedQueue = [];

// Fonction pour traiter la file d'attente
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// 1. Créer l'instance Axios
const axiosInstance = axios.create({
  baseURL: API_BASE_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 2. Intercepteur REQUEST (existant - garder)
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 3. Intercepteur RESPONSE (⭐ NOUVEAU: gère les 401)
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Vérifier si c'est une erreur 401 (token expiré)
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // Si déjà en train de rafraîchir, mettre en file d'attente
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
        .then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        })
        .catch(err => Promise.reject(err));
      }
      
      // Premier 401 → démarrer le refresh
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        console.log('🔄 Token expiré détecté, tentative de rafraîchissement...');
        
        // 1. Récupérer le refreshToken
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          throw new Error('Aucun refresh token disponible');
        }
        
        // 2. Appeler l'API pour rafraîchir
        const newTokens = await authAPI.refreshToken(refreshToken);
        
        // 3. Stocker les nouveaux tokens
        localStorage.setItem('authToken', newTokens.token);
        localStorage.setItem('refreshToken', newTokens.refreshToken);
        
        console.log('✅ Token rafraîchi avec succès !');
        
        // 4. Mettre à jour le header
        originalRequest.headers.Authorization = `Bearer ${newTokens.token}`;
        
        // 5. Traiter la file d'attente
        processQueue(null, newTokens.token);
        
        // 6. Rejouer la requête originale
        return axiosInstance(originalRequest);
        
      } catch (refreshError) {
        console.error('❌ Échec du rafraîchissement:', refreshError);
        
        // Échec critique → déconnecter l'utilisateur
        processQueue(refreshError, null);
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        
        // Rediriger vers login
        if (window.location.pathname !== '/login') {
          window.location.href = '/login?error=session_expired';
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    // Pour les autres erreurs
    return Promise.reject(error);
  }
);

export default axiosInstance;