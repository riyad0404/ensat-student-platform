import React, { useState, useEffect } from "react";
import { 
  getCommentsByPost, 
  createComment, 
  getReactionCounts, 
  getMyReactions, 
  toggleReaction 
} from "../api/postAPI";
import "../styles/PostCard.css";

const PostCard = ({ post }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comment, setComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentCount, setCommentCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Charger les données au montage du composant
  useEffect(() => {
    const loadPostData = async () => {
      try {
        // Charger les réactions
        const reactions = await getReactionCounts(post.idpost);
        console.log("Reactions pour post", post.idpost, ":", reactions);
        setLikeCount(reactions?.LIKE || reactions?.like || 0);

        // Vérifier si l'utilisateur a liké
        const myReaction = await getMyReactions(post.idpost);
        console.log("Ma réaction:", myReaction);
        setIsLiked(myReaction?.typeReaction === 'LIKE' || myReaction?.typeReaction === 'like');

        // Charger les commentaires
        const postComments = await getCommentsByPost(post.idpost);
        console.log("Commentaires:", postComments);
        setComments(postComments || []);
        setCommentCount(postComments?.length || 0);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        // Continuer même en cas d'erreur
        setLikeCount(0);
        setIsLiked(false);
        setComments([]);
        setCommentCount(0);
      }
    };

    loadPostData();
  }, [post.idpost]);

  const handleLike = async () => {
    try {
      console.log("🔄 Toggle like pour post:", post.idpost);
      console.log("📝 Type de idpost:", typeof post.idpost);
      
      const response = await toggleReaction(post.idpost, 'LIKE');
      console.log("✅ Réponse toggle like:", response);
      
      // Recharger les vraies données après le toggle
      const reactions = await getReactionCounts(post.idpost);
      const myReaction = await getMyReactions(post.idpost);
      
      setLikeCount(reactions?.LIKE || reactions?.like || 0);
      setIsLiked(myReaction?.typeReaction === 'LIKE' || myReaction?.typeReaction === 'like');
      
    } catch (error) {
      console.error("❌ Erreur lors du like:", error);
      console.error("📋 TOUTES les données de l'erreur:", JSON.stringify(error.response?.data, null, 2));
      console.error("🔍 Structure complète:", error.response);
      console.error("💬 Message:", error.response?.data?.message);
      console.error("⚠️ Error field:", error.response?.data?.error);
      console.error("📊 Status:", error.response?.status);
      
      // Afficher TOUT ce que le serveur renvoie
      const fullError = JSON.stringify(error.response?.data, null, 2);
      console.log("=== ERREUR COMPLÈTE DU SERVEUR ===");
      console.log(fullError);
      console.log("===================================");
      
      const errorMessage = error.response?.data?.message || error.response?.data?.error || "Erreur inconnue";
      alert(`Erreur: ${errorMessage}\n\nVoir la console pour plus de détails`);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (comment.trim() && !loading) {
      try {
        setLoading(true);
        const newComment = await createComment(post.idpost, comment);
        
        // Ajouter le commentaire à la liste
        setComments([...comments, newComment]);
        setCommentCount(prev => prev + 1);
        setComment("");
        setShowComments(true);
      } catch (error) {
        console.error("Erreur lors de l'ajout du commentaire:", error);
        alert("Erreur lors de l'ajout du commentaire");
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleComments = async () => {
    if (!showComments && comments.length === 0) {
      try {
        const postComments = await getCommentsByPost(post.idpost);
        setComments(postComments || []);
      } catch (error) {
        console.error("Erreur lors du chargement des commentaires:", error);
      }
    }
    setShowComments(!showComments);
  };

  return (
    <div className="post-card">
      {/* Header du post */}
      <div className="post-header">
        <div className="post-author">
          <img 
            src={post.user?.avatarUrl || "/default-avatar.png"} 
            alt={post.user?.nom || "User"} 
            className="author-avatar"
          />
          <div className="author-info">
            <h3 className="author-name">
              {post.user?.nom ? `${post.user.nom} ${post.user.prenom || ''}` : post.user?.username || "Utilisateur"}
            </h3>
            <p className="author-role">
              {post.user?.departement || post.user?.email || ""}
            </p>
          </div>
        </div>
        <button className="post-menu-btn">⋮</button>
      </div>

      {/* Contenu du post */}
      <div className="post-content">
        <p className="post-text">{post.contenu}</p>
        
        {post.image && (
          <img 
            src={post.image} 
            alt="Post content" 
            className="post-image"
          />
        )}
        
        {post.hashtags && post.hashtags.length > 0 && (
          <div className="post-hashtags">
            {post.hashtags.map((tag, index) => (
              <span key={index} className="hashtag">#{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Stats du post */}
      <div className="post-stats">
        <button 
          className={`stat-btn ${isLiked ? 'liked' : ''}`}
          onClick={handleLike}
          disabled={loading}
        >
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill={isLiked ? "#ec4899" : "none"}
            stroke={isLiked ? "#ec4899" : "currentColor"}
            strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <span className="stat-count">{likeCount} Likes</span>
        </button>

        <button 
          className="stat-btn"
          onClick={toggleComments}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span className="stat-count">{commentCount} Commentaires</span>
        </button>

        <button className="stat-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
          <span className="stat-count">0 Partages</span>
        </button>
      </div>

      {/* Zone de commentaire */}
      <div className="comment-section">
        <form onSubmit={handleComment} className="comment-form">
          <img 
            src="/default-avatar.png" 
            alt="Your avatar" 
            className="comment-avatar"
          />
          <input
            type="text"
            placeholder="Écrivez votre commentaire..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="comment-input"
            disabled={loading}
          />
          <button 
            type="submit" 
            className="comment-submit-btn"
            disabled={loading || !comment.trim()}
          >
            {loading ? (
              <div className="spinner" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            )}
          </button>
        </form>

        {/* Liste des commentaires */}
        {showComments && comments.length > 0 && (
          <div className="comments-list">
            {comments.map((comment) => (
              <div key={comment.idcomment} className="comment-item">
                <img 
                  src={comment.user?.avatarUrl || "/default-avatar.png"} 
                  alt={comment.user?.nom || "User"} 
                  className="comment-author-avatar"
                />
                <div className="comment-content">
                  <p className="comment-author-name">
                    {comment.isAnonymat 
                      ? "Anonyme" 
                      : comment.user?.nom 
                        ? `${comment.user.nom} ${comment.user.prenom || ''}`
                        : "Utilisateur"
                    }
                  </p>
                  <p className="comment-text">{comment.contenu}</p>
                  <span className="comment-date">
                    {new Date(comment.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {showComments && comments.length === 0 && (
          <div className="no-comments">
            Aucun commentaire pour le moment
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;