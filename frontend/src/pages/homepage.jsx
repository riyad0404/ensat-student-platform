import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from 'react-router-dom'; // Utilisez useNavigate
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

  // Chargement des posts
  useEffect(() => {
    fetchPosts();
  }, []);

  // Surveillance de l'URL pour ouvrir la modale
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('create') === '1') {
      setIsModalOpen(true);
      // NETTOYAGE CRUCIAL : On retire le paramètre de l'URL sans recharger
      // Cela permet au prochain clic sur le lien d'être détecté comme un changement
      navigate('/', { replace: true }); 
    }
  }, [location.search, navigate]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await getAllPosts();
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

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  return (
    <div style={{ width: '100%' }}> 
      {!loading && !error && posts.length > 0 && <Feed posts={posts} />}
      
      {/* L'ajout d'une KEY force React à détruire/recréer le composant proprement */}
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