import React, { useState, useEffect } from "react";
import PostCard from "./Postcard";
import "../styles/feed.css";

const Feed = ({ posts: initialPosts = [] }) => {
  // On initialise l'état local avec les posts reçus en props
  const [posts, setPosts] = useState(initialPosts);

  // On synchronise l'état local si les props changent (ex: changement de page)
  useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

  // 1. Logique de suppression instantanée
  const handleDeleteFromFeed = (idpost) => {
    setPosts(prevPosts => prevPosts.filter(post => post.idpost !== idpost));
  };

  // 2. Logique de modification instantanée
  const handleUpdateFromFeed = (updatedPost) => {
    setPosts(prevPosts => prevPosts.map(post => 
      post.idpost === updatedPost.idpost ? { ...post, ...updatedPost } : post
    ));
  };

  return (
    <div className="feed">
      {posts.length > 0 ? (
        posts.map((post) => (
          <PostCard 
            key={post.idpost} 
            post={post} 
            onPostDeleted={handleDeleteFromFeed} 
            onPostUpdated={handleUpdateFromFeed}
          />
        ))
      ) : (
        <p className="no-posts">Aucune publication à afficher.</p>
      )}
    </div>
  );
};

export default Feed;