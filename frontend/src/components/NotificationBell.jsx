import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, X } from 'lucide-react';
import notificationAPI from '../api/notificationAPI';
import conversationAPI from '../api/conversationAPI';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/notifications.css';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const { socket } = useSocket();
  const { user } = useAuth();
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // 1. Charger les notifications initiales
  useEffect(() => {
    loadNotifications();
  }, []);

  // 2. Écouter les notifications en temps réel (Socket.io)
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notif) => {
      console.log("🔔 Nouvelle notification reçue:", notif);
      setNotifications(prev => [notif, ...prev]);
    };

    socket.on('receive_notification', handleNewNotification);

    return () => {
      socket.off('receive_notification', handleNewNotification);
    };
  }, [socket]);

  // Fermer le menu si on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await notificationAPI.getAll();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erreur chargement notifications", error);
      setNotifications([]);
    }
  };

  const handleAcceptJoin = async (e, notif) => {
    e.stopPropagation();
    const meta = typeof notif.metadata === 'string' ? JSON.parse(notif.metadata) : (notif.metadata || {});
    const groupId = meta.groupId || meta.idgroup;
    const userId = notif.idSourceUser;

    if (!groupId || !userId) return;

    try {
      await conversationAPI.addMember(groupId, userId);
      setNotifications(prev => prev.map(n => 
        (n.idNotif || n.id || n.idnotification) === (notif.idNotif || notif.id || notif.idnotification)
          ? { ...n, isRead: true }
          : n
      ));
    } catch (error) {
      console.error("Error accepting join:", error);
    }
  };

  const handleDeclineJoin = async (e, notif) => {
    e.stopPropagation();
    const meta = typeof notif.metadata === 'string' ? JSON.parse(notif.metadata) : (notif.metadata || {});
    const groupId = meta.groupId || meta.idgroup;
    const userId = notif.idSourceUser;

    if (!groupId || !userId) return;

    try {
      await conversationAPI.declineJoinRequest(groupId, userId);
      setNotifications(prev => prev.map(n => 
        (n.idNotif || n.id || n.idnotification) === (notif.idNotif || notif.id || notif.idnotification)
          ? { ...n, isRead: true }
          : n
      ));
    } catch (error) {
      console.error("Error declining join:", error);
    }
  };

  const handleNotificationClick = async (notif) => {
    const notifId = notif.idNotif || notif.id || notif.idnotification;

    // Optimistic UI : Marquer comme lu
    if (!notif.isRead) {
      setNotifications(prev =>
        prev.map(n => {
          const currentId = n.idNotif || n.id || n.idnotification;
          if (currentId === notifId) {
            return { ...n, isRead: true };
          }
          return n;
        })
      );
      try {
        await notificationAPI.markAsRead(notifId);
      } catch (error) {
        console.error("Erreur synchro markAsRead", error);
      }
    }

    // Navigation intelligente basée sur les métadonnées
    if (notif.metadata) {
        const meta = typeof notif.metadata === 'string' ? JSON.parse(notif.metadata) : notif.metadata;
        
        // 1. Messages & Groupes
        if (notif.type === 'MESSAGE' && meta.conversationId) {
            navigate(`/conversations/${meta.conversationId}`);
        } 
        else if (['GROUP_INVITE', 'GROUP_ADD', 'JOIN_ACCEPTED', 'JOIN_REQUEST', 'JOIN_DECLINED'].includes(notif.type)) {
            const groupId = meta.groupId || meta.idgroup;
            if (groupId) navigate(`/conversations/${groupId}`);
        }
        // 2. Posts & Commentaires
        else if (['REACTION_PUB', 'COMMENT_PUB'].includes(notif.type)) {
            const postId = meta.postId || meta.idpost;
            if (postId) {
                // ✅ Naviguer vers le PROFIL (car c'est mon post) et scroller
                navigate('/profile', { state: { scrollToPostId: postId } });
            } else {
                navigate('/profile'); 
            }
        }
        // 3. Réponses et Réactions aux commentaires
        else if (['REPLY_COMMENT', 'REACTION_COMMENT'].includes(notif.type)) {
             const postId = meta.postId || meta.idpost;
             if (postId) {
                 // Redirection vers la page d'accueil pour voir le post dans le fil
                 navigate('/', { state: { scrollToPostId: postId } });
             }
        }
    }
    
    setShowDropdown(false);
  };

  // Traduction et formatage des messages
  const formatNotificationMessage = (notif) => {
    const meta = typeof notif.metadata === 'string' ? JSON.parse(notif.metadata) : (notif.metadata || {});
    const senderName = meta.senderName || (meta.sender ? `${meta.sender.prenom} ${meta.sender.nom}` : "Someone");
    const groupName = meta.groupName || "the group";

    switch (notif.type) {
      case 'REACTION_PUB':
        return `${senderName} reacted to your post (${meta.typeReaction || 'Like'})`;
      case 'COMMENT_PUB':
        return `${senderName} commented on your post`;
      case 'REPLY_COMMENT':
        const postAuthor = meta.postAuthorName ? ` on ${meta.postAuthorName}'s post` : "";
        const replyContent = meta.replyContent ? `: "${meta.replyContent}"` : "";
        return `${senderName} replied to your comment${postAuthor}${replyContent}`;
      case 'REACTION_COMMENT':
        return `${senderName} reacted to your comment (${meta.typeReaction || 'Like'})`;
      case 'MESSAGE':
        if (senderName === "System") {
          return notif.message;
        }
        if (meta.isGroup && meta.groupName) {
          return `New message from ${senderName} in group ${meta.groupName}`;
        }
        return `New message from ${senderName}`;
      case 'GROUP_INVITE':
        return `${senderName} invited you to a group`;
      case 'GROUP_INVITE_ACCEPTED':
        return `${senderName} accepted your group invitation`;
      case 'GROUP_INVITE_DECLINED':
        return `${senderName} declined your group invitation`;
      case 'JOIN_REQUEST':
        return `${meta.requestingUserName || senderName} wants to join ${groupName}`;
      case 'JOIN_ACCEPTED':
        return `You have been accepted into ${groupName}`;
      case 'JOIN_DECLINED':
        return `Your request to join ${groupName} was declined`;
      case 'GROUP_ADD':
        return `You have been added to ${groupName}`;
      default:
        // Fallback sur le message du backend (souvent en français) ou traduction basique
        return notif.message;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="notification-container" ref={dropdownRef}>
      <button 
        className="notification-btn" 
        onClick={() => setShowDropdown(!showDropdown)}
        title="Notifications"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
          </div>
          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="notification-empty">No notifications yet</div>
            ) : (
              notifications.map(notif => {
                const isJoinRequest = notif.type === 'JOIN_REQUEST' && !notif.isRead;
                return (
                  <div 
                    key={notif.idNotif || notif.id || notif.idnotification} 
                    className={`notification-item ${!notif.isRead ? 'unread' : ''}`}
                    onClick={() => handleNotificationClick(notif)}
                  >
                    <div className="notification-content">
                      <p>{formatNotificationMessage(notif)}</p>
                      <span className="notification-time">
                        {new Date(notif.createdAt).toLocaleDateString()} • {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                      {isJoinRequest && (
                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                          <button 
                            onClick={(e) => handleAcceptJoin(e, notif)}
                            style={{
                              padding: '4px 12px',
                              borderRadius: '4px',
                              border: 'none',
                              background: '#25D366',
                              color: 'white',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '600',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Check size={14} /> Accept
                          </button>
                          <button 
                            onClick={(e) => handleDeclineJoin(e, notif)}
                            style={{
                              padding: '4px 12px',
                              borderRadius: '4px',
                              border: '1px solid #ef4444',
                              background: 'transparent',
                              color: '#ef4444',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '600',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <X size={14} /> Refuse
                          </button>
                        </div>
                      )}
                    </div>
                    {!notif.isRead && !isJoinRequest && <div className="notification-dot"></div>}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;