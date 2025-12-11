import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api/authAPI';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

 useEffect(() => {
  const checkAuth = async () => {
    const token = localStorage.getItem('authToken');
    
    if (token) {
      try {
        const userData = await authAPI.verifyToken();
        setUser(userData);
      } catch (error) {
        console.log('⚠️ Backend non disponible, mais on garde le token pour les tests');
        // On garde le token même si vérification échoue
        setUser({ token, name: 'Utilisateur (backend offline)' });
        // ⚠️ NE PAS FAIRE : localStorage.removeItem('authToken');
      }
    }
    setLoading(false);
  };
  
  checkAuth();
}, []);


 const login = async (credentials) => {
  try {
    const data = await authAPI.login(credentials);
    
    // ⭐ STOCKER LES DEUX TOKENS
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('refreshToken', data.refreshToken || data.token);
    
    setUser(data.user);
    navigate('/');
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const register = async (userData) => {
  try {
    const data = await authAPI.register(userData);
    
    // ⭐ STOCKER LES DEUX TOKENS
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('refreshToken', data.refreshToken || data.token);
    
    setUser(data.user);
    navigate('/');
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const logout = async () => {
  try {
    await authAPI.logout();
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // ⭐ SUPPRIMER LES DEUX TOKENS
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    
    setUser(null);
    navigate('/login');
  }};

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading, }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};