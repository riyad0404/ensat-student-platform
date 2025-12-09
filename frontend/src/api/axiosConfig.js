import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

// 1. Créer l'instance Axios avec timeout
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,  // ← Utilise localhost:5000/api
  timeout: 10000,  // 10 secondes
  headers: {
    'Content-Type': 'application/json'
  }
});

// 2. Intercepteur pour ajouter automatiquement le token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Intercepteur pour gérer les réponses
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.message);
    return Promise.reject(error);
  }
);

export default axiosInstance;