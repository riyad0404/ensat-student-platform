import React, { useState, useEffect } from 'react';
import PostCard from '../components/Postcard';
import CreatePostModal from '../components/CreatePostModal';
import { getAllPosts } from '../api/postAPI';
import conversationAPI from '../api/conversationAPI';
import '../styles/HomePage.css';
import { Search, Bell } from 'lucide-react';
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

  const fetchPosts = async () => {
    try {
      setLoading(true);
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
      setLoading(false);
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

        // 2. Recherche Groupes (Via getConversations et filtre local - méthode fiable)
        if (conversationAPI && typeof conversationAPI.getConversations === 'function') {
          promises.push(
            conversationAPI.getConversations()
              .then(res => {
                const allConvs = Array.isArray(res) ? res : (res.data || []);
                // Filtrer les groupes qui contiennent le terme de recherche
                const matchingGroups = allConvs.filter(c => 
                  c.type === 'GROUP' && 
                  (c.title || c.name || c.nom || '').toLowerCase().includes(lowerTerm)
                );
                return { type: 'groups', data: matchingGroups };
              })
              .catch(err => {
                console.error("Error searching groups locally:", err);
                return { type: 'groups', data: [] };
              })
          );
        }

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

  const handlePostCreated = () => {
    fetchPosts(); // Rafraîchir le flux après création
  };

  return (
    <div className="homepage-container">
      <div className="homepage-header">
        <div className="search-container" style={{ position: 'relative' }}>
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
                          navigate(`/conversations/${groupId}`);
                          setSearchResults([]);
                          setSearchTerm('');
                        }}
                      >
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                          <span style={{ fontSize: '16px', color: '#4f46e5' }}>👥</span>
                        </div>
                        <div>
                          <div style={{ fontWeight: '500', color: '#1f2937' }}>{item.title || item.name || "Group"}</div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>Group</div>
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
          <button className="icon-btn">
            <Bell size={24} color="#9d14b8" />
          </button>
          <button className="create-post-btn" onClick={() => setIsModalOpen(true)}>
            + Create Post
          </button>
        </div>
      </div>
      
      <div className="posts-feed">
        {loading ? (
          <div className="loading-feed">Loading posts...</div>
        ) : (
          posts.map(post => (
            <PostCard 
              key={post.idpost} 
              post={post} 
              onPostDeleted={fetchPosts}
              onPostUpdated={fetchPosts}
            />
          ))
        )}
        {!loading && posts.length === 0 && (
          <div className="empty-feed">No posts yet. Be the first to publish!</div>
        )}
      </div>

      <CreatePostModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onPostCreated={handlePostCreated}
      />
    </div>
  );
};

export default HomePage;