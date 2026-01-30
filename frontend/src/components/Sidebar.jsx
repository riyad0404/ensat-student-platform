import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PanelRight } from 'lucide-react';
import './../styles/Sidebar.css';
import logoImg from '../assets/logo.jpeg';
import appNameImg from '../assets/appname.jpeg';

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

    // Fonction pour déterminer si un onglet est actif
    const isItemActive = (itemPath) => {
        if (itemPath === '/') {
            return location.pathname === '/';
        }
        // Gestion des sous-routes standards (ex: /library/ap1 active /library)
        if (location.pathname.startsWith(itemPath)) {
            return true;
        }
        // Cas spécial : les conversations
        if (location.pathname.startsWith('/conversations')) {
            if (itemPath === '/groups' && location.state?.type === 'group') {
                return true;
            }
            if (itemPath === '/messages' && location.state?.type !== 'group') {
                return true;
            }
        }
        return false;
    };

    return (
        <div className={`sidebar-container ${isCollapsed ? 'collapsed' : ''}`}>
            {/* Section logo avec bouton */}
            <div className="logo-section">
                {/* Logo centré */}
                <div className="logo">
                    {isCollapsed ? (
                        <img 
                            src={logoImg}
                            alt="" 
                            className="sidebar-logo-collapsed"
                            style={{ width: '100px', height: '90px' }}
                        />
                    ) : (
                        <img 
                            src={appNameImg}
                            alt="" 
                            className="sidebar-logo-expanded"
                            style={{ width: '80%', height: 'auto', display: 'block', margin: '0 auto' }}
                        />
                    )}
                </div>
                
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
                        className={`nav-item ${isItemActive(item.path) ? 'active' : ''}`}
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
                    style={{ color: '#ef4444' }}
                >
                    <span className="material-icons">logout</span>
                    {!isCollapsed && <span className="logout-label">Logout</span>}
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
