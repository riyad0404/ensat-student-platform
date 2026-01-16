import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './../styles/sidebar.css';

const Sidebar = () => {
    const location = useLocation();
    const { logout } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const navItems = [
        { path: '/', label: 'Home', icon: 'home' },
        { path: '/notifications', label: 'Notifications', icon: 'notifications' },
        { path: '/messages', label: 'Messages', icon: 'message' },
        { path: '/library', label: 'Library', icon: 'library_books' },
        { path: '/bookmarks', label: 'Bookmarks', icon: 'bookmark' },
        { path: '/groupes', label: 'Groupes', icon: 'groups' },
        { path: '/profile', label: 'Profile', icon: 'person' },
    ];

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <div className={`sidebar-container ${isCollapsed ? 'collapsed' : ''}`}>
            {/* Section logo avec bouton À DROITE */}
            <div className="logo-section">
                {/* Logo centré */}
                <div className="logo">{isCollapsed ? 'DC' : 'Docentra'}</div>
                
                {/* Bouton collapse À DROITE quand sidebar ouverte */}
                {!isCollapsed && (
                    <button 
                        onClick={toggleSidebar}
                        className="collapse-btn"
                        title="Collapse sidebar"
                    >
                        <span className="material-icons">chevron_left</span>
                    </button>
                )}
                
                {/* Bouton collapse CENTRÉ quand sidebar collapsed */}
                {isCollapsed && (
                    <button 
                        onClick={toggleSidebar}
                        className="collapse-btn"
                        title="Expand sidebar"
                    >
                        <span className="material-icons">chevron_right</span>
                    </button>
                )}
            </div>
            
            {/* Navigation */}
            <div className="nav-links">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                        title={isCollapsed ? item.label : ''}
                    >
                        <span className="material-icons">{item.icon}</span>
                        <span className="nav-label">{item.label}</span>
                    </Link>
                ))}
            </div>
            
            {/* Logout */}
            <div className="bottom-section">
                <button 
                    onClick={logout} 
                    className="logout-btn"
                    title={isCollapsed ? "Logout" : ""}
                >
                    <span className="material-icons">logout</span>
                    {!isCollapsed && <span className="logout-label">Logout</span>}
                </button>
            </div>
        </div>
    );
};

export default Sidebar;