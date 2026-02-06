import React, { useState, useEffect } from 'react';
import PostCard from '../components/Postcard';
import CreatePostModal from '../components/CreatePostModal';
import NotificationBell from '../components/NotificationBell';
import { getAllPosts } from '../api/postAPI';
import conversationAPI from '../api/conversationAPI';
import '../styles/HomePage.css';
import { Search, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [postToEdit, setPostToEdit] = useState(null);
  const { user } = useAuth();
  const currentUserId = user?.iduser || user?.id;
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.search-container')) {
        setSearchResults([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchPosts = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const data = await getAllPosts();
      // Gestion de la structure de données (tableau ou objet avec propriété posts)
      const postsArray = Array.isArray(data) ? data : (data?.posts || []);
      
      if (Array.isArray(postsArray)) {
        // Tri par date décroissante
        postsArray.sort((a, b) => new Date(b.createdAt || b.dateCreation) - new Date(a.createdAt || a.dateCreation));
        setPosts(postsArray);
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error("Error loading posts", error);
      setPosts([]);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const showToastMessage = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const handleJoinRequest = async () => {
    if (!selectedGroup) return;
    try {
      const res = await axios.post(`http://localhost:5000/api/conversations/${selectedGroup.id}/join`, {}, { withCredentials: true });
      
      if (res.data.status === 'joined') {
          showToastMessage("Successfully joined the group!", 'success');
          navigate(`/conversations/${selectedGroup.id}`);
      } else {
          showToastMessage("Request sent to admin. Please wait for approval.", 'success');
      }
    } catch (error) {
      console.error("Join request failed", error);
      showToastMessage(error.response?.data?.message || "Failed to send request", 'error');
    } finally {
      setShowJoinModal(false);
      setSelectedGroup(null);
      setSearchResults([]);
      setSearchTerm('');
    }
  };

  const handleEditPost = (post) => {
    setPostToEdit(post);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setPostToEdit(null);
  };

  const handleSearch = async (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term.length > 1) {
      setSearchLoading(true);
      try {
        const promises = [];
        const lowerTerm = term.toLowerCase();

        // 1. Recherche Utilisateurs (Appel sécurisé)
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

        // 2. Recherche Groupes (Joined + Available)
        const groupsPromise = Promise.all([
            // Joined groups
            (conversationAPI && typeof conversationAPI.getConversations === 'function') 
                ? conversationAPI.getConversations().catch(() => []) 
                : Promise.resolve([]),
            // Available groups (not joined)
            axios.get('http://localhost:5000/api/conversations/groups/available', { withCredentials: true })
                .then(res => res.data)
                .catch(() => [])
        ]).then(([joined, available]) => {
            const joinedList = Array.isArray(joined) ? joined : (joined.data || []);
            const availableList = Array.isArray(available) ? available : (available.data || []);
            
            const allGroups = [
                ...joinedList.filter(c => c.type === 'GROUP'),
                ...availableList.map(g => ({ ...g, type: 'GROUP', isAvailable: true }))
            ];
            
            return { 
                type: 'groups', 
                data: allGroups.filter(c => 
                    (c.title || c.name || c.nom || '').toLowerCase().includes(lowerTerm)
                )
            };
        });
        
        promises.push(groupsPromise);

        const results = await Promise.all(promises);
        
        let users = [];
        let groups = [];

        results.forEach(res => {
          if (res.type === 'users') {
            const raw = Array.isArray(res.data) ? res.data : (res.data?.data || []);
            users = raw.filter(u => String(u.iduser) !== String(currentUserId))
                       .map(u => ({ ...u, resultType: 'user' }));
          } else if (res.type === 'groups') {
            const raw = Array.isArray(res.data) ? res.data : (res.data?.data || []);
            groups = raw.map(g => ({ ...g, resultType: 'group' }));
          }
        });

        setSearchResults([...users, ...groups]);
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

  const handlePostCreated = (savedPost) => {
    if (savedPost && savedPost.idpost) {
      setPosts(prev => {
        const exists = prev.find(p => p.idpost === savedPost.idpost);
        if (exists) {
          return prev.map(p => p.idpost === savedPost.idpost ? { 
            ...p, 
            ...savedPost,
            auteur: savedPost.auteur || p.auteur // Garder l'auteur si le backend ne le renvoie pas complet
          } : p);
        }
        return [savedPost, ...prev];
      });
    }
    fetchPosts(false); // Rafraîchir le flux après création
  };

  return (
    <div className="homepage-container">
      {/* Toast Notification */}
      {toast.show && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: toast.type === 'error' ? '#ef4444' : '#22c55e',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 3000,
          display: 'flex',
          alignItems: 'center',
          fontWeight: '500',
          animation: 'fadeIn 0.3s ease-in'
        }}>
          {toast.message}
        </div>
      )}
      <div className="page-header">
        <div className="search-container" style={{ position: 'relative', flex: 1 }}>
          <Search size={20} color="#9ca3af" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }} />
          <input 
            type="text" 
            placeholder="Search for students or groups..." 
            value={searchTerm}
            onChange={handleSearch}
            onFocus={handleSearch} // To show results when focusing if there's a term
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
                  } else if (item.resultType === 'group') {
                    const groupId = item.id || item.idconversation || item.id_conversation;
                    return (
                      <div
                        key={`group-${groupId}`}
                        className="search-result-item"
                        onClick={() => { 
                          if (item.isAvailable) {
                            setSelectedGroup({ id: groupId, name: item.title || item.name });
                            setShowJoinModal(true);
                          } else {
                            navigate(`/conversations/${groupId}`);
                            setSearchResults([]);
                            setSearchTerm('');
                          }
                        }}
                      >
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#E6F0FF', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', color: '#0040D0' }}>
                          <Users size={18} />
                        </div>
                        <div>
                          <div style={{ fontWeight: '500', color: '#1f2937' }}>{item.title || item.name || "Group"}</div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>{item.isAvailable ? "Join Group" : "Member"}</div>
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
        
        <div className="header-actions">
          <NotificationBell />
          <button className="create-post-btn" onClick={() => setIsModalOpen(true)}>
            + Create Post
          </button>
        </div>
      </div>
      
      <div className="page-content">
        <div className="posts-feed" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {loading ? (
            <div className="loading-feed">Loading posts...</div>
          ) : (
            posts.map(post => (
              <div id={`post-${post.idpost}`} key={post.idpost}>
                <PostCard 
                  post={post} 
                  onPostDeleted={fetchPosts}
                  onPostUpdated={fetchPosts}
                  showOptions={true}
                  onEdit={handleEditPost}
                />
              </div>
            ))
          )}
          {!loading && posts.length === 0 && (
            <div className="empty-feed">No posts yet. Be the first to publish!</div>
          )}
        </div>
      </div>

      <CreatePostModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        onPostCreated={handlePostCreated}
        postToEdit={postToEdit}
      />

      {/* Join Group Modal */}
      {showJoinModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 2000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: 'white', padding: '24px', borderRadius: '12px',
            width: '90%', maxWidth: '400px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
          }}>
            <h3 style={{ 
              marginTop: 0, 
              fontSize: '22px', 
              fontWeight: '700',
             background: 'linear-gradient(90deg, #0040D0 0%, #E7A33E 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              color: 'transparent',
              width: 'fit-content',
              margin: '0 auto 12px auto'
            }}>Join this group?</h3>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: '12px 0 24px 0' }}>
              You must be a member to see messages in <strong>{selectedGroup?.name}</strong>.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                onClick={() => setShowJoinModal(false)}
                style={{
                  padding: '10px 20px', borderRadius: '20px', 
                  border: '2px solid #E7A33E', background: 'transparent', color: '#E7A33E',
                  cursor: 'pointer', fontWeight: '600',
                  transition: 'all 0.2s'
                }}
              >
                Cancel
              </button>
              <button 
                onClick={handleJoinRequest}
                style={{
                  padding: '10px 20px', borderRadius: '20px', border: 'none',
                  background: 'linear-gradient(90deg, #0040D0, #0055FF)', color: 'white', 
                  cursor: 'pointer', fontWeight: '600', boxShadow: '0 4px 12px rgba(0, 64, 208, 0.2)'
                }}
              >
                Join group
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;