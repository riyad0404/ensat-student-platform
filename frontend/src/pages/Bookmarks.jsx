import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import PostCard from '../components/Postcard';
import { useAuth } from '../contexts/AuthContext';

const Bookmarks = () => {
  const { user } = useAuth();
  const currentUserId = user?.iduser || user?.id;
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showClearModal, setShowClearModal] = useState(false);

  const loadBookmarks = () => {
    if (!currentUserId) {
      setBookmarks([]);
      setLoading(false);
      return;
    }
    try {
      const saved = JSON.parse(localStorage.getItem(`bookmarks_${currentUserId}`) || '[]');
      console.log('Loaded bookmarks:', saved);
      setBookmarks(saved);
    } catch (error) {
      console.error('Erreur chargement bookmarks:', error);
      setBookmarks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookmarks();
    
    const handleBookmarksUpdate = () => {
      loadBookmarks();
    };
    
    window.addEventListener('bookmarksUpdated', handleBookmarksUpdate);
    
    return () => {
      window.removeEventListener('bookmarksUpdated', handleBookmarksUpdate);
    };
  }, [currentUserId]);

  const removeFromBookmarks = (idpost) => {
    if (!currentUserId) return;
    const storageKey = `bookmarks_${currentUserId}`;
    const newBookmarks = bookmarks.filter(b => b.idpost !== idpost);
    localStorage.setItem(storageKey, JSON.stringify(newBookmarks));
    setBookmarks(newBookmarks);
    window.dispatchEvent(new Event('bookmarksUpdated'));
  };

  const clearAllBookmarks = () => {
    if (!currentUserId) return;
    setShowClearModal(true);
  };

  const confirmClearAll = () => {
    const storageKey = `bookmarks_${currentUserId}`;
    localStorage.setItem(storageKey, JSON.stringify([]));
    setBookmarks([]);
    window.dispatchEvent(new Event('bookmarksUpdated'));
    setShowClearModal(false);
  };

  if (loading) {
    return (
      <div className="bookmarks-page-container" style={{ background: '#f4f6fa' }}>
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: '800', 
          marginBottom: '8px',
          background: 'linear-gradient(135deg, #333333 0%, #E7A33E 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          color: 'transparent',
          width: 'fit-content'
        }}>Saved Posts</h1>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
          <div style={{ fontSize: '18px', color: '#666' }}>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bookmarks-page-container" style={{ background: '#f4f6fa' }}>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 30px', background: 'white', borderBottom: '1px solid rgba(0, 64, 208, 0.06)' }}>
        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: '800', 
          margin: 0,
          background: 'linear-gradient(135deg, #333333 0%, #E7A33E 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          color: 'transparent',
          width: 'fit-content'
        }}>Saved Posts</h1>
        
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          {bookmarks.length > 0 && (
            <button 
              onClick={clearAllBookmarks}
              style={{ 
                background: '#ef4444', 
                color: 'white', 
                border: 'none', 
                padding: '12px 24px', 
                borderRadius: '25px', 
                fontWeight: '600', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.2)';
              }}
            >
              <Trash2 size={20} /> Clear All
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <p style={{ color: '#6b7280', margin: 0 }}>
            {bookmarks.length} {bookmarks.length === 1 ? 'post' : 'posts'} saved
          </p>
        </div>
      </div>

      <div className="page-content">
        {/* Posts Grid - Style Instagram avec taille uniforme */}
        {bookmarks.length === 0 ? (
          <div style={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '100px 20px',
            textAlign: 'center',
            background: 'white',
            borderRadius: '20px',
            border: '1px solid #e5e7eb'
          }}>
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#E7A33E" strokeWidth="1.5">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937', margin: '24px 0 12px 0' }}>
              No saved posts yet
            </h2>
            <p style={{ color: '#6b7280', margin: 0, fontSize: '16px' }}>
              Posts you bookmark will appear here
            </p>
          </div>
        ) : (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: '24px',
            paddingBottom: '40px'
          }}>
            {bookmarks.map((post) => (
                <PostCard 
                  key={post.idpost}
                  post={post}
                  onPostDeleted={() => removeFromBookmarks(post.idpost)}
                  onPostUpdated={loadBookmarks}
                />
            ))}
          </div>
        )}
      </div>

      {/* Clear All Confirmation Modal */}
      {showClearModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 3000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            background: 'white',
            width: '90%',
            maxWidth: '350px',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.125rem', fontWeight: '700', color: '#111827' }}>Clear All Bookmarks?</h3>
            <p style={{ color: '#667781', marginBottom: '20px', fontSize: '14px' }}>Are you sure you want to clear all saved posts?</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowClearModal(false)} style={{ padding: '8px 16px', borderRadius: '20px', fontWeight: '500', cursor: 'pointer', background: 'none', border: '1px solid #ddd', color: '#111b21' }}>Cancel</button>
              <button onClick={confirmClearAll} style={{ padding: '8px 16px', borderRadius: '20px', fontWeight: '500', cursor: 'pointer', background: '#ef4444', border: 'none', color: 'white' }}>Clear All</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookmarks;
     