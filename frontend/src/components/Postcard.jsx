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
  deletePost,
  updatePost,
  deleteComment,
  updateComment,
  toggleCommentReaction,
  replyToComment
} from "../api/postAPI";
import { MoreVertical, MoreHorizontal, Edit2, Trash2, Bookmark, BookmarkMinus, Paperclip, Send, Eye, EyeOff, Heart, ThumbsUp, MessageSquare, CornerDownRight, X, Download } from 'lucide-react';

import "../styles/postcard.css";

const PostCard = ({ post, onPostDeleted, onPostUpdated, isBookmark = false, onEdit, showOptions = false }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [isLoved, setIsLoved] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loveCount, setLoveCount] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [isCommentAnon, setIsCommentAnon] = useState(false);
  const [commentFile, setCommentFile] = useState(null);
  const [commentNiveau, setCommentNiveau] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentCount, setCommentCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingCommentId, setEditingMessageId] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [replyingToComment, setReplyingToComment] = useState(null); // Pour la réponse globale
  const [activeCommentMenuId, setActiveCommentMenuId] = useState(null);
  const [showReactionSelector, setShowReactionSelector] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [editingLoading, setEditingLoading] = useState(false);
  const reactionTimeoutRef = useRef(null);
  const commentInputRef = useRef(null); // Ref pour l'input principal

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
  
  // Utiliser user du contexte si localStorage est vide ou incomplet
  const effectiveUser = user || currentUser;
  const currentUserId = effectiveUser?.iduser || effectiveUser?.id;

  const isAuthor = effectiveUser && post && (
    String(currentUserId) === String(post.iduser) ||
    (post.auteur && String(currentUserId) === String(post.auteur.iduser)) ||
    (post.auteur && String(currentUserId) === String(post.auteur.id))
  );

  const handleProfileClick = (e, targetUser, isAnon, isMe) => {
    e.stopPropagation();
    // Si c'est anonyme et ce n'est pas moi, pas de redirection
    if (isAnon && !isMe) return;
    
    if (isMe) {
      navigate('/profile');
    } else {
      const targetId = targetUser?.iduser || targetUser?.id;
      if (targetId) navigate(`/profile/${targetId}`);
    }
  };

  const loadPostData = async () => {
    if (!post?.idpost) return;
    try {
      const [reactions, myStatus, postComments] = await Promise.all([
        getReactionCounts(post.idpost),
        getMyReactions(post.idpost),
        getCommentsByPost(post.idpost)
      ]);
      
      setLikeCount(reactions?.likes || reactions?.LIKE || 0);
      setLoveCount(reactions?.loves || reactions?.LOVE || 0);
      setIsLiked(myStatus?.hasLike || myStatus?.typeReaction === 'LIKE');
      setIsLoved(myStatus?.hasLove || myStatus?.typeReaction === 'LOVE');
      
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

      // Tri par date (plus récent en premier)
      loadedComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

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
      if (replyingToComment) formData.append('idparent', replyingToComment.idcomment);
      
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
      setReplyingToComment(null); // Reset reply state
      setShowComments(true);
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi:', error);
      const errorMsg = error.response?.data?.message || 'Erreur lors de l\'envoi du commentaire';
      alert(`Erreur: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  // Gestion du survol pour les réactions avec délai (pour éviter la fermeture immédiate)
  const handleReactionMouseEnter = () => {
    if (reactionTimeoutRef.current) clearTimeout(reactionTimeoutRef.current);
    setShowReactionSelector(true);
  };

  const handleReactionMouseLeave = () => {
    reactionTimeoutRef.current = setTimeout(() => {
      setShowReactionSelector(false);
    }, 300); // 300ms de délai pour laisser le temps d'aller sur le menu
  };

  const handleReaction = async (type) => {
    try {
      // Optimistic update
      const wasLiked = isLiked;
      const wasLoved = isLoved;

      // Reset local state first
      setIsLiked(false);
      setIsLoved(false);
      
      // Adjust counts based on previous state
      if (wasLiked) setLikeCount(c => Math.max(0, c - 1));
      if (wasLoved) setLoveCount(c => Math.max(0, c - 1));

      // Apply new state if it's not a toggle off (clicking the same reaction again)
      // Note: If clicking "Like" button when already Liked, we toggle off. 
      // If selecting from menu, we always set.
      if ((type === 'LIKE' && !wasLiked) || (type === 'LOVE' && !wasLoved)) {
        if (type === 'LIKE') { setIsLiked(true); setLikeCount(c => c + 1); }
        if (type === 'LOVE') { setIsLoved(true); setLoveCount(c => c + 1); }
      }

      await toggleReaction(post.idpost, type);
      
      // 🔔 Notification (si ce n'est pas moi et que c'est une réaction positive)
      if (!isAuthor && ((type === 'LIKE' && !isLiked) || (type === 'LOVE' && !isLoved))) {
        try {
          await notificationAPI.notifyLike(post.idpost, type);
        } catch (err) {
          console.error("Failed to send reaction notification", err);
        }
      }

    } catch (error) {
      console.error("Erreur reaction:", error);
      loadPostData(); // Revert on error
    }
    setShowReactionSelector(false);
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
      console.error('Download error:', error);
      alert('Error downloading file');
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
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await deletePost(post.idpost);
      if (onPostDeleted) onPostDeleted();
    } catch (error) {
      console.error("Error deleting post:", error);
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleCommentAction = async (action, commentId, data = null) => {
    console.log(`Action: ${action}, Comment ID: ${commentId}, Data:`, data);
    try {
      if (action === 'delete') {
        setCommentToDelete(commentId);
      } else if (action === 'edit') {
         setEditingLoading(true);
        await updateComment(commentId, { contenu: data, idpost: post.idpost });
        setEditingMessageId(null);
        setEditCommentText("");
        await loadPostData();
      } else if (action === 'like') {
        await toggleCommentReaction(commentId, 'LIKE');
        loadPostData();
      }
    } catch (error) {
      console.error(`Error ${action} comment:`, error);
    
    } finally {
      if (action === 'edit') setEditingLoading(false);
    }
  };

  const confirmDeleteComment = async () => {
    if (!commentToDelete) return;
    try {
      await deleteComment(commentToDelete);
      loadPostData();
    } catch (error) {
      console.error("Error deleting comment:", error);
    } finally {
      setCommentToDelete(null);
    }
  };

  const startEditComment = (comment) => {
    setEditingMessageId(comment.idcomment);
    setEditCommentText(comment.contenu);
    setReplyingToComment(null);
  };

  const startReplyComment = (commentId) => {
    const comment = comments.find(c => c.idcomment === commentId);
    setReplyingToComment(comment);
    // Focus sur l'input principal
    if (commentInputRef.current) {
      commentInputRef.current.focus();
    }
  };

  const cancelCommentAction = () => {
    setEditingMessageId(null);
    setEditCommentText("");
  };

  const postDoc = post.documents?.[0] || post.document || null;

  // Gestion de l'avatar auteur
  const authorAvatarUrl = getProfileImage(post.auteur);

  // Fonction pour formater la date (ex: 12h, 1 j, 1 mois)
  const formatTimeAgo = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Just now";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays}d`;
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `${diffInMonths}mo`;
    return `${Math.floor(diffInDays / 365)}y`;
  };

  // Format date compact pour les commentaires (comme demandé)
  const formatCommentDate = (dateString) => {
    if (!dateString) return "";
    return formatTimeAgo(dateString);
  };

  // Fonction récursive pour afficher les commentaires et leurs réponses
  const renderCommentItem = (c) => {
    if (!c) return null;
    const cAnon = c.isAnonymat === true || c.isAnonymat === 'true' || c.isAnonymat === 1;
    
    // Logique d'auteur (identique à avant)
    const candidates = [c.auteur, c.author, c.Author, c.user, c.User, c.sender, c.student, c.Student, c.utilisateur, c.account];
    let commentAuthor = candidates.find(cand => cand && typeof cand === 'object' && !Array.isArray(cand));
    if (!commentAuthor) commentAuthor = c;
    
    const authorId = commentAuthor.iduser || commentAuthor.id || commentAuthor.userId || c.iduser;
    if (effectiveUser && authorId && String(authorId) === String(effectiveUser.iduser || effectiveUser.id)) {
        commentAuthor = { ...commentAuthor, ...effectiveUser };
    } else if (post.auteur && authorId && String(authorId) === String(post.auteur.iduser || post.auteur.id)) {
        commentAuthor = { ...commentAuthor, ...post.auteur };
    }
    
    const userNom = commentAuthor?.nom || commentAuthor?.Nom || commentAuthor?.lastName || "";
    const userPrenom = commentAuthor?.prenom || commentAuthor?.Prenom || commentAuthor?.firstName || "";
    const fullName = `${userPrenom} ${userNom}`.trim();
    const avatarUrl = getProfileImage({ ...commentAuthor, iduser: authorId });
    const displayName = cAnon ? "Anonymous" : (fullName || commentAuthor?.username || "User");
    
    const isCommentOwner = effectiveUser && (
      String(c.iduser) === String(effectiveUser.iduser || effectiveUser.id) ||
      (c.auteur && String(c.auteur.iduser) === String(effectiveUser.iduser || effectiveUser.id))
    );

    const isEditing = editingCommentId === c.idcomment;
    const commentDoc = c.documents?.[0] || c.document;

    const isImage = commentDoc && (commentDoc.type === 'IMAGE' || commentDoc.url?.match(/\.(jpg|jpeg|png|gif|webp)$/i));

    // Trouver les réponses à ce commentaire
    const replies = comments.filter(reply => reply.idparent === c.idcomment);

    return (
      <div key={c.idcomment} className="comment-tree-item">
        <div className={`comment-item-row ${cAnon ? 'anonymous' : ''}`}>
          <div className="comment-avatar-small" style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
            {!cAnon && avatarUrl ? (
              <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => {e.target.style.display='none'; e.target.nextSibling.style.display='flex'}} />
            ) : null}
            <div style={{ display: (!cAnon && avatarUrl) ? 'none' : 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', background: '#e5e7eb' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
          </div>
          <div className="comment-content-wrapper">
            <div className="comment-header-line">
              <span 
                className="comment-author-name"
                onClick={(e) => handleProfileClick(e, commentAuthor, cAnon, isCommentOwner)}
                style={{ cursor: (cAnon && !isCommentOwner) ? 'default' : 'pointer' }}
              >
                {displayName}
              </span>
              <div className="comment-header-right">
                <span className="comment-date">{formatCommentDate(c.createdAt || c.dateCreation)}</span>
                {isCommentOwner && (
                  <div className="comment-menu-container">
                    <button className="comment-menu-btn" onClick={(e) => { e.stopPropagation(); setActiveCommentMenuId(activeCommentMenuId === c.idcomment ? null : c.idcomment); }}>
                      <MoreHorizontal size={16} />
                    </button>
                    {activeCommentMenuId === c.idcomment && (
                      <div className="comment-menu-dropdown">
                        <button className="comment-menu-item" onClick={() => { startEditComment(c); setActiveCommentMenuId(null); }}><Edit2 size={14} /> Edit</button>
                        <button className="comment-menu-item delete" onClick={() => { handleCommentAction('delete', c.idcomment); setActiveCommentMenuId(null); }}><Trash2 size={14} /> Delete</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {isEditing ? (
              <div className="edit-comment-box">
                <input 
                  type="text" 
                  value={editCommentText} 
                  onChange={(e) => setEditCommentText(e.target.value)}
                  className="edit-comment-input"
                  autoFocus
                />
                <div className="edit-comment-actions">
                 <button 
                    type="button"
                    onClick={(e) => { 
                      e.preventDefault(); 
                      e.stopPropagation(); 
                      handleCommentAction('edit', c.idcomment, editCommentText); 
                    }} 
                    className="save-btn-small"
                    disabled={editingLoading}
                  >
                    {editingLoading ? 'Saving...' : 'Save'}
                  </button>
                  <button onClick={cancelCommentAction} className="cancel-btn-small" disabled={editingLoading}>Cancel</button>
                </div>
              </div>
            ) : (
              <p className="comment-text">{c.contenu}</p>
            )}
            
            {commentDoc && (
              <div className="comment-document">
                {isImage ? (
                  <div className="comment-image-container">
                    <img src={commentDoc.url} alt={commentDoc.filename} className="comment-image" />
                    <button onClick={() => handleDownload(commentDoc)} className="download-btn-small image-download-btn-small" title="Download image">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    </button>
                  </div>
                ) : (
                  <div className="comment-file-wrapper">
                    <a href={commentDoc.url} target="_blank" rel="noopener noreferrer" className="comment-file-link">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
                      <span className="file-name-link">{commentDoc.filename}</span>
                    </a>
                    <button onClick={() => handleDownload(commentDoc)} className="download-btn-small" title="Download">
                      <Download size={16} />
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="comment-actions">
              <button className={`comment-action-btn like-btn ${c.isLiked ? 'active' : ''}`} onClick={() => handleCommentAction('like', c.idcomment)}>
                Like {c.likes > 0 && `(${c.likes})`}
              </button>
              <button className="comment-action-btn" onClick={() => startReplyComment(c.idcomment)}>
                Reply
              </button>
            </div>
          </div>
        </div>
        
        {/* Rendu récursif des réponses */}
        {replies.length > 0 && (
          <div className="comment-replies">
            {replies.map(reply => renderCommentItem(reply))}
          </div>
        )}
      </div>
    );
  };

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
            <h3 
              className="author-name"
              onClick={(e) => handleProfileClick(e, post.auteur, isPostAnon, isAuthor)}
              style={{ cursor: (isPostAnon && !isAuthor) ? 'default' : 'pointer' }}
            >
              {isAuthor ? "Me" : (isPostAnon ? "Student" : `${post.auteur?.nom || ''} ${post.auteur?.prenom || ''}`)}
            </h3>
            <div style={{ fontSize: '13px', color: '#6b7280' }}>
              {!isAuthor && !isPostAnon && (
                <span className="author-role">{post.auteur?.niveau}</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="post-header-right">
          <span className="post-date">{formatTimeAgo(post.createdAt || post.dateCreation)}</span>
          
          {showOptions && isAuthor && (
            <div className="post-menu" ref={menuRef}>
              <button 
                className="menu-btn" 
                onClick={() => setShowMenu(!showMenu)}
                title="Options"
              >
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
      </div>

      <div className="post-content">
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
                  title="Download image"
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
                    title="Download"
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

        <p className="post-text">{post.contenu}</p>
      </div>

      {/* SECTION STATS & ACTIONS (LinkedIn Style) */}
      <div className="post-stats">
        {/* 1. Affichage des compteurs (si > 0) */}
        {(likeCount > 0 || loveCount > 0) && (
          <div className="reaction-summary">
            <div className="reaction-icons-stack">
              {likeCount > 0 && <div className="reaction-icon-bubble like"><ThumbsUp size={10} fill="white" color="white" /></div>}
              {loveCount > 0 && <div className="reaction-icon-bubble love"><Heart size={10} fill="white" color="white" /></div>}
            </div>
            <span className="reaction-count-text">{likeCount + loveCount}</span>
          </div>
        )}

        <div className="post-actions-bar">
          {/* Bouton Like avec survol */}
          <div 
            className="reaction-button-wrapper"
            onMouseEnter={handleReactionMouseEnter}
            onMouseLeave={handleReactionMouseLeave}
          >
            {showReactionSelector && (
              <div className="reaction-selector">
                <button onClick={() => handleReaction('LIKE')} className="reaction-option" title="Like">
                  <div className="reaction-icon-bubble like large"><ThumbsUp size={20} fill="white" color="white"/></div>
                </button>
                <button onClick={() => handleReaction('LOVE')} className="reaction-option" title="Love">
                  <div className="reaction-icon-bubble love large"><Heart size={20} fill="white" color="white"/></div>
                </button>
              </div>
            )}
            
            <button 
              className={`action-btn ${isLiked ? 'liked' : isLoved ? 'loved' : ''}`} 
              onClick={() => handleReaction(isLiked ? 'LIKE' : isLoved ? 'LOVE' : 'LIKE')}
            >
              {isLoved ? <Heart size={20} fill="#e11d48" color="#e11d48" /> : <ThumbsUp size={20} fill={isLiked ? "#0040D0" : "none"} color={isLiked ? "#0040D0" : "currentColor"} />}
              <span>{isLoved ? 'Love' : 'Like'}</span>
            </button>
          </div>

          <button 
            className="action-btn" 
            onClick={() => setShowComments(!showComments)}
            style={{ color: commentCount > 0 ? '#25D366' : undefined }}
          >
            <MessageSquare size={20} />
            <span>Comment ({commentCount})</span>
          </button>

          <button 
            className={`action-btn ${isBookmarked ? 'bookmarked' : ''}`} 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleBookmark();
            }}
          >
            <Bookmark size={20} fill={isBookmarked ? "#E7A33E" : "none"} color={isBookmarked ? "#E7A33E" : "currentColor"} />
            <span>{isBookmarked ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>

      <div className="comment-section">
        <div className="comment-form-container">
          {replyingToComment && (
            <div className="replying-indicator">
              <span>Replying to <strong>{replyingToComment.auteur?.prenom || "User"}</strong></span>
              <button onClick={() => setReplyingToComment(null)} className="cancel-reply-indicator">
                <X size={14} />
              </button>
            </div>
          )}
          <div className="comment-input-wrapper">
            <div className="current-user-avatar-small">
               {getProfileImage(effectiveUser) ? (
                 <img src={getProfileImage(effectiveUser)} alt="" />
               ) : (
                 <DefaultAvatar />
               )}
            </div>
            <input
              ref={commentInputRef}
              type="text"
              placeholder={replyingToComment ? "Write a reply..." : "Add a comment..."}
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
            <label className="comment-icon-btn attach-label">
              <input 
                type="file" 
                onChange={(e) => setCommentFile(e.target.files[0])} 
                style={{display: 'none'}}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png"
              />
              <Paperclip size={20} color="#6b7280" />
            </label>
            <button 
              type="button" 
              onClick={() => setIsCommentAnon(!isCommentAnon)}
              className={`comment-icon-btn anon-toggle ${isCommentAnon ? 'active' : ''}`}
              title={isCommentAnon ? "Disable anonymous" : "Comment anonymously"}
            >
              {isCommentAnon ? 
                <EyeOff size={20} color="#0040D0" /> : 
                <Eye size={20} color="#6b7280" />
              }
            </button>
            <button 
              type="button" 
              onClick={handleCommentSubmit}
              className="comment-submit-icon-btn" 
              disabled={(!commentText.trim() && !commentFile) || loading}
            >
              {loading ? (
                <div className="spinner" style={{width: '20px', height: '20px', border: '2px solid #0040D0', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite'}}></div>
              ) : (
                <Send size={20} color={(!commentText.trim() && !commentFile) ? "#9ca3af" : "#0040D0"} />
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
            {comments
              .filter(c => !c.idparent) // Seulement les commentaires racines
              .map(c => renderCommentItem(c))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="delete-modal-overlay">
          <div className="delete-modal-content">
            <h3>Delete Post?</h3>
            <p>Are you sure you want to delete this post? This action cannot be undone.</p>
            <div className="delete-modal-actions">
              <button className="cancel-btn" onClick={() => setShowDeleteModal(false)} style={{background: 'none', border: '1px solid #ddd', color: '#111b21'}}>Cancel</button>
              <button className="confirm-btn" onClick={confirmDelete} style={{background: '#ea0038', border: 'none', color: 'white'}}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Comment Confirmation Modal */}
      {commentToDelete && (
        <div className="delete-modal-overlay">
          <div className="delete-modal-content">
            <h3>Delete Comment?</h3>
            <p>Are you sure you want to delete this comment?</p>
            <div className="delete-modal-actions">
              <button className="cancel-btn" onClick={() => setCommentToDelete(null)} style={{background: 'none', border: '1px solid #ddd', color: '#111b21'}}>Cancel</button>
              <button className="confirm-btn" onClick={confirmDeleteComment} style={{background: '#ea0038', border: 'none', color: 'white'}}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
