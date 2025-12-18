import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './../styles/sidebar.css';

const Sidebar = () => {
    const location = useLocation();
    const { user, logout } = useAuth();

    const navItems = [
        { path: '/', label: 'Home', icon: 'home' },
        { path: '/notifications', label: 'Notifications', icon: 'notifications' },
        { path: '/messages', label: 'Messages', icon: 'message' },
        { path: '/library', label: 'Library', icon: 'library_books' },
        { path: '/bookmarks', label: 'Bookmarks', icon: 'bookmark' },
        { path: '/groupes', label: 'Groupes', icon: 'groups' },
        { path: '/profile', label: 'Profile', icon: 'person' },
    ];

    return (
        <div className="sidebar-container">
            <div className="logo-section">
                <div className="logo">EnsatAI</div>
            </div>
            
            <div className="nav-links">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                    >
                        <span className="material-icons">{item.icon}</span>
                        <span className="nav-label">{item.label}</span>
                    </Link>
                ))}
            </div>
            
            <div className="bottom-section">
                <button 
                    onClick={logout} 
                    className="logout-btn"
                    title="Logout" 
                >
                    <span className="material-icons">logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;