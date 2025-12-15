import { Navigate, useLocation } from 'react-router-dom';

const RequireAuth = ({ children }) => {
  const location = useLocation();
  
  // Vérifie si l'utilisateur est connecté
  const isAuthenticated = () => {
    const token = localStorage.getItem('authToken');
    return !!token; // Retourne true si token existe
  };
  
  if (!isAuthenticated()) {
    // Redirige vers login et sauvegarde l'URL d'origine
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return children;
};

export default RequireAuth;
