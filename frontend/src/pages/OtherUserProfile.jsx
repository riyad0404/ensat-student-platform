import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import conversationAPI from '../api/conversationAPI';
import '../styles/profile.css'; // On réutilise le même style

const OtherUserProfile = () => {
    const { user: authUser, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    
    const [user, setUser] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [showImageModal, setShowImageModal] = useState(false);

    useEffect(() => {
        // Si l'ID dans l'URL est celui de l'utilisateur connecté, on le redirige vers sa propre page de profil
        if (!authLoading && authUser && String(id) === String(authUser.iduser)) {
            navigate('/profile', { replace: true });
            return;
        }

        const fetchUser = async () => {
            setProfileLoading(true);
            try {
                const response = await axios.get(`http://localhost:5000/api/users/${id}`, { withCredentials: true });
                setUser(response.data);
            } catch (error) {
                console.error("Error fetching other user's profile:", error);
                setUser(null);
            } finally {
                setProfileLoading(false);
            }
        };

        if (id && !authLoading) {
            fetchUser();
        }
    }, [id, authUser, authLoading, navigate]);

    const startConversation = async (userId) => {
        if (!userId) return;
        try {
            const response = await conversationAPI.createDirect(userId);
            const conv = response.data || response;
            const convId = conv.id || conv.idconversation;
            if (convId) {
                navigate(`/conversations/${convId}`);
            } else {
                alert("Error: Could not retrieve conversation ID.");
            }
        } catch (error) {
            console.error("Error creating conversation", error);
            alert(`Could not start conversation. Details: ${error.message || error}`);
        }
    };
    
    if (profileLoading || authLoading) {
        return <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Loading profile...</div>;
    }

    if (!user) {
        return <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>User not found.</div>;
    }
    
    const fullName = `${user.prenom || user.firstname || ''} ${user.nom || user.lastname || ''}`.trim() || 'User';
    const program = user.niveau || 'Student';

    // Logique d'image de profil cohérente avec le reste de l'application
    let profileImageUrl = null;
    if (user?.iduser) {
        // 1. Essayer de charger depuis le localStorage (pour les images mises à jour localement)
        profileImageUrl = localStorage.getItem(`profile_image_${user.iduser}`);
    }
    if (!profileImageUrl && user?.photo) {
        // 2. Sinon, utiliser la photo venant du backend
        profileImageUrl = user.photo;
    }

    // Données fictives pour les publications, pour correspondre à la mise en page de Profile.jsx
    const posts = [
        {
            id: 1,
            username: fullName,
            role: program,
            content: `Welcome to ${fullName}'s profile!`,
            tags: ['#ensat', '#student'],
            likes: 0,
            comments: 0,
            shares: 0
        }
    ];

    const bannerStyle = {
        background: "url('https://cdn.pixabay.com/photo/2015/07/17/22/43/student-849825_1280.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    };

    return (
        <div className="profile-container">
            {showImageModal && profileImageUrl && (
                <div className="image-modal" onClick={() => setShowImageModal(false)}>
                    <div className="image-modal-content">
                        <img src={profileImageUrl} alt="Profile" />
                        <button className="image-modal-close" onClick={() => setShowImageModal(false)}>✕</button>
                    </div>
                </div>
            )}
            
            <div className="profile-banner" style={bannerStyle}>
                {/* Pas d'icône caméra pour les autres utilisateurs */}
            </div>
            
            <div className="profile-content">
                <div className="profile-avatar-container">
                    <div className="profile-avatar">
                        {profileImageUrl ? (
                            <div 
                                onClick={() => setShowImageModal(true)} 
                                title="Click to view" 
                                style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', position: 'relative', cursor: 'pointer' }}
                            >
                                <img 
                                    src={profileImageUrl} 
                                    alt="Profile" 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                                />
                                <div className="avatar-overlay">👁️ View</div>
                            </div>
                        ) : (
                            <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6c757d' }}>
                                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" strokeWidth="2"/><path d="M20 21C20 19.6044 20 18.9067 19.8278 18.3389C19.44 17.0605 18.4395 16.06 17.1611 15.6722C16.5933 15.5 15.8956 15.5 14.5 15.5H9.5C8.10444 15.5 7.40665 15.5 6.83886 15.6722C5.56045 16.06 4.56004 17.0605 4.17224 18.3389C4 18.9067 4 19.6044 4 21" strokeWidth="2"/></svg>
                            </div>
                        )}
                        {/* Pas d'icône caméra pour les autres utilisateurs */}
                    </div>
                </div>

                <div className="profile-info-section">
                    <div className="profile-header">
                        <div className="profile-text">
                            <h1 className="profile-name">{fullName}</h1>
                            <span className="profile-program">{program}</span>
                            {user.bio && <p className="profile-description">{user.bio}</p>}
                        </div>
                        
                        {/* Bouton pour envoyer un message */}
                        <button 
                          className="edit-profile-icon" // Réutilise la classe pour la position et le style de base
                          onClick={() => startConversation(user.iduser)}
                          title="Send Message"
                          style={{
                            background: 'white',
                            border: '2px solid #E334FE',
                            color: '#E334FE',
                            fontSize: '20px' // Taille de l'icône
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#E334FE';
                            e.currentTarget.style.color = 'white';
                            e.currentTarget.style.transform = 'scale(1.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'white';
                            e.currentTarget.style.color = '#E334FE';
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        >
                            ✉️
                        </button>
                    </div>
                </div>

                {/* Section des publications pour la cohérence visuelle */}
                <div className="posts-section">
                    <div className="posts-title">Posts</div>
                    {posts.length > 0 ? posts.map(post => (
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
                    )) : (
                        <p style={{textAlign: 'center', color: '#666', padding: '20px'}}>This user has no posts yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OtherUserProfile;