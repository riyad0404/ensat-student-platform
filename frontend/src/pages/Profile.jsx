import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/profile.css';
import { useNavigate } from 'react-router-dom';
import PostCard from '../components/Postcard';
import { getAllPosts } from '../api/postAPI';
import { Pencil, Trash2, Camera, Upload } from 'lucide-react';

const Profile = () => {
    const { user, updateProfile } = useAuth();
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState(null);
    
    const [localProfileImage, setLocalProfileImage] = useState(null);
    const [userPosts, setUserPosts] = useState([]);
    const [bannerImage, setBannerImage] = useState('');
    const [showBannerMenu, setShowBannerMenu] = useState(false);
    const [showAvatarMenu, setShowAvatarMenu] = useState(false);
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [showImageModal, setShowImageModal] = useState(false);
    const [showNotification, setShowNotification] = useState({ show: false, message: '', type: '' });
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // État pour sidebar
    
    const bannerFileInputRef = useRef(null);
    const avatarFileInputRef = useRef(null);
    
    useEffect(() => {
        if (user?.iduser) {
            const savedImage = localStorage.getItem(`profile_image_${user.iduser}`);
            if (savedImage) {
                setLocalProfileImage(savedImage);
            }

            // Fetch user's posts (Correction: Utilisation de getAllPosts + filtre)
            const fetchUserPosts = async () => {
                try {
                    const data = await getAllPosts();
                    const allPosts = Array.isArray(data) ? data : (data?.posts || []);
                    const currentUserId = user.iduser || user.id;

                    // Filtrer les posts de l'utilisateur connecté
                    const myPosts = allPosts.filter(p => {
                        const authorId = p.iduser || p.auteur?.iduser || p.auteur?.id;
                        return String(authorId) === String(currentUserId);
                    });

                    myPosts.sort((a, b) => new Date(b.createdAt || b.dateCreation) - new Date(a.createdAt || a.dateCreation));
                    setUserPosts(myPosts);
                } catch (error) {
                    console.error("Error fetching user posts:", error);
                    setUserPosts([]);
                }
            };

            fetchUserPosts();
        }
    }, [user]);
    
    if (!user) {
        return <div>Loading...</div>;
    }
    
    const fullName = `${user.prenom || ''} ${user.nom || ''}`.trim();
    const program = user.niveau;

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    };

    const resizeImage = (file, maxWidth = 400, maxHeight = 400) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                
                img.onload = () => {
                    let width = img.width;
                    let height = img.height;
                    
                    if (width > maxWidth || height > maxHeight) {
                        const ratio = Math.min(maxWidth / width, maxHeight / height);
                        width = Math.floor(width * ratio);
                        height = Math.floor(height * ratio);
                    }
                    
                    width = Math.max(width, 200);
                    height = Math.max(height, 200);
                    
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    
                    const ctx = canvas.getContext('2d');
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    const resizedBase64 = canvas.toDataURL('image/jpeg', 0.9);
                    resolve(resizedBase64);
                };
                
                img.onerror = reject;
            };
            reader.onerror = reject;
        });
    };

    const showAlert = (message, type = 'info') => {
        setShowNotification({
            show: true,
            message: message,
            type: type
        });
        
        setTimeout(() => {
            setShowNotification({ show: false, message: '', type: '' });
        }, 3000);
    };

    const handleAvatarUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
            showAlert('Please select an image file (JPG, PNG, GIF)', 'error');
            return;
        }
        
        if (file.size > 10 * 1024 * 1024) {
            showAlert('Image too large (>10MB). Please choose a smaller image.', 'error');
            return;
        }
        
        setLoading(true);
        
        try {
            console.log('Processing image...');
            
            const imageUrl = URL.createObjectURL(file);
            setImagePreview(imageUrl);
            
            const resizedImage = await resizeImage(file, 400, 400);
            
            if (user.iduser) {
                localStorage.setItem(`profile_image_${user.iduser}`, resizedImage);
            }
            
            const imageId = `user_${user.iduser}_${Date.now()}`;
            const result = await updateProfile({ 
                photo: imageId,
                photo_metadata: JSON.stringify({
                    filename: file.name,
                    type: file.type,
                    size: file.size,
                    uploaded: new Date().toISOString()
                })
            });
            
            if (result.success) {
                setLocalProfileImage(resizedImage);
                setShowAvatarMenu(false);
                showAlert('Profile picture updated successfully!', 'success');
            } else {
                throw new Error(result.error || 'Failed to save');
            }
            
        } catch (error) {
            console.error('Error:', error);
            showAlert('Error: ' + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveAvatar = async () => {
        // Custom confirmation dialog
        const confirmDelete = window.confirm('Are you sure you want to delete your profile picture?');
        if (!confirmDelete) return;
        
        setLoading(true);
        
        try {
            if (user.iduser) {
                localStorage.removeItem(`profile_image_${user.iduser}`);
            }
            
            const result = await updateProfile({ 
                photo: '',
                photo_metadata: ''
            });
            
            if (result.success) {
                setLocalProfileImage(null);
                setImagePreview(null);
                showAlert('Profile picture deleted!', 'success');
            } else {
                showAlert('Error: ' + result.error, 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showAlert('Error during deletion', 'error');
        } finally {
            setLoading(false);
            setShowAvatarMenu(false);
        }
    };

    const getProfileImage = () => {
        if (imagePreview) {
            return imagePreview;
        }
        if (localProfileImage) {
            return localProfileImage;
        }
        // Retourne null pour afficher l'icône par défaut
        return null;
    };

    const handleBannerUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
            showAlert('Please select an image', 'error');
            return;
        }
        
        try {
            const base64Image = await convertToBase64(file);
            setBannerImage(base64Image);
            setShowBannerMenu(false);
            showAlert('Banner updated!', 'success');
        } catch (error) {
            console.error('Banner error:', error);
            showAlert('Error loading banner', 'error');
        }
    };

    const handleRemoveBanner = () => {
        setBannerImage('');
        setShowBannerMenu(false);
        showAlert('Banner removed!', 'success');
    };

    const bannerStyle = bannerImage ? {
        backgroundImage: `url(${bannerImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
    } : {
        backgroundImage: "url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
    };

    const handleClickOutside = (e) => {
        if (!e.target.closest('.banner-camera-icon') && !e.target.closest('.dropdown-menu')) {
            setShowBannerMenu(false);
        }
        if (!e.target.closest('.avatar-camera-icon') && !e.target.closest('.dropdown-menu')) {
            setShowAvatarMenu(false);
        }
    };

    React.useEffect(() => {
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    const handleEditPost = (post) => {
        setEditingPost(post);
        setIsModalOpen(true);
    };

    const profileImageUrl = getProfileImage();

    return (
        
                <div className="profile-container">
                    {/* Custom Notification */}
                    {showNotification.show && (
                        <div style={{
                            position: 'fixed',
                            top: '20px',
                            right: '20px',
                            background: showNotification.type === 'error' ? '#dc3545' : 
                                       showNotification.type === 'success' ? '#28a745' : '#007bff',
                            color: 'white',
                            padding: '12px 24px',
                            borderRadius: '8px',
                            zIndex: 2001,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            animation: 'slideInRight 0.3s ease-out',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            maxWidth: '400px'
                        }}>
                            {showNotification.type === 'success' ? '✅' : 
                             showNotification.type === 'error' ? '❌' : 'ℹ️'}
                            {showNotification.message}
                        </div>
                    )}

                    {/* Loading indicator */}
                    {loading && (
                        <div style={{
                            position: 'fixed',
                            top: '20px',
                            right: '20px',
                            background: '#E334FE',
                            color: 'white',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            zIndex: 2000,
                            boxShadow: '0 4px 12px rgba(227, 52, 254, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <div style={{
                                width: '16px',
                                height: '16px',
                                border: '2px solid rgba(255,255,255,0.3)',
                                borderTop: '2px solid white',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                            }}></div>
                            Saving...
                        </div>
                    )}

                    {/* Image Modal */}
                    {showImageModal && profileImageUrl && (
                        <div style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0, 0, 0, 0.8)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            zIndex: 3000,
                            animation: 'fadeIn 0.3s ease-out'
                        }}>
                            <div style={{
                                position: 'relative',
                                maxWidth: '90vw',
                                maxHeight: '90vh',
                                padding: '20px'
                            }}>
                                <img 
                                    src={profileImageUrl} 
                                    alt="Profile" 
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '90vh',
                                        borderRadius: '10px',
                                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                                        backgroundColor: 'white'
                                    }}
                                />
                                <button 
                                    onClick={() => setShowImageModal(false)}
                                    style={{
                                        position: 'absolute',
                                        top: '0',
                                        right: '0',
                                        background: '#fff',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: '40px',
                                        height: '40px',
                                        fontSize: '20px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                                        transform: 'translate(50%, -50%)'
                                    }}
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {/* Large banner */}
                    <div className="profile-banner" style={bannerStyle}>
                        <button 
                            className="banner-camera-icon"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowBannerMenu(!showBannerMenu);
                            }}
                            disabled={loading}
                        >
                            📷
                        </button>
                        
                        {/* Banner dropdown menu */}
                        <div className={`dropdown-menu ${showBannerMenu ? 'show' : ''}`} 
                             style={{ bottom: '70px', right: '20px' }}>
                            <div className="dropdown-item" onClick={() => !loading && bannerFileInputRef.current.click()}>
                                <span style={{ marginRight: '10px', display: 'flex', alignItems: 'center' }}><Upload size={18} /></span>
                                {bannerImage ? 'Change banner' : 'Add banner'}
                            </div>
                            {bannerImage && (
                                <div className="dropdown-item delete" onClick={handleRemoveBanner}>
                                    <span style={{ marginRight: '10px', display: 'flex', alignItems: 'center' }}><Trash2 size={18} /></span>
                                    Remove banner
                                </div>
                            )}
                        </div>
                        
                        <input
                            type="file"
                            ref={bannerFileInputRef}
                            accept="image/*"
                            onChange={handleBannerUpload}
                            disabled={loading}
                            style={{display: 'none'}}
                        />
                    </div>
                    
                    {/* Main content */}
                    <div className="profile-content">
                        {/* Avatar */}
                        <div className="profile-avatar-container">
                            <div className="profile-avatar">
                                {profileImageUrl ? (
                                    <div 
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            borderRadius: '50%',
                                            overflow: 'hidden',
                                            position: 'relative',
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => setShowImageModal(true)}
                                        title="Click to view"
                                    >
                                        <img 
                                            src={profileImageUrl} 
                                            alt="Profile" 
                                            style={{
                                                width: '100%', 
                                                height: '100%', 
                                                objectFit: 'cover',
                                                transition: 'transform 0.3s'
                                            }}
                                            onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                                            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                                        />
                                        <div style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            background: 'rgba(0,0,0,0.3)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            opacity: 0,
                                            transition: 'opacity 0.3s',
                                            color: 'white',
                                            fontSize: '12px',
                                            fontWeight: 'bold'
                                        }}
                                        onMouseEnter={(e) => e.target.style.opacity = 1}
                                        onMouseLeave={(e) => e.target.style.opacity = 0}>
                                            👁️ View
                                        </div>
                                    </div>
                                ) : (
                                    // Icône SVG par défaut - TOUJOURS visible
                                    <div style={{
                                        width: '100%',
                                        height: '100%',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#6c757d',
                                        border: '4px solid white',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                    }}>
                                        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" 
                                                strokeWidth="2"/>
                                            <path d="M20 21C20 19.6044 20 18.9067 19.8278 18.3389C19.44 17.0605 18.4395 16.06 17.1611 15.6722C16.5933 15.5 15.8956 15.5 14.5 15.5H9.5C8.10444 15.5 7.40665 15.5 6.83886 15.6722C5.56045 16.06 4.56004 17.0605 4.17224 18.3389C4 18.9067 4 19.6044 4 21" 
                                                strokeWidth="2"/>
                                        </svg>
                                    </div>
                                )}
                                
                                <button 
                                    className="avatar-camera-icon"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowAvatarMenu(!showAvatarMenu);
                                    }}
                                    disabled={loading}
                                >
                                    📷
                                </button>
                                
                                {/* Avatar dropdown menu */}
                                <div className={`dropdown-menu ${showAvatarMenu ? 'show' : ''}`} 
                                     style={{ bottom: '-150px', left: '0', minWidth: '220px' }}>
                                    <div className="dropdown-item" onClick={() => !loading && avatarFileInputRef.current.click()}>
                                        <span style={{ marginRight: '10px' }}>📸</span>
                                        Edit photo
                                    </div>
                                    {profileImageUrl && (
                                        <div className="dropdown-item" onClick={() => setShowImageModal(true)}>
                                            <span style={{ marginRight: '10px' }}>👁️</span>
                                            View photo
                                        </div>
                                    )}
                                    {profileImageUrl && (
                                        <div className="dropdown-item delete" onClick={handleRemoveAvatar}>
                                            <span style={{ marginRight: '10px', display: 'flex', alignItems: 'center' }}><Trash2 size={18} /></span>
                                            Remove Photo
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <input
                                type="file"
                                ref={avatarFileInputRef}
                                accept="image/*"
                                onChange={handleAvatarUpload}
                                disabled={loading}
                                style={{display: 'none'}}
                            />
                        </div>

                        {/* Info */}
                        <div className="profile-info-section">
                            <div className="profile-header">
                                <div className="profile-text">
                                    <h1 className="profile-name">{fullName}</h1>
                                    <span className="profile-program">{program}</span>
                                    {user.bio && <p className="profile-description">{user.bio}</p>}
                                </div>
                                
                                <button 
                                    className="edit-profile-icon"
                                    onClick={() => navigate('/profile/edit')}
                                    disabled={loading}
                                >
                                    ✎
                                </button>
                            </div>
                        </div>

                        {/* Posts */}
                        <div className="posts-section">
                            <div className="posts-title">Posts</div>
                            {userPosts.length > 0 ? (
                                userPosts.map(post => (
                                    <PostCard 
                                        key={post.idpost} 
                                        post={post}
                                        onPostDeleted={() => setUserPosts(prev => prev.filter(p => p.idpost !== post.idpost))}
                                        onEdit={handleEditPost}
                                    />
                                ))
                            ) : (
                                <p style={{textAlign: 'center', color: '#666', padding: '20px'}}>You have no posts yet.</p>
                            )}
                        </div>
                    </div>

                    {/* Modal pour créer/éditer un post */}
                    {isModalOpen && (
                        <CreatePostModal 
                            isOpen={isModalOpen} 
                            onClose={() => { setIsModalOpen(false); setEditingPost(null); }}
                            onPostCreated={() => { /* Refresh logic if needed */ }}
                            postToEdit={editingPost}
                        />
                    )}

                    {/* CSS Styles */}
                    <style jsx="true">{`
                        @keyframes fadeIn {
                            from { opacity: 0; }
                            to { opacity: 1; }
                        }
                        
                        @keyframes slideIn {
                            from {
                                opacity: 0;
                                transform: translateY(10px);
                            }
                            to {
                                opacity: 1;
                                transform: translateY(0);
                            }
                        }
                        
                        @keyframes slideInRight {
                            from {
                                opacity: 0;
                                transform: translateX(30px);
                            }
                            to {
                                opacity: 1;
                                transform: translateX(0);
                            }
                        }
                        
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                        
                        .dropdown-menu {
                            position: absolute;
                            background: white;
                            border-radius: 12px;
                            box-shadow: 0 8px 30px rgba(0,0,0,0.2);
                            min-width: 200px;
                            z-index: 1000;
                            display: none;
                            border: 1px solid #e0e0e0;
                            overflow: hidden;
                            animation: slideIn 0.2s ease-out;
                        }
                        
                        .dropdown-menu.show {
                            display: block;
                        }
                        
                        .dropdown-item {
                            padding: 14px 18px;
                            cursor: pointer;
                            display: flex;
                            align-items: center;
                            color: #333;
                            font-size: 14px;
                            font-weight: 500;
                            transition: all 0.2s;
                            border-bottom: 1px solid #f5f5f5;
                        }
                        
                        .dropdown-item:last-child {
                            border-bottom: none;
                        }
                        
                        .dropdown-item:hover {
                            background: #f8f9fa;
                            color: #007bff;
                        }
                        
                        .dropdown-item.delete:hover {
                            background: #dc3545;
                            color: white;
                        }
                        
                        .dropdown-item.delete {
                            color: #dc3545;
                        }
                    `}</style>
                </div>
    );
};

export default Profile;