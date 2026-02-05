import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import conversationAPI from '../api/conversationAPI';
import '../styles/profile.css'; // On réutilise le même style
import { getAllPosts } from '../api/postAPI';
import PostCard from '../components/Postcard';
import defaultBanner from '../assets/Blue Monotone Gradient Professional Company LinkedIn Banner.png';
import { Search } from 'lucide-react';

const OtherUserProfile = () => {
    const { user: authUser, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();
    
    const [user, setUser] = useState(null);
    const [userPosts, setUserPosts] = useState([]);
    const [profileLoading, setProfileLoading] = useState(true);
    const [showImageModal, setShowImageModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const currentUserId = authUser?.iduser || authUser?.id;

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

    // Effet pour scroller vers un post spécifique si demandé (via notification)
    useEffect(() => {
        if (location.state?.scrollToPostId && userPosts.length > 0) {
            const postId = location.state.scrollToPostId;
            setTimeout(() => {
                const element = document.getElementById(`post-${postId}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    element.style.border = "2px solid #0040D0";
                    setTimeout(() => element.style.border = "none", 2000);
                }
            }, 500);
            window.history.replaceState({}, document.title);
        }
    }, [location.state, userPosts]);

    useEffect(() => {
        const handleClickOutside = (event) => {
          if (!event.target.closest('.search-container')) {
            setSearchResults([]);
          }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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
    
    const handleSearch = async (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        if (term.length > 1) {
          setSearchLoading(true);
          try {
            const promises = [];
            const lowerTerm = term.toLowerCase();
    
            // 1. Recherche Utilisateurs
            if (conversationAPI && typeof conversationAPI.searchUsers === 'function') {
              promises.push(
                conversationAPI.searchUsers(term)
                  .then(res => ({ type: 'users', data: res }))
                  .catch(err => {
                    console.error("Error searching users:", err);
                    return { type: 'users', data: [] };
                  })
              );
            }
    
            const results = await Promise.all(promises);
            
            let users = [];
    
            results.forEach(res => {
              if (res.type === 'users') {
                const raw = Array.isArray(res.data) ? res.data : (res.data?.data || []);
                users = raw.filter(u => String(u.iduser) !== String(currentUserId))
                           .map(u => ({ ...u, resultType: 'user' }));
              }
            });
    
            setSearchResults([...users]);
          } catch (error) {
            console.error("A general error occurred during search:", error);
            setSearchResults([]);
          } finally {
            setSearchLoading(false);
          }
        } else {
          setSearchResults([]);
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
    
    // Récupérer la bannière (priorité: backend > localStorage fallback)
    const localBanner = id ? localStorage.getItem(`profile_banner_${id}`) : null;
    const displayBanner = user.banniere || user.banner || localBanner;

    const bannerStyle = displayBanner ? {
        backgroundImage: `url(${displayBanner})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
    } : {
        backgroundImage: `url(${defaultBanner})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
    };

    return (
        <div className="profile-container" style={{ backgroundColor: '#f4f6fa', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div className="page-header">
                <div className="search-container" style={{ position: 'relative', flex: 1 }}>
                <Search size={20} color="#9ca3af" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }} />
                <input 
                    type="text" 
                    placeholder="Search for students..." 
                    value={searchTerm}
                    onChange={handleSearch}
                    onFocus={handleSearch}
                    className="search-input"
                    style={{ paddingLeft: '45px', width: '100%' }}
                />
                {searchTerm.length > 1 && (
                    <div className="search-results">
                    {searchLoading ? (
                        <div className="search-loading">Searching...</div>
                    ) : searchResults.length > 0 ? (
                        searchResults.map(item => {
                        if (item.resultType === 'user') {
                            let avatarSrc = null;
                            if (item.iduser) {
                            avatarSrc = localStorage.getItem(`profile_image_${item.iduser}`);
                            }
                            if (!avatarSrc && item.photo) {
                            if (item.photo.startsWith('http') || item.photo.startsWith('data:')) {
                                avatarSrc = item.photo;
                            } else {
                                avatarSrc = `http://localhost:5000${item.photo.startsWith('/') ? '' : '/'}${item.photo}`;
                            }
                            }
                            return (
                            <div 
                                key={`user-${item.iduser}`} 
                                className="search-result-item"
                                onClick={() => {
                                navigate(`/profile/${item.iduser}`);
                                setSearchResults([]);
                                setSearchTerm('');
                                }}
                            >
                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                                {avatarSrc ? (
                                    <img src={avatarSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                    </svg>
                                )}
                                </div>
                                <div>
                                <div style={{ fontWeight: '500', color: '#1f2937' }}>{item.prenom || item.firstname} {item.nom || item.lastname}</div>
                                <div style={{ fontSize: '12px', color: '#6b7280' }}>{item.niveau || item.level}</div>
                                </div>
                            </div>
                            );
                        }
                        return null;
                        })
                    ) : (
                        <div className="no-results">No results found for "{searchTerm}"</div>
                    )}
                    </div>
                )}
                </div>
            </div>

            {showImageModal && profileImageUrl && (
                <div className="image-modal" onClick={() => setShowImageModal(false)}>
                    <div className="image-modal-content">
                        <img src={profileImageUrl} alt="Profile" />
                        <button className="image-modal-close" onClick={() => setShowImageModal(false)}>✕</button>
                    </div>
                </div>
            )}
            
            <div className="page-content" style={{ maxWidth: '96%', margin: '10px auto', width: '100%', padding: '0 20px' }}>
                {/* Section 1: User Info Card */}
                <div style={{ background: 'white', borderRadius: '10px', overflow: 'hidden', border: '1px solid #e0e0e0', marginBottom: '15px', position: 'relative' }}>
                    <div className="profile-banner" style={bannerStyle}></div>
                    <div style={{ position: 'relative' }}>
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
                
                <div style={{ padding: '0 20px 15px 20px', marginTop: '10px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#333', margin: '5px 0 0 0' }}>Posts</h3>
                    <div style={{ height: '1px', background: '#f0f0f0', marginTop: '10px' }}></div>
                    {userPosts.length === 0 && (
                        <p style={{textAlign: 'center', color: '#666', padding: '20px'}}>This user has no posts yet.</p>
                    )}
                </div>
                </div>
                </div>

                {/* Section des publications pour la cohérence visuelle */}
                <div className="posts-section-wrapper" style={{ width: '100%' }}>
                <div className="posts-section" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {userPosts.length > 0 ? (
                        userPosts.map(post => (
                            <div id={`post-${post.idpost}`} key={post.idpost}>
                                <PostCard 
                                    post={post}
                                />
                            </div>
                        ))
                    ) : null}
                </div>
                </div>
            </div>
        </div>
    );
};

export default OtherUserProfile;
