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

  // DEBUG: afficher la structure du post
  useEffect(() => {
    console.log(`📝 PostCard ${post.idpost}:`, {
      isAnonymat: post.isAnonymat,
      auteur: post.auteur,
      author_nom: post.auteur?.nom,
      author_prenom: post.auteur?.prenom
    });
  }, [post.idpost, post.auteur, post.isAnonymat]);

  useEffect(() => {
    if (!post?.idpost) return;

    const loadPostData = async () => {
      try {
        const reactions = await getReactionCounts(post.idpost);
        setLikeCount(reactions?.likes || reactions?.LIKE || 0);

        const myReaction = await getMyReactions(post.idpost);
        setIsLiked(myReaction?.hasLike || myReaction?.typeReaction === 'LIKE');

        const postComments = await getCommentsByPost(post.idpost);
        setComments(postComments || []);
        setCommentCount(postComments?.length || 0);
      } catch (error) {
        console.error("Erreur chargement:", error);
      }
    };
    loadPostData();
  }, [post?.idpost]);

  // LOGIQUE D'AFFICHAGE DE L'IMAGE : On check documents[] ET document
  const postImageUrl = (post.documents && post.documents.length > 0) 
    ? post.documents[0].url 
    : post.document?.url || post.url || post.image;

  const handleLike = async () => {
    if (!post?.idpost) return;
    try {
      await toggleReaction(post.idpost, 'LIKE');
      const reactions = await getReactionCounts(post.idpost);
      setLikeCount(reactions?.likes || 0);
      const myStatus = await getMyReactions(post.idpost);
      setIsLiked(myStatus?.hasLike || false);
    } catch (error) { console.error(error); }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (comment.trim() && post?.idpost) {
      try {
        setLoading(true);
        const newComment = await createComment(post.idpost, comment);
        setComments([...comments, newComment]);
        setCommentCount(prev => prev + 1);
        setComment("");
      } catch (error) { console.error(error); } finally { setLoading(false); }
    }
  };

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="post-author">
          <img src={post.auteur?.photo || "/default-avatar.png"} alt="Avatar" className="author-avatar" />
          <div className="author-info">
            <h3 className="author-name">
              {post.auteur?.nom ? `${post.auteur.nom} ${post.auteur.prenom || ''}` : "Utilisateur"}
            </h3>
            <p className="author-role">{post.auteur?.niveau || "Étudiant"}</p>
          </div>
        </div>
        <button className="post-menu-btn">⋮</button>
      </div>

      <div className="post-content">
        <p className="post-text">{post.contenu}</p>
        {postImageUrl && (
          <div className="post-image-container">
            <img 
              src={postImageUrl} 
              alt="Document" 
              className="post-image" 
              onError={(e) => {
                // Secours si l'URL est relative
                if (postImageUrl && !postImageUrl.startsWith('http')) {
                    e.target.src = `http://localhost:5000${postImageUrl}`;
                } else {
                    e.target.style.display = 'none';
                }
              }} 
            />
          </div>
        )}
      </div>

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

        <button className="stat-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" />
          </svg>
          <span className="stat-count">Partager</span>
        </button>
      </div>

      <div className="comment-section">
        <form onSubmit={handleComment} className="comment-form">
          <img src="/default-avatar.png" alt="Moi" className="comment-avatar" />
          <input
            type="text"
            placeholder="Écrivez votre commentaire..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="comment-input"
          />
          <button type="submit" className="comment-submit-btn" disabled={!comment.trim() || loading}>
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
          </button>
        </form>

        {/* Liste des commentaires */}
        {showComments && comments.length > 0 && (
          <div className="comments-list">
            {comments.map((c) => (
              <div key={c.idcomment} className="comment-item">
                <img 
                  src={c.user?.photo || "/default-avatar.png"} 
                  alt={c.user?.nom || "User"} 
                  className="comment-author-avatar"
                />
                <div className="comment-content">
                  <p className="comment-author-name">
                    {c.user?.nom ? `${c.user.nom} ${c.user.prenom || ''}` : "Anonyme"}
                  </p>
                  <p className="comment-text">{c.contenu}</p>
                  <span className="comment-date">
                    {new Date(c.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {showComments && comments.length === 0 && (
          <div className="no-comments">Aucun commentaire pour le moment</div>
        )}
      </div>
    </div>
  );
};

export default PostCard;