import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import Feed from "../components/feed";
import CreatePostModal from "../components/CreatePostModal";
import { getAllPosts } from "../api/postAPI";

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('create') === '1') {
      setIsModalOpen(true);
      navigate('/', { replace: true }); 
    }
  }, [location.search, navigate]);

 const fetchPosts = async () => {
  try {
    setLoading(true);
    const data = await getAllPosts();
    
    // DEBUG: Vérifiez la structure
    console.log('📥 Posts reçus:', data);
    if (data && data.length > 0) {
      console.log('🔍 Premier post:', {
        id: data[0].idpost,
        contenu: data[0].contenu,
        hasDocuments: !!data[0].documents,
        documentsCount: data[0].documents?.length || 0,
        documents: data[0].documents
      });
    }
    
    let postsArray = Array.isArray(data) ? data : (data.posts || data.data || []);
    postsArray.sort((a, b) => new Date(b.createdAt || b.dateCreation) - new Date(a.createdAt || a.dateCreation));
    setPosts(postsArray);
  } catch (err) {
    setError(err.message || "Erreur de connexion");
  } finally {
    setLoading(false);
  }
};

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // ✅ CORRECTION: Recharger tous les posts
  const handlePostCreated = async (newPost) => {
    console.log('✅ Post créé, rechargement des posts...');
    await fetchPosts(); // Recharge TOUS les posts depuis le serveur
  };

  return (
    <div style={{ width: '100%' }}> 
      {!loading && !error && posts.length > 0 && <Feed posts={posts} />}
      
      <CreatePostModal 
        key={isModalOpen ? "open" : "closed"} 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onPostCreated={handlePostCreated}
      />
    </div>
  );
};

export default HomePage;