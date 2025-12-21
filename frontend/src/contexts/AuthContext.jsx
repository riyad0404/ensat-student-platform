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
        const response = await authAPI.verifyToken();
        
        if (response.user) {
          console.log('✅ Utilisateur connecté:', response.user.email);
          setUser(response.user);
        } else {
          console.log('❌ Pas d\'utilisateur dans la réponse');
          setUser(null);
        }
      } catch (error) {
        console.log('⚠️ Non connecté ou session expirée');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // ✅ Connexion
  const login = async (credentials) => {
    try {
      console.log('🎯 Tentative de connexion...');
      const data = await authAPI.login(credentials);
      
      console.log('✅ Réponse backend login:', data);
      
      if (data.user) {
        console.log('✅ Utilisateur connecté:', data.user.email);
        setUser(data.user);
        
        setTimeout(() => {
          console.log('🔄 Redirection vers /...');
          navigate('/', { replace: true });
        }, 50);
        
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

  // ✅ Inscription
  const register = async (userData) => {
    try {
      console.log('📝 Inscription en cours...');
      const result = await authAPI.register(userData);
      
      console.log('✅ Réponse inscription:', result);
      
      if (result.message) {
        console.log('✅ Inscription réussie! Redirection vers login...');
        navigate('/login');
        return { success: true, message: result.message };
      } else {
        return { success: false, error: result.error || 'Erreur inconnue' };
      }
    } catch (error) {
      console.error('❌ Erreur inscription:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erreur d\'inscription' 
      };
    }
  };

  // ✅ Déconnexion
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

  // ✅ Mise à jour du profil (NOUVELLE FONCTION)
// ✅ Mise à jour du profil
const updateProfile = async (updatedData) => {
  try {
    console.log('🔄 Mise à jour du profil - Données reçues:', updatedData);
    
    // Log spécifique pour les photos
    if (updatedData.photo) {
      if (updatedData.photo === '') {
        console.log('🗑️ Suppression de photo demandée');
      } else {
        console.log('🖼️ Photo envoyée, taille:', updatedData.photo.length, 'caractères');
        console.log('🖼️ Type photo:', updatedData.photo.substring(0, 50) + '...');
      }
    }
    
    const response = await authAPI.updateProfile(updatedData);
    
    console.log('✅ Réponse du backend:', response);
    
    if (response.user) {
      setUser(response.user);
      return { 
        success: true, 
        user: response.user,
        message: response.message || 'Profil mis à jour avec succès'
      };
    } else if (response.message) {
      // Rafraîchir les données utilisateur après mise à jour
      try {
        const userResponse = await authAPI.verifyToken();
        if (userResponse.user) {
          setUser(userResponse.user);
        }
      } catch (refreshError) {
        console.log('⚠️ Impossible de rafraîchir les données utilisateur:', refreshError);
      }
      
      return { 
        success: true,
        message: response.message
      };
    } else {
      return { 
        success: false, 
        error: response.error || response.message || 'Profil non mis à jour' 
      };
    }
  } catch (error) {
    console.error('❌ ERREUR DÉTAILLÉE updateProfile:');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Status Text:', error.response.statusText);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
      
      const errorMessage = error.response.data?.error || 
                          error.response.data?.message || 
                          error.response.data?.details ||
                          'Erreur de mise à jour';
      
      return { 
        success: false, 
        error: errorMessage,
        status: error.response.status
      };
    } else if (error.request) {
      console.error('Request:', error.request);
      return { 
        success: false, 
        error: 'Pas de réponse du serveur' 
      };
    } else {
      console.error('Error:', error.message);
      return { 
        success: false, 
        error: error.message || 'Erreur de connexion' 
      };
    }
  }
};

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      register, 
      updateProfile, // ✅ Ajouter cette fonction
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