import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import PostCard from '../components/Postcard';

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookmarks();
    
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
      console.log('Loaded bookmarks:', saved);
      setBookmarks(saved);
    } catch (error) {
      console.error('Erreur chargement bookmarks:', error);
      setBookmarks([]);
    } finally {
      setLoading(false);
    }
  };

  const removeFromBookmarks = (idpost) => {
    const newBookmarks = bookmarks.filter(b => b.idpost !== idpost);
    localStorage.setItem('bookmarks', JSON.stringify(newBookmarks));
    setBookmarks(newBookmarks);
    window.dispatchEvent(new Event('bookmarksUpdated'));
  };

  const clearAllBookmarks = () => {
    if (window.confirm('Are you sure you want to clear all saved posts?')) {
      localStorage.setItem('bookmarks', JSON.stringify([]));
      setBookmarks([]);
      window.dispatchEvent(new Event('bookmarksUpdated'));
    }
  };

  if (loading) {
    return (
      <div style={{ 
        padding: '30px', 
        maxWidth: '1400px', 
        margin: '0 auto', 
        minHeight: '100vh',
        background: '#ffffff'
      }}>
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: '800', 
          marginBottom: '8px',
          color: '#333333'
        }}>Saved Posts</h1>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
          <div style={{ fontSize: '18px', color: '#666' }}>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '30px', 
      maxWidth: '1400px', 
      margin: '0 auto', 
      minHeight: '100vh',
      background: '#ffffff'
    }}>
      {/* Header */}
      <div style={{ 
        marginBottom: '40px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: '20px' 
      }}>
        <div>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: '800', 
            marginBottom: '8px', 
            marginTop: 0,
            color: '#333333'
          }}>Saved Posts</h1>
          <p style={{ color: '#6b7280', margin: 0 }}>
            {bookmarks.length} {bookmarks.length === 1 ? 'post' : 'posts'} saved
          </p>
        </div>
        {bookmarks.length > 0 && (
          <button 
            onClick={clearAllBookmarks}
            style={{ 
              background: '#0040D0', 
              color: 'white', 
              border: 'none', 
              padding: '12px 24px', 
              borderRadius: '12px', 
              fontWeight: '600', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(0, 64, 208, 0.2)',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Trash2 size={20} /> Clear All
          </button>
        )}
      </div>

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
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5">
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
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(500px, 1fr))',
          gap: '24px',
          paddingBottom: '40px'
        }}>
          {bookmarks.map((post) => (
            <div key={post.idpost} style={{ 
              width: '100%',
              minHeight: '400px'
            }}>
              <PostCard 
                post={post}
                onPostDeleted={() => removeFromBookmarks(post.idpost)}
                onPostUpdated={loadBookmarks}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookmarks;