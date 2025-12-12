import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api/authAPI';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ✅ Vérifie si l'utilisateur est connecté via cookies
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('🔄 Vérification de la session...');
        
        // Le backend vérifie automatiquement le cookie HTTP-only
        const response = await authAPI.verifyToken();
        
        if (response.user) {
          console.log(' Utilisateur connecté:', response.user.email);
          setUser(response.user);
        } else {
          console.log(' Pas d\'utilisateur dans la réponse');
          setUser(null);
        }
      } catch (error) {
        console.log(' Non connecté ou session expirée');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  //  Connexion avec cookies HTTP-only
  // Dans la fonction login de AuthContext.jsx
const login = async (credentials) => {
  try {
    console.log('🎯 Tentative de connexion...');
    const data = await authAPI.login(credentials);
    
    console.log('✅ Réponse backend login:', data);
    
    if (data.user) {
      console.log('✅ Utilisateur connecté:', data.user.email);
      setUser(data.user);
      
      // ⚠️ Redirige APRÈS avoir mis à jour l'état
      setTimeout(() => {
        console.log('🔄 Redirection vers /...');
        navigate('/', { replace: true });
      }, 50); // Petit délai pour que React mette à jour l'état
      
      return { success: true };
    } else {
      console.error('❌ Pas d\'utilisateur dans la réponse');
      return { success: false, error: 'Utilisateur non reçu' };
    }
  } catch (error) {
    console.error('❌ Erreur login dans contexte:', error);
    
    const errorMsg = error.response?.data?.error || 
                    error.response?.data?.message || 
                    error.message || 
                    'Email ou mot de passe incorrect';
    
    return { success: false, error: errorMsg };
  }
};

  //  Inscription
  const register = async (userData) => {
    try {
      console.log(' Inscription en cours...');
      const result = await authAPI.register(userData);
      
      console.log(' Réponse inscription:', result);
      
      // Le backend retourne { message: 'Utilisateur créé avec succès', user: {...} }
      if (result.message) {
        console.log(' Inscription réussie! Redirection vers login...');
        navigate('/login');
        return { success: true, message: result.message };
      } else {
        return { success: false, error: result.error || 'Erreur inconnue' };
      }
    } catch (error) {
      console.error(' Erreur inscription:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erreur d\'inscription' 
      };
    }
  };

  //  Déconnexion (le backend supprime le cookie)
  const logout = async () => {
    try {
      console.log('👋 Déconnexion en cours...');
      await authAPI.logout();
    } catch (error) {
      console.error('⚠️ Erreur logout:', error);
    } finally {
      
      setUser(null);
      navigate('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      register, 
      loading 
    }}>
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