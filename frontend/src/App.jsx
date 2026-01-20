"use client"
import React from 'react';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import LandingPage from './pages/Landing';
import Register from './pages/Register';
import ResetPasswordCS from './pages/ResetPassword-CS';
import ResetPasswordEmail from './pages/ResetPassword-email';
import ResetPasswordToken from './pages/ResetPasswordToken';
import ProfilePage from './pages/Profile';
import Sidebar from './components/Sidebar';
import EditProfile from './pages/EditProfile';
import ChatbotPage from "./pages/ChatbotPage";
import ChatbotButton from "./components/ChatbotButton";
import MessagesPage from './pages/MessagesPage';
import GroupsPage from './pages/GroupsPage';
import ConversationPage from './pages/ConversationPage';
import HomePage from './pages/homepage';
import MainLayout from './pages/MainLayout';
import Bookmarks from './pages/BookMarks';



// HOC pour protéger les routes
const RequireAuth = ({ children }) => {
  const { user, loading } = useAuth();
  

  console.log('RequireAuth state -> user:', user, 'loading:', loading);

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
      <MainLayout />
    </RequireAuth>
  );
};

function App() {

  return (
    <>
      <Routes>
        <Route path="/landing" element={<LandingPage />} />
        {/* Routes protégées (nécessite authentification) avec Sidebar */}
        <Route element={<RequireAuthLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/chatbot" element={<ChatbotPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/groups" element={<GroupsPage />} />
          <Route path="/groupes" element={<Navigate to="/groups" replace />} />
          <Route path="/conversations/:id" element={<ConversationPage />} />
          <Route path="/bookmarks" element={<Bookmarks />} />
        </Route>

        {/* Routes publiques (si déjà authentifié, redirige) */}
        <Route element={<AlreadyAuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/resetByemail" element={<ResetPasswordEmail />} />
          <Route path="/resetByCode" element={<ResetPasswordCS />} />
          <Route path="/reset-password/:token" element={<ResetPasswordToken />} />
        </Route>
      </Routes>

      {/* ChatbotButton not present in project; removed to avoid runtime error */}
    </>
  )
}

export default App;
