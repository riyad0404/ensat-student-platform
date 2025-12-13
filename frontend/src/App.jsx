import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import Register from './pages/Register';
import ResetPasswordCS from './pages/ResetPassword-CS';
import ResetPasswordEmail from './pages/ResetPassword-email';

// HOC pour protéger les routes
const RequireAuth = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Chargement...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// HOC pour les routes publiques quand déjà connecté
const AlreadyAuth = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Chargement...</div>;
  }
  
  if (user) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Layout pour AlreadyAuth
const AlreadyAuthLayout = () => {
  return (
    <AlreadyAuth>
      <Outlet />
    </AlreadyAuth>
  );
};

// Layout pour RequireAuth  
const RequireAuthLayout = () => {
  return (
    <RequireAuth>
      <Outlet />
    </RequireAuth>
  );
};

// Page d'accueil
const HomePage = () => {
  const { user, logout } = useAuth();
  
  return (
    <div style={{ padding: '20px' }}>
      <h1>ENSAT Student Platform</h1>
      <p>Bienvenue sur la plateforme étudiante</p>
      
      {user && (
        <div>
          <p>Connecté en tant que: <strong>{user.email}</strong></p>
          <button 
            onClick={logout}
            style={{
              padding: '10px 15px',
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Déconnexion
          </button>
        </div>
      )}
    </div>
  );
};

// Page de profil
const ProfilePage = () => (
  <div style={{ padding: '20px' }}>
    <h1>👤 Profil</h1>
    <p>Page protégée - Connecté avec succès!</p>
  </div>
);

function App() {
  return (
    <Routes>
      {/* Routes protégées (nécessite authentification) */}
      <Route element={<RequireAuthLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
      
      {/* Routes publiques (si déjà authentifié, redirige) */}
      <Route element={<AlreadyAuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/resetByemail" element={<ResetPasswordEmail />} />
        <Route path="/resetByCode" element={<ResetPasswordCS />} />

      </Route>
    </Routes>
  );
}

export default App;