import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
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
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [isCommentAnon, setIsCommentAnon] = useState(false);
  const [commentFile, setCommentFile] = useState(null);
  const [commentNiveau, setCommentNiveau] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentCount, setCommentCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Avatar par défaut en SVG
  const defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='16' fill='%23e5e7eb'/%3E%3Cpath d='M16 16a5 5 0 100-10 5 5 0 000 10zm0 2c-5.33 0-10 2.67-10 6v2h20v-2c0-3.33-4.67-6-10-6z' fill='%239ca3af'/%3E%3C/svg%3E";

  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post?.contenu || "");
  const menuRef = useRef(null);

  const isPostAnon = post.isAnonymat === true || post.isAnonymat === 'true';
  const currentUser = JSON.parse(localStorage.getItem('user'));
  
  const isAuthor = currentUser && post && (
    Number(currentUser.iduser) === Number(post.iduser) ||
    Number(currentUser.iduser) === Number(post.auteur?.iduser)
  );

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
      } catch (error) {
        console.error("Erreur chargement:", error);
      }
    };
    loadPostData();
  }, [post?.idpost]);

  const handleCommentSubmit = async (e) => {
    if (e) e.preventDefault();
    if ((!commentText.trim() && !commentFile) || loading) return;

    if (commentFile && !commentNiveau) {
      alert("Le niveau est obligatoire pour un document");
      return;
    }

    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('idpost', post.idpost);
      formData.append('contenu', commentText.trim() || '');
      formData.append('isAnonymat', isCommentAnon);
      
      if (commentFile) {
        formData.append('file', commentFile);
        formData.append('niveau', commentNiveau);
      }

      const newComment = await createComment(post.idpost, formData);

      // Recharger tous les commentaires
      const allComments = await getCommentsByPost(post.idpost);
      
      setComments(allComments);
      setCommentCount(allComments.length);
      
      setCommentText("");
      setCommentFile(null);
      setCommentNiveau("");
      setIsCommentAnon(false);
      setShowComments(true);
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi:', error);
      const errorMsg = error.response?.data?.message || 'Erreur lors de l\'envoi du commentaire';
      alert(`Erreur: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      const newStatus = !isLiked;
      setIsLiked(newStatus);
      setLikeCount(prev => newStatus ? prev + 1 : prev - 1);
      await toggleReaction(post.idpost, 'LIKE');
    } catch (error) {
      console.error("Erreur reaction:", error);
    }
  };

  // ✅ CORRECTION: Récupération du document du post
  const postDoc = post.documents?.[0] || post.document || null;

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="post-author">
          <img 
            src={isPostAnon ? defaultAvatar : (post.auteur?.photo || defaultAvatar)} 
            className="author-avatar" 
            alt="" 
          />
          <div className="author-info">
            <h3 className="author-name">
              {isPostAnon ? "Utilisateur Anonyme" : `${post.auteur?.nom || ''} ${post.auteur?.prenom || ''}`}
            </h3>
            <p className="author-role">{isPostAnon ? "Étudiant" : post.auteur?.niveau}</p>
          </div>
        </div>
      </div>

      <div className="post-content">
        <p className="post-text">{post.contenu}</p>
        
        {/* ✅ CORRECTION: Affichage du document */}
        {postDoc && (
          <>
            {/* Si c'est une image */}
            {(postDoc.type === 'IMAGE' || postDoc.url?.match(/\.(jpg|jpeg|png|gif|webp)$/i)) ? (
              <div className="post-image-container">
                <img 
                  src={postDoc.url} 
                  alt={postDoc.filename || "Post content"} 
                  className="post-image"
                />
              </div>
            ) : (
              /* Si c'est un document */
              <div className="post-document-container">
                <a 
                  href={postDoc.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="post-file-link"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                    <polyline points="13 2 13 9 20 9"></polyline>
                  </svg>
                  <div className="file-details">
                    <span className="file-name">{postDoc.filename || 'Document'}</span>
                    {postDoc.niveau && <span className="file-niveau-badge">{postDoc.niveau}</span>}
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                </a>
              </div>
            )}
          </>
        )}
      </div>

      <div className="post-stats">
        <button className={`stat-btn ${isLiked ? 'liked' : ''}`} onClick={handleLike}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill={isLiked ? "#ec4899" : "none"} stroke={isLiked ? "#ec4899" : "currentColor"} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
          <span>{likeCount} Likes</span>
        </button>

        <button className="stat-btn" onClick={() => setShowComments(!showComments)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
          <span>{commentCount} Commentaires</span>
        </button>

        <button className="stat-btn" onClick={() => {
            navigator.clipboard.writeText(`${window.location.origin}/post/${post.idpost}`);
            alert("Lien copié !");
          }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>
          <span>Partager</span>
        </button>
      </div>

      <div className="comment-section">
        <form onSubmit={handleCommentSubmit} className="comment-form-container">
          <div className="comment-input-wrapper">
            <input
              type="text"
              placeholder="Écrivez votre commentaire..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="comment-input"
            />
            <button 
              type="submit" 
              className="comment-submit-icon-btn" 
              disabled={(!commentText.trim() && !commentFile) || loading}
            >
              {loading ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" opacity="0.3"/>
                  <path d="M12 2 A10 10 0 0 1 22 12" strokeLinecap="round">
                    <animateTransform
                      attributeName="transform"
                      type="rotate"
                      from="0 12 12"
                      to="360 12 12"
                      dur="1s"
                      repeatCount="indefinite"
                    />
                  </path>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              )}
            </button>
          </div>
          
          <div className="comment-options">
            <label className="anon-label">
              <input 
                type="checkbox" 
                checked={isCommentAnon} 
                onChange={() => setIsCommentAnon(!isCommentAnon)} 
              />
              Commenter anonymement
            </label>
            
            {commentFile ? (
              <div className="file-selected-container">
                <div className="file-info">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2">
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                    <polyline points="13 2 13 9 20 9"></polyline>
                  </svg>
                  <span className="file-name">{commentFile.name}</span>
                  <button 
                    type="button" 
                    onClick={() => {setCommentFile(null); setCommentNiveau('');}}
                    className="file-remove-btn"
                    title="Supprimer le fichier"
                  >
                    ✕
                  </button>
                </div>
                
                <select 
                  value={commentNiveau} 
                  onChange={(e) => setCommentNiveau(e.target.value)}
                  className="niveau-select"
                  required
                >
                  <option value="">📚 Sélectionner le niveau</option>
                  <optgroup label="Prépa">
                    <option value="AP1">AP1</option>
                    <option value="AP2">AP2</option>
                  </optgroup>
                  <optgroup label="Génie Informatique">
                    <option value="GINF1">GINF1</option>
                    <option value="GINF2">GINF2</option>
                    <option value="GINF3">GINF3</option>
                  </optgroup>
                  <optgroup label="Génie logistique et industrielle">
                    <option value="GIL1">GIL1</option>
                    <option value="GIL2">GIL2</option>
                    <option value="GIL3">GIL3</option>
                  </optgroup>
                  <optgroup label="Génie des Systèmes et Réseaux">
                    <option value="GSR1">GSR1</option>
                    <option value="GSR2">GSR2</option>
                    <option value="GSR3">GSR3</option>
                  </optgroup>
                  <optgroup label="Génie environnements ">
                    <option value="G2EI1">G2EI1</option>
                    <option value="G2EI2">G2EI2</option>
                    <option value="G2EI3">G2EI3</option>
                  </optgroup>
                  <optgroup label="Génie des Systèmes Électriques et Automatiques">
                    <option value="GSEA1">GSEA1</option>
                    <option value="GSEA2">GSEA2</option>
                    <option value="GSEA3">GSEA3</option>
                  </optgroup>
                  <optgroup label="Génie Cyber et securite">
                    <option value="GSYC1">GSYC1</option>
                    <option value="GSYC2">GSYC2</option>
                    <option value="GSYC3">GSYC3</option>
                  </optgroup>
                </select>
              </div>
            ) : (
              <label className="file-upload-btn">
                <input 
                  type="file" 
                  onChange={(e) => setCommentFile(e.target.files[0])}
                  style={{display: 'none'}}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png"
                />
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                </svg>
                <span>Joindre un fichier</span>
              </label>
            )}
          </div>
        </form>

        {showComments && (
          <div className="comments-list">
            {comments.map((c, index) => {
              const cAnon = c.isAnonymat === true || c.isAnonymat === 'true' || c.isAnonymat === 1;
              
              const author = c.auteur || c.user;
              const userNom = author?.nom || "";
              const userPrenom = author?.prenom || "";
              const userPhoto = author?.photo;
              
              const fullName = `${userPrenom} ${userNom}`.trim();
              const avatarSrc = cAnon ? defaultAvatar : (userPhoto || defaultAvatar);
              const displayName = cAnon ? "Anonyme" : (fullName || "Utilisateur");

              const commentDoc = c.documents?.[0] || c.document;

              return (
                <div key={c.idcomment || index} className="comment-item-row">
                  <img 
                    src={avatarSrc} 
                    className="comment-avatar-small" 
                    alt="avatar"
                    loading="eager"
                  />
                  <div className="comment-bubble">
                    <p className="comment-author-name">{displayName}</p>
                    <p className="comment-text">{c.contenu}</p>
                    
                    {commentDoc && (
                      <div className="comment-document">
                        {commentDoc.type === 'IMAGE' ? (
                          <img 
                            src={commentDoc.url} 
                            alt={commentDoc.filename}
                            className="comment-image"
                          />
                        ) : (
                          <a 
                            href={commentDoc.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="comment-file-link"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                              <polyline points="13 2 13 9 20 9"></polyline>
                            </svg>
                            <span className="file-name-link">{commentDoc.filename}</span>
                            <span className="file-niveau-badge">{commentDoc.niveau}</span>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;