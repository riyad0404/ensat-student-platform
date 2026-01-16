import React, { useState, useEffect } from "react";
import { useLocation } from 'react-router-dom';
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
    // initial check handled below via location effect
  }, []);

  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('create') === '1') {
      setIsModalOpen(true);
      // remove the query param without reloading
      params.delete('create');
      const newSearch = params.toString();
      const newUrl = location.pathname + (newSearch ? `?${newSearch}` : '');
      window.history.replaceState({}, '', newUrl);
    }
  }, [location.search]);

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

  // removed unused handleNewPost

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  return (
  <div style={{ width: '100%' }}> 
    {/* Pas de margin-top ici, le MainLayout s'en occupe avec content-wrapper */}
    {!loading && !error && posts.length > 0 && (
      <Feed posts={posts} />
    )}
    
    <CreatePostModal 
      isOpen={isModalOpen}
      onClose={handleCloseModal}
      onPostCreated={handlePostCreated}
    />
  </div>
);
};

export default HomePage;
