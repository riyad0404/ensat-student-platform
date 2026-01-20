import React, { useState, useEffect } from 'react';
import PostCard from '../components/Postcard';
import '../styles/Bookmarks.css';

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookmarks();
    
    // Écouter les changements de bookmarks
    const handleBookmarksUpdate = () => {
      loadBookmarks();
    };
    
    window.addEventListener('bookmarksUpdated', handleBookmarksUpdate);
    
    return () => {
      window.removeEventListener('bookmarksUpdated', handleBookmarksUpdate);
    };
  }, []);

  const loadBookmarks = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('bookmarks') || '[]');
      setBookmarks(saved);
    } catch (error) {
      console.error('Erreur chargement bookmarks:', error);
      setBookmarks([]);
    } finally {
      setLoading(false);
    }
  };

  const clearAllBookmarks = () => {
    if (window.confirm('Voulez-vous vraiment supprimer tous vos favoris ?')) {
      localStorage.setItem('bookmarks', JSON.stringify([]));
      setBookmarks([]);
      window.dispatchEvent(new Event('bookmarksUpdated'));
    }
  };

  if (loading) {
    return (
      <div className="bookmarks-page">
        <div className="bookmarks-header">
          <h1>Saved Posts</h1>
        </div>
        <div className="loading-bookmarks">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2">
            <circle cx="12" cy="12" r="10" opacity="0.3"/>
            <path d="M12 2 A10 10 0 0 1 22 12" strokeLinecap="round">
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 12 12"
                to="360 12 12"
                dur="1s"
                repeatCount="indefinite"
              />
            </path>
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="bookmarks-page">
      <div className="bookmarks-header">
        <div className="header-content">
          <h1>Saved Posts</h1>
          {bookmarks.length > 0 && (
            <span className="posts-count">{bookmarks.length} {bookmarks.length === 1 ? 'post' : 'posts'}</span>
          )}
        </div>
        {bookmarks.length > 0 && (
          <button onClick={clearAllBookmarks} className="clear-all-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
            Clear All
          </button>
        )}
      </div>

      {bookmarks.length === 0 ? (
        <div className="empty-bookmarks">
          <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
          <h2>No saved posts yet</h2>
          <p>Posts you bookmark will appear here</p>
        </div>
      ) : (
        <div className="bookmarks-feed">
          {bookmarks.map((post) => (
            <PostCard 
              key={post.idpost} 
              post={post}
              onPostDeleted={loadBookmarks}
              onPostUpdated={loadBookmarks}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookmarks;