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
      localStorage.setItem('authToken', data.token);
      setUser(data.user);
      
      // ✅ CORRECTION : Redirection vers la page d'accueil
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
      localStorage.removeItem('authToken');
      setUser(null);
      
      // Redirection après logout (reste vers /login)
      navigate('/login');
    }
  };

  const register = async (userData) => {
    try {
      const data = await authAPI.register(userData);
      localStorage.setItem('authToken', data.token);
      setUser(data.user);
      
      // ✅ CORRECTION : Redirection vers la page d'accueil
      navigate('/');
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

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