import { Routes, Route, Outlet } from 'react-router-dom';
import RequireAuth from './components/auth/RequireAuth';
import AlreadyAuth from './components/auth/AlreadyAuth';
import LoginPage from './pages/LoginPage';
import Register from './pages/Register';

// Pages
const HomePage = () => (
  <div style={{ padding: '20px' }}>
    <h1>ENSAT Student Platform</h1>
    <p>Bienvenue sur la plateforme étudiante</p>
    <div>
      <button onClick={() => {
        localStorage.clear();
        window.location.href = '/login';
      }}>
        Déconnexion
      </button>
    </div>
  </div>
);

const ProfilePage = () => (
  <div style={{ padding: '20px' }}>
    <h1>👤 Profil</h1>
    <p>Page protégée - Connecté avec succès!</p>
  </div>
);

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
      </Route>
    </Routes>
  );
}

export default App;// AppTest.jsx
/*import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import Register from './pages/Register';
export default function AppTest() {
  console.log('AppTest rendu, LoginPage:', LoginPage); // Vérifiez dans console
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<div>Home</div>} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}*/