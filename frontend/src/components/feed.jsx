import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import PostCard from "./Postcard";
import "../styles/feed.css";

const Feed = ({ posts: initialPosts = [] }) => {
  const { user } = useAuth();
  // On initialise l'état local avec les posts reçus en props
  const [posts, setPosts] = useState(initialPosts);

  // On synchronise l'état local si les props changent (ex: changement de page)
  useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

  // Mettre à jour la photo de profil dans tous les posts et commentaires de l'utilisateur connecté
  useEffect(() => {
    if (user && user.photo) {
      setPosts(prevPosts =>
        prevPosts.map(post => {
          let updatedPost = post;

          // Mettre à jour la photo de l'auteur du post
          if (post.auteur && post.auteur.iduser === user.iduser) {
            updatedPost = {
              ...updatedPost,
              auteur: {
                ...post.auteur,
                photo: user.photo
              }
            };
          }

          // Mettre à jour la photo dans les commentaires de l'utilisateur
          if (post.comments && Array.isArray(post.comments)) {
            updatedPost = {
              ...updatedPost,
              comments: post.comments.map(comment => {
                if (comment.user && comment.user.iduser === user.iduser) {
                  return {
                    ...comment,
                    user: {
                      ...comment.user,
                      photo: user.photo
                    }
                  };
                }
                return comment;
              })
            };
          }

          return updatedPost;
        })
      );
    }
  }, [user?.photo, user?.iduser]);

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