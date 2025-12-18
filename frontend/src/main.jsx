// src/main.jsx - NOUVELLE VERSION
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';

// AJOUTER Material Icons 
const materialIcons = document.createElement('link');
materialIcons.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
materialIcons.rel = 'stylesheet';
document.head.appendChild(materialIcons);



ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* ⭐ AJOUTER BrowserRouter ICI */}
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);


