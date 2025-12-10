import { Navigate } from 'react-router-dom';

const AlreadyAuth = ({ children }) => {
  const isAuthenticated = () => {
    const token = localStorage.getItem('authToken');
    return !!token;
  };
  
  if (isAuthenticated()) {
    // Si déjà connecté, redirige vers la page d'accueil
    return <Navigate to="/" replace />;
  }
  
  return children;
};

export default AlreadyAuth;