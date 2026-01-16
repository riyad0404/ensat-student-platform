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
import HomePage from './pages/homepage';
import MainLayout from './pages/MainLayout';
import { useNavigate } from 'react-router-dom';



// HOC pour protéger les routes
const RequireAuth = ({ children }) => {
  const { user, loading } = useAuth()

  console.log('RequireAuth state -> user:', user, 'loading:', loading);

  if (loading) {
    return <div>Chargement...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

const AlreadyAuth = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <div>Chargement...</div>
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return children
}

const AlreadyAuthLayout = () => {
  return (
    <AlreadyAuth>
      <Outlet />
    </AlreadyAuth>
  )
}

const RequireAuthLayout = () => {
  return (
    <RequireAuth>
      <MainLayout />
    </RequireAuth>
  );
};


// Use shared MainLayout from pages/MainLayout


// Removed duplicate ProfilePage declaration

function App() {

  return (
    <>
      <Routes>
        <Route path="/landing" element={<LandingPage />} />
        {/* Routes protégées (nécessite authentification) */}
        <Route element={<RequireAuthLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/homePage" element={<HomePage />} />

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

export default App
