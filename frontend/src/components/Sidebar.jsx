import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PanelRight } from 'lucide-react';
import './../styles/Sidebar.css';

const Sidebar = () => {
    const location = useLocation();
    const { logout } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const navItems = [
        { path: '/', label: 'Home', icon: 'home' },
        { path: '/library', label: 'Library', icon: 'library_books' },
        { path: '/bookmarks', label: 'Bookmarks', icon: 'bookmark' },
        { path: '/messages', label: 'Messages', icon: 'message' },
        { path: '/groups', label: 'Groups', icon: 'groups' },
        { path: '/profile', label: 'Profile', icon: 'person' },
    ];

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <div className={`sidebar-container ${isCollapsed ? 'collapsed' : ''}`}>
            {/* Section logo avec bouton */}
            <div className="logo-section">
                {/* Logo centré */}
                <div className="logo">{isCollapsed ? 'DC' : 'Docentra'}</div>
                
                {/* Bouton collapse style IA (PanelRight) */}
                <button 
                    onClick={toggleSidebar}
                    className="collapse-btn"
                    title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    <PanelRight size={18} />
                </button>
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