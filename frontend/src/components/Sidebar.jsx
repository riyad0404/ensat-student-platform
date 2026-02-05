import React, { useState, useEffect } from 'react';
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
    const [activeItem, setActiveItem] = useState('home');

    const navItems = [
        { id: 'home', path: '/', label: 'Home', icon: 'home' },
        { id: 'library', path: '/library', label: 'Library', icon: 'library_books' },
        { id: 'bookmarks', path: '/bookmarks', label: 'Bookmarks', icon: 'bookmark' },
        { id: 'messages', path: '/messages', label: 'Messages', icon: 'message' },
        { id: 'groups', path: '/groups', label: 'Groups', icon: 'groups' },
        { id: 'profile', path: '/profile', label: 'Profile', icon: 'person' },
    ];

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    useEffect(() => {
        // Priority 1: Explicit state from navigation (from NotificationBell)
        if (location.state?.activeSidebarItem) {
            setActiveItem(location.state.activeSidebarItem);
            return;
        }

        const currentPath = location.pathname;

        // Priority 2: Direct path match (longest prefix wins)
        const bestMatch = navItems
            .filter(item => item.path !== '/' && currentPath.startsWith(item.path))
            .sort((a, b) => b.path.length - a.path.length)[0];

        if (bestMatch) {
            setActiveItem(bestMatch.id);
        } else if (currentPath === '/') {
            setActiveItem('home');
        } else if (currentPath.startsWith('/conversations')) {
            // Priority 3: Fallback for conversations using the old state logic
            // Default to 'messages' if no specific state is found
            setActiveItem(location.state?.type === 'group' ? 'groups' : 'messages');
        }
    }, [location]);

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
                        className={`nav-item ${activeItem === item.id ? 'active' : ''}`}
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
