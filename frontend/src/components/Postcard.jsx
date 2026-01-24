import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  getCommentsByPost,
  createComment,
  getReactionCounts,
  getMyReactions,
  toggleReaction,
 
} from "../api/postAPI";
import { MoreVertical, Edit2, Trash2, Bookmark, BookmarkMinus } from 'lucide-react';

import "../styles/PostCard.css";

const PostCard = ({ post, onPostDeleted, onPostUpdated, isBookmark = false, onEdit }) => {
  const navigate = useNavigate();
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
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Helper pour l'image de profil - Version Améliorée
  const getProfileImage = (userObj) => {
    if (!userObj) return null;
    
    // Récupérer l'ID peu importe le nom du champ
    const userId = userObj.iduser || userObj.id || userObj.userId || userObj.Id;

    // 1. Vérifier le localStorage (priorité pour les mises à jour instantanées)
    if (userId) {
      const localImg = localStorage.getItem(`profile_image_${userId}`);
      if (localImg) return localImg;
    }

    // 2. Sinon utiliser la photo du backend (supporte photo, Photo, avatar, etc.)
    const photoPath = userObj.photo || userObj.Photo || userObj.avatar;
    
    if (!photoPath || typeof photoPath !== 'string') return null;
    
    if (photoPath.startsWith('http') || photoPath.startsWith('data:')) {
      return photoPath;
    }
    return `http://localhost:5000${photoPath.startsWith('/') ? '' : '/'}${photoPath}`;
  };

  // Avatar par défaut (SVG gris)
  const DefaultAvatar = () => (
    <div style={{
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      background: '#e5e7eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    </div>
  );

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

  const loadPostData = async () => {
    if (!post?.idpost) return;
    try {
      const [reactions, myStatus, postComments] = await Promise.all([
        getReactionCounts(post.idpost),
        getMyReactions(post.idpost),
        getCommentsByPost(post.idpost)
      ]);
      
      setLikeCount(reactions?.likes || reactions?.LIKE || 0);
      setIsLiked(myStatus?.hasLike || myStatus?.typeReaction === 'LIKE');
      
      let loadedComments = Array.isArray(postComments) ? postComments : [];

      // --- HYDRATATION : Récupérer les infos utilisateurs manquantes ---
      const missingUserIds = new Set();
      loadedComments.forEach(c => {
         // Si pas d'objet auteur complet mais on a un iduser
         const hasAuthor = c.auteur || c.user || c.User || c.sender || c.student;
         if (!hasAuthor && c.iduser) {
             // On ne fetch pas si c'est le current user ou l'auteur du post (déjà connus)
             const isCurrentUser = currentUser && String(c.iduser) === String(currentUser.iduser);
             const isPostAuthor = post.auteur && String(c.iduser) === String(post.auteur.iduser);
             
             if (!isCurrentUser && !isPostAuthor) {
                 missingUserIds.add(c.iduser);
             }
         }
      });

      if (missingUserIds.size > 0) {
          try {
              const userPromises = Array.from(missingUserIds).map(id => 
                  axios.get(`http://localhost:5000/api/users/${id}`).then(res => res.data).catch(() => null)
              );
              const users = await Promise.all(userPromises);
              const userMap = {};
              users.forEach(u => { if(u) userMap[u.iduser] = u; });

              loadedComments = loadedComments.map(c => {
                  if ((!c.auteur && !c.user) && c.iduser && userMap[c.iduser]) {
                      return { ...c, user: userMap[c.iduser] }; // On attache l'user récupéré
                  }
                  return c;
              });
          } catch (err) {
              console.error("Erreur hydratation commentaires", err);
          }
      }
      // ---------------------------------------------------------------

      setComments(loadedComments);
      setCommentCount(loadedComments.length);
      
      // Vérifier si le post est bookmarké
      const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
      setIsBookmarked(bookmarks.some(b => b.idpost === post.idpost));
    } catch (error) {
      console.error("Erreur chargement:", error);
    }
  };

  useEffect(() => {
    loadPostData();

    // Écouter les mises à jour globales pour ce post
    const handleUpdate = (e) => {
      if (e.detail && e.detail.idpost === post.idpost) {
        loadPostData();
      }
    };
    window.addEventListener('postUpdated', handleUpdate);
    return () => window.removeEventListener('postUpdated', handleUpdate);
  }, [post?.idpost]);

  // Fermer le menu quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const handleCommentSubmit = async (e) => {
    if (e) e.preventDefault();
    if ((!commentText.trim() && !commentFile) || loading) return;

    if (commentFile && !commentNiveau) {
      alert("The level is optional for a document");
      // Remove the requirement
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
      
      // 🔔 Notification : Informer l'auteur du post (si ce n'est pas moi)
      if (!isAuthor && newComment && newComment.idcomment) {
        try {
          await notificationAPI.notifyComment(post.idpost, newComment.idcomment);
        } catch (err) {
          console.error("Failed to send comment notification", err);
        }
      }

      // Recharger les commentaires pour être sûr d'avoir la dernière version
      await loadPostData();
      if (onPostUpdated) onPostUpdated(); // Notifier le parent
      
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
      
      // 🔔 Notification : Informer l'auteur du post (si ce n'est pas moi et que c'est un like)
      if (newStatus && !isAuthor) {
        try {
          await notificationAPI.notifyLike(post.idpost, 'LIKE');
        } catch (err) {
          console.error("Failed to send like notification", err);
        }
      }

      // Recharger pour confirmer l'état serveur
      loadPostData();
    } catch (error) {
      console.error("Erreur reaction:", error);
    }
  };

  // ✅ Fonction pour télécharger un document (CORRIGÉE)
  const handleDownload = async (doc) => {
    try {
      const response = await fetch(doc.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = doc.filename || 'document';
      window.document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      window.document.body.removeChild(link);
    } catch (error) {
      console.error('Erreur téléchargement:', error);
      alert('Erreur lors du téléchargement');
    }
  };

  const handleBookmark = () => {
    console.log('Saving bookmark for post:', post.idpost);
    try {
      const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
      console.log('Current bookmarks:', bookmarks);
      
      if (isBookmarked) {
        // Retirer des bookmarks
        const newBookmarks = bookmarks.filter(b => b.idpost !== post.idpost);
        localStorage.setItem('bookmarks', JSON.stringify(newBookmarks));
        setIsBookmarked(false);
        console.log('Removed from bookmarks');
      } else {
        // Ajouter aux bookmarks
        const bookmarkPost = {
          idpost: post.idpost,
          contenu: post.contenu,
          auteur: post.auteur,
          isAnonymat: post.isAnonymat,
          documents: post.documents,
          dateCreation: post.dateCreation || new Date().toISOString()
        };
        bookmarks.push(bookmarkPost);
        localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
        setIsBookmarked(true);
        console.log('Added to bookmarks:', bookmarkPost);
      }
      
      // Dispatch event pour notifier le changement
      window.dispatchEvent(new Event('bookmarksUpdated'));
    } catch (error) {
      console.error('Erreur bookmark:', error);
      alert('Error saving');
    }
  };

  const handleDeletePost = async () => {
    if (isBookmark && onPostDeleted) {
      onPostDeleted();
      setShowMenu(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await deletePost(post.idpost);
        if (onPostDeleted) onPostDeleted();
      } catch (error) {
        console.error("Error deleting post:", error);
      }
    }
  };

  const postDoc = post.documents?.[0] || post.document || null;

  // Gestion de l'avatar auteur
  const authorAvatarUrl = getProfileImage(post.auteur);

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="post-author">
          <div className="author-avatar-wrapper" style={{ width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden' }}>
            {!isPostAnon && authorAvatarUrl ? (
              <img 
                src={authorAvatarUrl} 
                className="author-avatar" 
                alt="" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
              />
            ) : null}
            <div style={{ display: (!isPostAnon && authorAvatarUrl) ? 'none' : 'flex', width: '100%', height: '100%' }}><DefaultAvatar /></div>
          </div>

          <div className="author-info">
            <h3 className="author-name">
              {isPostAnon ? "Anonymous User" : `${post.auteur?.nom || ''} ${post.auteur?.prenom || ''}`}
            </h3>
            <p className="author-role">{isPostAnon ? "Student" : post.auteur?.niveau}</p>
          </div>
        </div>
        {(isAuthor || isBookmark) && (
          <div className="post-menu" ref={menuRef}>
            <button 
              className="menu-btn" 
              onClick={() => setShowMenu(!showMenu)}
              title="Options"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" />
              </svg>
              <MoreVertical size={20} />
            </button>
            {showMenu && (
              <div className="menu-dropdown">
                {isAuthor && (
                  <>
                    <button className="menu-item" onClick={() => { setShowMenu(false); if(onEdit) onEdit(post); }}>
                      <Edit2 size={16} /> Edit
                    </button>
                    <button className="menu-item delete-item" onClick={handleDelete}>
                      <Trash2 size={16} /> Delete
                    </button>
                  </>
                )}
                {isBookmark && (
                  <button className="menu-item delete-item" onClick={handleDeletePost}>
                    <BookmarkMinus size={16} /> Remove bookmark
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="post-content">
        <p className="post-text">{post.contenu}</p>
        
        {postDoc && (
          <>
            {(postDoc.type === 'IMAGE' || postDoc.url?.match(/\.(jpg|jpeg|png|gif|webp)$/i)) ? (
              <div className="post-image-container"> {/* Container needs to be relative for the button */}
                <img 
                  src={postDoc.url} 
                  alt={postDoc.filename || "Post content"} 
                  className="post-image"
                />
                <button 
                  onClick={() => handleDownload(postDoc)}
                  className="download-btn image-download-btn"
                  title="Télécharger l'image"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                </button>
              </div>
            ) : (
              <div className="post-document-container">
                <div className="post-file-wrapper">
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
                  </a>
                  <button 
                    onClick={() => handleDownload(postDoc)}
                    className="download-btn"
                    title="Télécharger"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="post-stats">
        <button className={`stat-btn ${isLiked ? 'liked' : ''}`} onClick={handleLike}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill={isLiked ? "#ec4899" : "none"} stroke={isLiked ? "#ec4899" : "currentColor"} strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <span>{likeCount} Likes</span>
        </button>

        <button className="stat-btn" onClick={() => setShowComments(!showComments)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span>{commentCount} Comments</span>
        </button>

        <button 
          className={`stat-btn ${isBookmarked ? 'bookmarked' : ''}`} 
          onClick={handleBookmark}
          title={isBookmarked ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill={isBookmarked ? "#FF6B00" : "none"} stroke={isBookmarked ? "#FF6B00" : "currentColor"} strokeWidth="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
          <span>{isBookmarked ? 'Saved' : 'Save'}</span>
        </button>
      </div>

      <div className="comment-section">
        <div className="comment-form-container">
          <div className="comment-input-wrapper">
            <input
              type="text"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleCommentSubmit(e);
                }
              }}
              className="comment-input"
            />
            <button 
              type="button" 
              onClick={() => setIsCommentAnon(!isCommentAnon)}
              className={`comment-icon-btn anon-toggle ${isCommentAnon ? 'active' : ''}`}
              title={isCommentAnon ? "Disable anonymous" : "Comment anonymously"}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={isCommentAnon ? "white" : "#0040D0"} strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              {isCommentAnon && <span className="anon-indicator">Anonymous</span>}
            </button>
            <label className="comment-icon-btn attach-label">
              <input 
                type="file" 
                onChange={(e) => setCommentFile(e.target.files[0])} 
                style={{display: 'none'}}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png"
              />
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0040D0" strokeWidth="2">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
              </svg>
            </label>
            <button 
              type="button" 
              onClick={handleCommentSubmit}
              className="comment-submit-icon-btn" 
              disabled={(!commentText.trim() && !commentFile) || loading}
            >
              {loading ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0040D0" strokeWidth="2">
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
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0040D0" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              )}
            </button>
          </div>
          
          {commentFile && (
            <div className="file-selected-container">
              <div className="file-info">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0040D0" strokeWidth="2">
                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                  <polyline points="13 2 13 9 20 9"></polyline>
                </svg>
                <span className="file-name">{commentFile.name}</span>
                <button 
                  type="button" 
                  onClick={() => {setCommentFile(null); setCommentNiveau('');}}
                  className="file-remove-btn"
                  title="Remove file"
                >
                  ✕
                </button>
              </div>
              
              <select 
                value={commentNiveau} 
                onChange={(e) => setCommentNiveau(e.target.value)}
                className="niveau-select"
              >
                <option value="">Select level (optional)</option>
                <optgroup label="Prepa">
                  <option value="AP1">AP1</option>
                  <option value="AP2">AP2</option>
                </optgroup>
                <optgroup label="Computer Science">
                  <option value="GINF1">GINF1</option>
                  <option value="GINF2">GINF2</option>
                  <option value="GINF3">GINF3</option>
                </optgroup>
                <optgroup label="Logistics and Industrial Engineering">
                  <option value="GIL1">GIL1</option>
                  <option value="GIL2">GIL2</option>
                  <option value="GIL3">GIL3</option>
                </optgroup>
                <optgroup label="Systems and Networks Engineering">
                  <option value="GSR1">GSR1</option>
                  <option value="GSR2">GSR2</option>
                  <option value="GSR3">GSR3</option>
                </optgroup>
                <optgroup label="Environmental Engineering">
                  <option value="G2EI1">G2EI1</option>
                  <option value="G2EI2">G2EI2</option>
                  <option value="G2EI3">G2EI3</option>
                </optgroup>
                <optgroup label="Electrical Systems and Automatic Engineering">
                  <option value="GSEA1">GSEA1</option>
                  <option value="GSEA2">GSEA2</option>
                  <option value="GSEA3">GSEA3</option>
                </optgroup>
                <optgroup label="Cyber Security and Engineering">
                  <option value="GSYC1">GSYC1</option>
                  <option value="GSYC2">GSYC2</option>
                  <option value="GSYC3">GSYC3</option>
                </optgroup>
              </select>
            </div>
          )}
        </div>

        {showComments && (
          <div className="comments-list">
            {comments.map((c, index) => {
              if (!c) return null; // Sécurité anti-crash si un commentaire est null
              const cAnon = c.isAnonymat === true || c.isAnonymat === 'true' || c.isAnonymat === 1;
              
              // 1. Identifier l'objet auteur (Stratégie agressive)
              // On cherche d'abord dans les sous-objets, mais on ignore les IDs (nombres/strings)
              const candidates = [c.auteur, c.author, c.Author, c.user, c.User, c.sender, c.student, c.Student, c.utilisateur, c.account];
              let commentAuthor = candidates.find(cand => cand && typeof cand === 'object' && !Array.isArray(cand));
              
              // Si aucun sous-objet valide, on utilise l'objet commentaire lui-même (cas de jointure plate)
              if (!commentAuthor) commentAuthor = c;
              
              // 2. Fallback intelligent : Si pas de nom, on regarde si c'est l'utilisateur connecté ou l'auteur du post
              // Cela corrige le cas où le backend renvoie juste l'ID sans les détails
              const authorId = commentAuthor.iduser || commentAuthor.id || commentAuthor.userId || c.iduser;
              
              // Vérifier si c'est le current user
              if (currentUser && authorId && String(authorId) === String(currentUser.iduser || currentUser.id)) {
                 // On fusionne pour garder les propriétés existantes mais combler les manques avec currentUser
                 commentAuthor = { ...commentAuthor, ...currentUser };
              }
              // Vérifier si c'est l'auteur du post (dont on a déjà les infos)
              else if (post.auteur && authorId && String(authorId) === String(post.auteur.iduser || post.auteur.id)) {
                 commentAuthor = { ...commentAuthor, ...post.auteur };
              }
              
              // Récupération des champs avec support de la casse (Nom/nom) et des variantes (lastname/nom)
              const userNom = commentAuthor?.nom || commentAuthor?.Nom || commentAuthor?.lastName || commentAuthor?.lastname || commentAuthor?.last_name || commentAuthor?.name || commentAuthor?.Name || "";
              const userPrenom = commentAuthor?.prenom || commentAuthor?.Prenom || commentAuthor?.firstName || commentAuthor?.firstname || commentAuthor?.first_name || "";
              
              const fullName = `${userPrenom} ${userNom}`.trim();
              
              // Passer l'objet complet pour l'ID et la photo (avec ID forcé)
              const avatarUrl = getProfileImage({ ...commentAuthor, iduser: authorId });
              
              // Si pas anonyme et pas de nom complet trouvé, on affiche "Utilisateur" par défaut
              // On vérifie aussi username/pseudo/userName
              const displayName = cAnon ? "Anonymous" : (fullName || commentAuthor?.username || commentAuthor?.userName || commentAuthor?.pseudo || commentAuthor?.email?.split('@')[0] || "User");

              const commentDoc = c.documents?.[0] || c.document;
              return (
                <div key={c.idcomment || index} className={`comment-item-row ${cAnon ? 'anonymous' : ''}`}>
                  <div className="comment-avatar-small" style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                    {!cAnon && avatarUrl ? (
                      <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => {e.target.style.display='none'; e.target.nextSibling.style.display='flex'}} />
                    ) : null}
                    <div style={{ display: (!cAnon && avatarUrl) ? 'none' : 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', background: '#e5e7eb' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    </div>
                  </div>
                  <div className="comment-bubble">
                    <p className="comment-author-name">{displayName}</p>
                    <p className="comment-text">{c.contenu}</p>
                    
                    {commentDoc && (
                      <div className="comment-document"> {/* This is the container for the image or file */}
                        {commentDoc.type === 'IMAGE' ? (
                          <div className="comment-image-container"> {/* New container for relative positioning */}
                            <img 
                              src={commentDoc.url} 
                              alt={commentDoc.filename}
                              className="comment-image"
                            />
                            <button 
                              onClick={() => handleDownload(commentDoc)}
                              className="download-btn-small image-download-btn-small"
                              title="Télécharger l'image"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                            </button>
                          </div>
                        ) : (
                          <div className="comment-file-wrapper">
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
                              {commentDoc.niveau && <span className="file-niveau-badge">{commentDoc.niveau}</span>}
                            </a>
                            <button 
                              onClick={() => handleDownload(commentDoc)}
                              className="download-btn-small"
                              title="Télécharger"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                              </svg>
                            </button>
                          </div>
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
