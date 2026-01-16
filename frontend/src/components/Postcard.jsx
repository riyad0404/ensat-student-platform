import React, { useState, useEffect, useRef } from "react";
import { 
  getCommentsByPost, 
  createComment, 
  getReactionCounts, 
  getMyReactions, 
  toggleReaction,
  deletePost,
  updatePost 
} from "../api/postAPI";
import "../styles/PostCard.css";

const PostCard = ({ post, onPostDeleted, onPostUpdated }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comment, setComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentCount, setCommentCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // États pour le menu contextuel et l'édition
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.contenu);
  const menuRef = useRef(null);

  // Vérification stricte du propriétaire
  const userStr = localStorage.getItem('user');
  const currentUser = userStr ? JSON.parse(userStr) : null;
  const isAuthor = currentUser && post && (
  Number(currentUser.iduser) === Number(post.iduser) || 
  Number(currentUser.iduser) === Number(post.auteur?.iduser)
);

  // Fermer le menu si on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!post?.idpost) return;
    const loadPostData = async () => {
      try {
        const [reactions, myStatus, postComments] = await Promise.all([
          getReactionCounts(post.idpost),
          getMyReactions(post.idpost),
          getCommentsByPost(post.idpost)
        ]);
        setLikeCount(reactions?.likes || reactions?.LIKE || 0);
        setIsLiked(myStatus?.hasLike || myStatus?.typeReaction === 'LIKE');
        setComments(postComments || []);
        setCommentCount(postComments?.length || 0);
      } catch (error) { console.error("Erreur chargement:", error); }
    };
    loadPostData();
  }, [post?.idpost]);

const handleDelete = async () => {
    if (window.confirm("Supprimer ce post ?")) {
      try {
        await deletePost(post.idpost);
        // APPEL ICI : prévient le Feed que le post est supprimé
        if (onPostDeleted) onPostDeleted(post.idpost); 
      } catch (error) {
        console.error(error);
      }
    }
  };

const handleUpdate = async () => {
  try {
    // Utilisation de PATCH comme requis par votre backend
    const updatedData = await updatePost(post.idpost, { contenu: editContent });
    
    setIsEditing(false);
    setShowMenu(false);
    
    // IMPORTANT : C'est ici que la magie opère pour le Feed
    if (onPostUpdated) onPostUpdated(updatedData); 
  } catch (error) {
    console.error("Erreur de mise à jour", error);
  }
};

  const handleLike = async () => {
    try {
      await toggleReaction(post.idpost, 'LIKE');
      const reactions = await getReactionCounts(post.idpost);
      setLikeCount(reactions?.likes || 0);
      setIsLiked(!isLiked);
    } catch (error) { console.error(error); }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (comment.trim()) {
      try {
        setLoading(true);
        const newComment = await createComment(post.idpost, comment);
        setComments([...comments, newComment]);
        setCommentCount(prev => prev + 1);
        setComment("");
      } catch (error) { console.error(error); } finally { setLoading(false); }
    }
  };

  const postImageUrl = (post.documents && post.documents.length > 0) 
    ? post.documents[0].url : (post.document?.url || post.url);

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="post-author">
          <img src={post.auteur?.photo || "/default-avatar.png"} alt="Avatar" className="author-avatar" />
          <div className="author-info">
            <h3 className="author-name">{post.auteur?.nom} {post.auteur?.prenom}</h3>
            <p className="author-role">{post.auteur?.niveau}</p>
          </div>
        </div>

        {/* BOUTON TROIS POINTS */}
        {isAuthor && (
          <div className="post-options-wrapper" ref={menuRef}>
            <button className="post-menu-btn" onClick={() => setShowMenu(!showMenu)}>⋮</button>
            {showMenu && (
              <div className="post-dropdown-menu">
                <button onClick={() => { setIsEditing(true); setShowMenu(false); }}>✏️ Modifier</button>
                <button className="delete-option" onClick={handleDelete}>🗑️ Supprimer</button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="post-content">
        {isEditing ? (
          <div className="edit-container">
            <textarea 
              value={editContent} 
              onChange={(e) => setEditContent(e.target.value)} 
              className="edit-textarea" 
            />
            <div className="edit-buttons">
              <button onClick={handleUpdate} className="save-btn">Enregistrer</button>
              <button onClick={() => setIsEditing(false)} className="cancel-btn">Annuler</button>
            </div>
          </div>
        ) : (
          <p className="post-text">{post.contenu}</p>
        )}
        {postImageUrl && !isEditing && (
          <div className="post-image-container">
            <img src={postImageUrl} alt="Post" className="post-image" />
          </div>
        )}
      </div>

      {/* BARRE DE STATS */}
      <div className="post-stats">
        <button className={`stat-btn ${isLiked ? 'liked' : ''}`} onClick={handleLike}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill={isLiked ? "#ec4899" : "none"} stroke={isLiked ? "#ec4899" : "currentColor"} strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <span className="stat-count">{likeCount} Likes</span>
        </button>

        <button className="stat-btn" onClick={() => setShowComments(!showComments)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span className="stat-count">{commentCount} Commentaires</span>
        </button>

        <button className="stat-btn" onClick={() => alert("Lien copié !")}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" />
          </svg>
          <span className="stat-count">Partager</span>
        </button>
      </div>

      {/* SECTION COMMENTAIRES */}
      <div className="comment-section">
        <form onSubmit={handleCommentSubmit} className="comment-form">
          <input
            type="text"
            placeholder="Écrivez votre commentaire..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="comment-input"
          />
          <button type="submit" className="comment-submit-btn" disabled={!comment.trim() || loading}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>

        {showComments && comments.length > 0 && (
          <div className="comments-list">
            {comments.map((c) => (
              <div key={c.idcomment} className="comment-item">
                <img src={c.user?.photo || "/default-avatar.png"} className="comment-author-avatar" alt="" />
                <div className="comment-bubble">
                  <p className="comment-author-name">{c.user?.nom} {c.user?.prenom}</p>
                  <p className="comment-text">{c.contenu}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;