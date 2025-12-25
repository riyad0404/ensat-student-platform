import React, { useState, useEffect } from "react";
import TopBar from "../components/TopBar";
import Feed from "../components/feed";
import CreatePostModal from "../components/CreatePostModal";
import { getAllPosts } from "../api/postAPI";

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await getAllPosts();
      
      console.log("Données reçues de l'API:", data);
      
      let postsArray = [];
      
      if (Array.isArray(data)) {
        postsArray = data;
      } else if (data.posts && Array.isArray(data.posts)) {
        postsArray = data.posts;
      } else if (data.data && Array.isArray(data.data)) {
        postsArray = data.data;
      }
      
      postsArray.sort((a, b) => 
        new Date(b.createdAt || b.dateCreation) - new Date(a.createdAt || a.dateCreation)
      );
      
      console.log("Posts formatés:", postsArray);
      setPosts(postsArray);
      
    } catch (err) {
      console.error("Erreur lors du chargement des posts:", err);
      setError(err.response?.data?.message || err.message || "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  const handleNewPost = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handlePostCreated = (newPost) => {
    // Ajouter le nouveau post en haut de la liste
    setPosts([newPost, ...posts]);
  };

  return (
    <div style={{ width: '100%', margin: 0, padding: 0 }}>
      <TopBar onAddPost={handleNewPost} />
      
      {loading && (
        <div style={{ 
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '60px 20px',
          color: '#666',
          fontSize: '16px'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '15px'
          }}>
            <div className="spinner" style={{
              width: '40px',
              height: '40px',
              border: '3px solid #f3f4f6',
              borderTop: '3px solid #a855f7',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite'
            }} />
            <span>Chargement des posts...</span>
          </div>
        </div>
      )}
      
      {error && (
        <div style={{ 
          textAlign: 'center', 
          padding: '20px 40px', 
          color: '#ef4444',
          backgroundColor: '#fee2e2',
          fontSize: '14px'
        }}>
          ⚠️ Erreur: {error}
        </div>
      )}
      
      {!loading && !error && posts.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          color: '#666',
          fontSize: '16px'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '15px'
          }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5">
              <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z" />
              <path d="M3 9h18M9 21V9" />
            </svg>
            <p>Aucun post disponible pour le moment.</p>
            <button 
              onClick={handleNewPost}
              style={{
                background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                color: 'white',
                border: 'none',
                padding: '10px 24px',
                borderRadius: '30px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                marginTop: '10px'
              }}
            >
              Créer le premier post
            </button>
          </div>
        </div>
      )}
      
      {!loading && !error && posts.length > 0 && <Feed posts={posts} />}

      {/* Modal pour créer un post */}
      <CreatePostModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onPostCreated={handlePostCreated}
      />
    </div>
  );
};

export default HomePage;