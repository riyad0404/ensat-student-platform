import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import conversationAPI from '../api/conversationAPI';
import '../styles/profile.css'; // On réutilise le même style
import { getAllPosts } from '../api/postAPI';
import PostCard from '../components/Postcard';

const OtherUserProfile = () => {
    const { user: authUser, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    
    const [user, setUser] = useState(null);
    const [userPosts, setUserPosts] = useState([]);
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

                // Fetch user's posts
                const data = await getAllPosts();
                const allPosts = Array.isArray(data) ? data : (data?.posts || []);
                
                // Filtrer les posts de cet utilisateur
                const userPostsRaw = allPosts.filter(p => {
                    const authorId = p.iduser || p.auteur?.iduser || p.auteur?.id;
                    return String(authorId) === String(id);
                });

                // FILTRE : Ne garder que les posts NON anonymes
                const publicPosts = userPostsRaw.filter(p => p.isAnonymat !== true && p.isAnonymat !== 'true' && p.isAnonymat !== 1);
                publicPosts.sort((a, b) => new Date(b.createdAt || b.dateCreation) - new Date(a.createdAt || a.dateCreation));
                setUserPosts(publicPosts);
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
 const bannerStyle = {
        backgroundImage: "url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
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
                            background: 'transparent',
                            border: 'none',
                            color: '#0040D0',
                            fontSize: '24px'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.1)';
                          }}
                          onMouseLeave={(e) => {
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
                    {userPosts.length > 0 ? (
                        userPosts.map(post => (
                            <PostCard 
                                key={post.idpost} 
                                post={post}
                            />
                        ))
                    ) : (
                        <p style={{textAlign: 'center', color: '#666', padding: '20px'}}>This user has no posts yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OtherUserProfile;
