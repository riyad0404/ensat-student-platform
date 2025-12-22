import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/profile.css';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [bannerImage, setBannerImage] = useState('');
    const [profileImage, setProfileImage] = useState('');
    const [showBannerMenu, setShowBannerMenu] = useState(false);
    const [showAvatarMenu, setShowAvatarMenu] = useState(false);
    
    const bannerFileInputRef = useRef(null);
    const avatarFileInputRef = useRef(null);
    
    if (!user) {
        return <div>Chargement...</div>;
    }
    
    const fullName = `${user.prenom || ''} ${user.nom || ''}`.trim();
    const program = user.niveau;
    
    const posts = [
        {
            id: 1,
            username: 'X_AE_A-13',
            role: 'Product Designer, slothUI',
            content: 'Habitant morbi tristique senectus et netus et. Suspendisse sed nisi lacus sed viverra. Dolor morbi non arcu risus quis varius.',
            tags: ['#amazing', '#great', '#lifetime', '#uiux', '#machinelearning'],
            likes: 12,
            comments: 25,
            shares: 187
        }
    ];

    // Gestion du changement de bannière
    const handleBannerUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setBannerImage(reader.result);
                setShowBannerMenu(false);
            };
            reader.readAsDataURL(file);
        }
    };

    // Gestion du changement d'avatar
    const handleAvatarUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result);
                setShowAvatarMenu(false);
            };
            reader.readAsDataURL(file);
        }
    };

    // Supprimer la bannière
    const handleRemoveBanner = () => {
        setBannerImage('');
        setShowBannerMenu(false);
    };

    // Supprimer l'avatar
    const handleRemoveAvatar = () => {
        setProfileImage('');
        setShowAvatarMenu(false);
    };

    // Style de la bannière
    const bannerStyle = bannerImage ? {
        background: `url(${bannerImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    } : {
        background: "url('https://cdn.pixabay.com/photo/2015/07/17/22/43/student-849825_1280.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    };

    // Fermer les menus en cliquant ailleurs
    const handleClickOutside = (e) => {
        if (!e.target.closest('.banner-camera-icon') && !e.target.closest('.banner-dropdown-menu')) {
            setShowBannerMenu(false);
        }
        if (!e.target.closest('.avatar-camera-icon') && !e.target.closest('.avatar-dropdown-menu')) {
            setShowAvatarMenu(false);
        }
    };

    React.useEffect(() => {
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    return (
        <div className="profile-container">
            {/* Grande bannière avec icône caméra */}
            <div className="profile-banner" style={bannerStyle}>
                {/* Icône caméra pour bannière */}
                <button 
                    className="banner-camera-icon"
                    title="Modifier la bannière"
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowBannerMenu(!showBannerMenu);
                    }}
                >
                    📷
                </button>
                
                {/* Menu déroulant pour bannière */}
                <div className={`banner-dropdown-menu ${showBannerMenu ? 'show' : ''}`}>
                    <div 
                        className="banner-dropdown-item"
                        onClick={() => bannerFileInputRef.current.click()}
                    >
                        <span>Modifier la photo</span>
                    </div>
                    <div 
                        className="banner-dropdown-item delete"
                        onClick={handleRemoveBanner}
                    >
                        <span>Supprimer la photo</span>
                    </div>
                </div>
                
                <input
                    type="file"
                    ref={bannerFileInputRef}
                    className="file-input"
                    accept="image/*"
                    onChange={handleBannerUpload}
                />
            </div>
            
            {/* Contenu principal */}
            <div className="profile-content">
                {/* Avatar avec icône caméra */}
                <div className="profile-avatar-container">
                    <div className="profile-avatar">
                        {profileImage ? (
                            <img 
                                src={profileImage} 
                                alt="Profile" 
                                style={{width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover'}}
                            />
                        ) : (
                            <div style={{
                                width: '100%',
                                height: '100%',
                                borderRadius: '50%',
                                background: '#e9ecef',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#6c757d',
                            }}>
                                <svg 
                                    width="60" 
                                    height="60" 
                                    viewBox="0 0 24 24" 
                                    fill="none" 
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path 
                                        d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" 
                                        stroke="currentColor" 
                                        strokeWidth="2" 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round"
                                    />
                                    <path 
                                        d="M20 21C20 19.6044 20 18.9067 19.8278 18.3389C19.44 17.0605 18.4395 16.06 17.1611 15.6722C16.5933 15.5 15.8956 15.5 14.5 15.5H9.5C8.10444 15.5 7.40665 15.5 6.83886 15.6722C5.56045 16.06 4.56004 17.0605 4.17224 18.3389C4 18.9067 4 19.6044 4 21" 
                                        stroke="currentColor" 
                                        strokeWidth="2" 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </div>
                        )}
                        
                        {/* Icône caméra pour avatar */}
                        <button 
                            className="avatar-camera-icon"
                            title="Modifier la photo de profil"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowAvatarMenu(!showAvatarMenu);
                            }}
                        >
                            📷
                        </button>
                        
                        {/* Menu déroulant pour avatar */}
                        <div className={`avatar-dropdown-menu ${showAvatarMenu ? 'show' : ''}`}>
                            <div 
                                className="avatar-dropdown-item"
                                onClick={() => avatarFileInputRef.current.click()}
                            >
                                <span>Modifier la photo</span>
                            </div>
                            <div 
                                className="avatar-dropdown-item delete"
                                onClick={handleRemoveAvatar}
                            >
                                <span>Supprimer la photo</span>
                            </div>
                        </div>
                    </div>
                    
                    <input
                        type="file"
                        ref={avatarFileInputRef}
                        className="file-input"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                    />
                </div>

                {/* Section infos */}
                <div className="profile-info-section">
                    <div className="profile-header">
                        <div className="profile-text">
                            <h1 className="profile-name">{fullName}</h1>
                            <span className="profile-program">{program}</span>
                                     {user.bio && (
                                         <p className="profile-description">
                                         {user.bio}
                                         </p>
                                     )}
                        </div>
                        
                        {/* ICON EDIT */}
                        <button 
                            className="edit-profile-icon"
                            title="Modifier le profil"
                            onClick={() => navigate('/profile/edit')}
                        >
                            ✎
                       </button>
                    </div>
                </div>

                {/* Section Posts */}
                <div className="posts-section">
                    <div className="posts-title">
                         Posts
                    </div>
                    
                    {/* Contenu des posts */}
                    {posts.map(post => (
                        <div key={post.id} className="post">
                            <div className="post-header">
                                <div className="post-avatar">
                                    {post.username.substring(0, 2)}
                                </div>
                                <div className="post-user">
                                    <h4>{post.username}</h4>
                                    <p>{post.role}</p>
                                </div>
                            </div>
                            
                            <p className="post-content">{post.content}</p>
                            
                            <div className="post-tags">
                                {post.tags.map((tag, i) => (
                                    <span key={i} className="tag">{tag}</span>
                                ))}
                            </div>
                            
                            <div className="post-stats">
                                <div className="stat">
                                    <span>❤️</span>
                                    <span>{post.likes} Likes</span>
                                </div>
                                <div className="stat">
                                    <span>💬</span>
                                    <span>{post.comments} Comments</span>
                                </div>
                                <div className="stat">
                                    <span>↪️</span>
                                    <span>{post.shares} Share</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Profile;