import {  Routes, Route } from 'react-router-dom';
import RequireAuth from './components/auth/RequireAuth';
import AlreadyAuth from './components/auth/AlreadyAuth';


// Pages minimales - ta binôme les remplacera
const HomePage = () => (
  <div style={{ padding: '20px' }}>
    <h1>ENSAT Student Platform</h1>
    <p>Bienvenue sur la plateforme étudiante</p>
    <div>
      <a href="/login" style={{ marginRight: '10px' }}>Se connecter</a>
      <a href="/register">S'inscrire</a>
    </div>
  </div>
);

const LoginPage = () => (
  <div style={{ padding: '20px' }}>
    <h1>🔐 Connexion</h1>
    <p>Page à créer par l'équipe UI/UX</p>
  </div>
);

const RegisterPage = () => (
  <div style={{ padding: '20px' }}>
    <h1>📝 Inscription</h1>
    <p>Page à créer par l'équipe UI/UX</p>
  </div>
);

const ProfilePage = () => (
  <div style={{ padding: '20px' }}>
    <h1>👤 Profil</h1>
    <p>Page protégée</p>
  </div>
);

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route element={<AlreadyAuth />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
      <Route element={<RequireAuth />}>
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
    </Routes>
  );
}

export default App;
