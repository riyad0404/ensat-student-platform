import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, Trash2, ArrowLeft, Users, Pencil, CheckCircle, User, X, Check, Copy, CheckCheck } from 'lucide-react';
import conversationAPI from '../api/conversationAPI';
import '../styles/conversations.css';
import { useAuth } from '../contexts/AuthContext';
import ConversationSidebar from '../components/conversations/ConversationSidebar';
import axios from 'axios';
import { useSocket } from '../contexts/SocketContext';

const ConversationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [showCopyNotification, setShowCopyNotification] = useState(false);
  const prevMessagesLength = useRef(0);
  // Nouveaux états pour Typing et Online
  const [typingUsers, setTypingUsers] = useState([]);
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState(null);
  const typingTimeoutRef = useRef(null);
  const otherUserIdRef = useRef(null);
  const isOnlineRef = useRef(isOnline);

  const { user } = useAuth();
  const currentUserId = user?.iduser || user?.id;
  const { socket } = useSocket();

  useEffect(() => {
    // Réinitialiser les états lors du changement de conversation pour éviter les conflits (ex: bouton Cancel)
    setError(null);
    setJoinError(null);
    setLoading(true);
    setConversation(null);
    setMessages([]);
    fetchData();
  }, [id]);

  useEffect(() => {
    isOnlineRef.current = isOnline;
  }, [isOnline]);

  useEffect(() => {
    if (conversation?.otherUser?.iduser) {
      otherUserIdRef.current = conversation.otherUser.iduser;
      // Demander le statut en ligne si le backend le supporte
      if (socket) socket.emit('check_online', conversation.otherUser.iduser);
    }
  }, [conversation, socket]);

  useEffect(() => {
    
    // Logique Socket.io
    if (socket) {
      // Rejoindre la "salle" de cette conversation spécifique
      socket.emit('join_conversation', id);

      // Écouter les nouveaux messages
      const handleNewMessage = (newMsg) => {
        // On vérifie si le message n'est pas déjà là (pour éviter les doublons)
        setMessages((prevMessages) => {
          // Ignorer mes propres messages venant du socket (car gérés en optimiste)
          if (String(newMsg.senderId) === String(currentUserId)) return prevMessages;

          const exists = prevMessages.some(m => (m.id || m.idmessage) === (newMsg.id || newMsg.idmessage));
          if (exists) return prevMessages;
          return [...prevMessages, newMsg];
        });
      };

      // Gestion "En train d'écrire"
      const handleTyping = ({ conversationId, userId, name }) => {
        if (String(conversationId) === String(id) && String(userId) !== String(currentUserId)) {
            setTypingUsers(prev => {
                if (prev.some(u => String(u.userId) === String(userId))) return prev;
                return [...prev, { userId, name }];
            });
        }
      };

      const handleStopTyping = ({ conversationId, userId }) => {
        if (String(conversationId) === String(id)) {
            setTypingUsers(prev => prev.filter(u => String(u.userId) !== String(userId)));
        }
      };

      // Gestion "En ligne"
      const handleUserOnline = (userId) => {
        if (otherUserIdRef.current && String(otherUserIdRef.current) === String(userId)) {
            setIsOnline(true);
            setLastSeen(null);
        }
      };

      const handleUserOffline = (userId) => {
        if (otherUserIdRef.current && String(otherUserIdRef.current) === String(userId)) {
            if (isOnlineRef.current) {
                setLastSeen(new Date());
            }
            setIsOnline(false);
        }
      };

      socket.on('receive_message', handleNewMessage);
      socket.on('typing', handleTyping);
      socket.on('stop_typing', handleStopTyping);
      socket.on('user_online', handleUserOnline);
      socket.on('user_offline', handleUserOffline);

      return () => {
        socket.off('receive_message', handleNewMessage);
        socket.off('typing', handleTyping);
        socket.off('stop_typing', handleStopTyping);
        socket.off('user_online', handleUserOnline);
        socket.off('user_offline', handleUserOffline);
        socket.emit('leave_conversation', id);
        setLastSeen(null);
        setIsOnline(false);
      };
    }
  }, [id, socket]); // On retire 'conversation' des dépendances pour éviter les re-joins

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      const hasNewMessages = messages.length > prevMessagesLength.current;

      if (isFirstLoad && messages.length > 0) {
        container.scrollTop = container.scrollHeight;
        setIsFirstLoad(false);
      } else if (hasNewMessages) {
        const { scrollHeight, scrollTop, clientHeight } = container;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
        const lastMessage = messages[messages.length - 1];
        const isOwnMessage = lastMessage && String(lastMessage.senderId) === String(currentUserId);

        if (isOwnMessage || isNearBottom) {
          container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
        }
      }
      prevMessagesLength.current = messages.length;
    }
  }, [messages, isFirstLoad]);

  // ✅ CORRECTION NOTIFICATION : Marquer comme lu de manière robuste (Backend + LocalStorage)
  useEffect(() => {
    const markAsRead = () => {
      if (id) {
        axios.post(`http://localhost:5000/api/conversations/${id}/read`, {}, { withCredentials: true }).catch(() => {});
        localStorage.setItem(`lastRead_${id}`, new Date().toISOString());
      }
    };

    if (messages.length > 0 && (document.hasFocus() || isFirstLoad)) {
      markAsRead();
    }

    const handleFocus = () => {
      if (messages.length > 0) markAsRead();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [id, messages, isFirstLoad]);

  const fetchData = async () => {
    try {
      const conv = await conversationAPI.getConversation(id);
      setConversation(conv);
      const msgs = await conversationAPI.getMessages(id);
      setMessages(msgs);
      setLoading(false);
    } catch (error) {
      console.error("Erreur chargement", error);
      setError("Impossible de charger la conversation.");
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // Arrêter l'indicateur de frappe immédiatement
    if (socket) {
        socket.emit('stop_typing', { conversationId: id, userId: currentUserId });
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
    }

    if (editingMessageId) {
      try {
        await conversationAPI.editMessage(id, editingMessageId, newMessage);
        setMessages(messages.map(m => (m.id === editingMessageId || m.idmessage === editingMessageId) ? { ...m, content: newMessage } : m));
        setEditingMessageId(null);
        setNewMessage('');
      } catch (error) {
        console.error("Erreur modification", error);
        alert("Failed to edit message");
      }
    } else {
      // 🚀 ENVOI OPTIMISTE (Affichage immédiat)
      const tempId = Date.now();
      const tempMsg = {
          id: tempId,
          content: newMessage,
          senderId: currentUserId,
          createdAt: new Date().toISOString(),
          sentAt: new Date().toISOString(),
          isTemp: true // Marqueur pour le style (opacité)
      };

      setMessages(prev => [...prev, tempMsg]);
      setNewMessage('');

      try {
        const msg = await conversationAPI.sendMessage(id, newMessage);
        // Remplacer le message temporaire par le vrai message confirmé par le serveur
        setMessages(prev => prev.map(m => (m.id === tempId) ? msg : m));
      } catch (error) {
        console.error("Erreur envoi", error);
        // En cas d'erreur, on retire le message temporaire et on alerte
        setMessages(prev => prev.filter(m => m.id !== tempId));
        alert("Failed to send message");
      }
    }
  };

  // Gestion de la saisie avec indicateur de frappe
  const handleTypingInput = (e) => {
    const val = e.target.value;
    setNewMessage(val);

    if (socket && val.trim().length > 0) {
        // Émettre 'typing' seulement si on ne l'a pas fait récemment
        if (!typingTimeoutRef.current) {
            socket.emit('typing', { conversationId: id, userId: currentUserId, name: user.prenom || user.nom });
        }
        
        // Debounce pour arrêter de taper
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('stop_typing', { conversationId: id, userId: currentUserId });
            typingTimeoutRef.current = null;
        }, 3000);
    }
  };

  const handleEditMessage = (msg) => {
    setNewMessage(msg.content);
    setEditingMessageId(msg.id || msg.idmessage);
  };

  const handleDeleteMessage = (messageId) => {
    setMessageToDelete(messageId);
    setShowDeleteModal(true);
  };

  const confirmDeleteMessage = async () => {
    if (!messageToDelete) return;
    try {
      await conversationAPI.deleteMessage(id, messageToDelete);
      setMessages(messages.filter(m => (m.id || m.idmessage) !== messageToDelete));
    } catch (error) {
      console.error("Delete error", error);
      alert("Failed to delete message");
    } finally {
      setShowDeleteModal(false);
      setMessageToDelete(null);
    }
  };

  const copyMessage = (text) => {
    navigator.clipboard.writeText(text);
    setShowCopyNotification(true);
    setTimeout(() => setShowCopyNotification(false), 2000);
  };

  const handleJoinGroup = async () => {
    setJoinLoading(true);
    setJoinError(null);
    try {
      await axios.post(`http://localhost:5000/api/conversations/${id}/join`, {}, { withCredentials: true });
      setError(null);
      fetchData();
    } catch (err) {
      console.error("Erreur join group", err);
      let serverMessage = "Unable to join this group. It may be private or deleted.";
      
      if (err.response) {
        const data = err.response.data;
        const status = err.response.status;

        if (status === 500) {
           serverMessage = "Server error (500). Check migrations (npm run migrate) and backend logs.";
        } else if (status === 404) {
           serverMessage = "Route or resource not found (404).";
        } else if (data) {
           if (typeof data === 'string') {
             serverMessage = `Error (${status}): ${data.substring(0, 100)}`;
           } else {
             serverMessage = data.message || data.error || JSON.stringify(data);
           }
        } else {
           serverMessage = `Error ${status}: ${err.response.statusText}`;
        }
      } else if (err.request) {
         serverMessage = "Connection error to server. Is the backend running?";
      } else {
         serverMessage = err.message;
      }
      setJoinError(serverMessage);
    } finally {
      setJoinLoading(false);
    }
  };

  
  if (error) {
    return (
      <div className="join-group-container">
        <div className="join-group-card">
          <div className="join-group-icon">
            <Users size={24} color="white" />
          </div>
          <h2 className="join-group-title">Join this group?</h2>
          <p className="join-group-subtitle">You must be a member to see messages in this group.</p>
        
        {joinError && (
            <div className="join-group-error">
            <strong>Error:</strong> {joinError}
          </div>
        )}

        <button 
          type="button"
          onClick={handleJoinGroup}
          disabled={joinLoading}
          className="btn-create"
        >
          {joinLoading ? 'Attempting...' : 'Join group'}
        </button>
        <button 
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            navigate(-1);
          }}
          className="btn-create secondary"
        >
          Cancel
        </button>
        </div>
      </div>
    );
  }
  if (!conversation) return <div className="conv-empty">Conversation not found</div>;

  const isGroup = conversation.type === 'GROUP';
  const currentMember = conversation.members?.find(m => String(m.iduser) === String(currentUserId));
  const isOwner = currentMember?.role === 'OWNER';
  const getConvName = () => conversation.name || conversation.nom || conversation.title || conversation.sujet || "Conversation";

  const isImageMessage = (content) => {
    return content && (content.match(/\.(jpeg|jpg|gif|png|webp)$/i) || content.startsWith('data:image'));
  };

  // Helper pour récupérer l'image d'un membre (expéditeur message)
  const getSenderImage = (senderId) => {
    const member = conversation.members?.find(m => String(m.iduser) === String(senderId));
    let img = localStorage.getItem(`profile_image_${senderId}`);
    if (!img && member?.photo && (member.photo.startsWith('data:') || member.photo.startsWith('http') || member.photo.startsWith('/'))) {
        img = member.photo;
    }
    // Fallback si on a l'info dans le message lui-même (sender object)
    return img;
  };

  // Récupérer l'image de l'autre utilisateur (Direct Chat)
  const otherUser = conversation.otherUser;
  let otherUserImage = null;
  if (otherUser?.iduser) {
      otherUserImage = localStorage.getItem(`profile_image_${otherUser.iduser}`);
  }
  if (!otherUserImage && otherUser?.photo && (otherUser.photo.startsWith('data:') || otherUser.photo.startsWith('http') || otherUser.photo.startsWith('/'))) {
      otherUserImage = otherUser.photo;
  }

  // Image à afficher dans le header (Groupe ou Direct)
  const headerImage = isGroup ? (conversation.icon || conversation.photo) : otherUserImage;

  const renderMessageContent = (content) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = content.split(urlRegex);
    
    return (
      <div className="message-text">
        {parts.map((part, index) => {
          if (urlRegex.test(part)) {
             // Vérifie si le lien est interne (appartient à l'application)
             const isInternal = part.startsWith(window.location.origin);
             if (isInternal) {
               return (
                 <a 
                    key={index} 
                    href={part} 
                    onClick={(e) => { e.preventDefault(); navigate(part.replace(window.location.origin, '')); }}
                 >
                    {part}
                 </a>
               );
             }
             return (
                <a 
                    key={index} 
                    href={part} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                >
                    {part}
                </a>
             );
          }
          return part;
        })}
      </div>
    );
  };

  const formatDateLabel = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="conversation-page-container chatbot-style">
      <div className="conversation-background-pattern" />
      
      {showCopyNotification && (
        <div className="copy-notification">
          <Check size={20} />
          <span>Message copied successfully!</span>
        </div>
      )}

      <div className="conversation-main-content">
        <div className="conversation-header">
          <div className="conversation-header-content">
            <div 
              className="conversation-logo" 
              onClick={() => !isGroup && conversation.otherUser?.iduser && navigate(`/profile/${conversation.otherUser.iduser}`)}
              style={{ cursor: !isGroup && conversation.otherUser?.iduser ? 'pointer' : 'default' }}
            >
              <button onClick={() => navigate(-1)} className="conversation-header-back-btn">
                <ArrowLeft size={20} color="#6b7280" /> {/* Gris */}
              </button>
              
              <div className="conversation-header-avatar">
                {headerImage ? (
                  <img src={headerImage} alt="Icon" />
                ) : (
                  isGroup ? <Users size={20} color="#6b7280" /> : <User size={20} color="#6b7280" />
                )}
              </div>

              <div>
                <h2 className="conversation-title">{getConvName()}</h2>
                <div className="conversation-status-container">
                  <div className="conversation-status-dot" style={{backgroundColor: isOnline ? '#25D366' : '#E7A33E'}} /> {/* Vert WhatsApp si en ligne */}
                  <p className="conversation-status">
                    {typingUsers.length > 0
                      ? <span className="typing">{typingUsers.map(u => u.name).join(', ')} is typing...</span>
                      : isGroup
                        ? `${conversation.members?.filter(m => !m.leftAt).length || 0} members`
                        : isOnline
                          ? <span className="online">Online</span>
                          : (
                            <>
                              {lastSeen && `Last seen at ${lastSeen.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • `}
                              {conversation.otherUser?.niveau || "Student"}
                            </>
                          )}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="conversation-header-actions">
              <button onClick={() => setShowGroupInfo(true)}>
                <Users size={20} color="#E7A33E" /> {/* Orange */}
              </button>
            </div>
          </div>
        </div>

        <div className="messages-container" ref={messagesContainerRef}>
          <div>
            {messages.map((msg, index) => {
              const isOwn = String(msg.senderId) === String(currentUserId);
              const currentDate = new Date(msg.sentAt || msg.createdAt).toDateString();
              const prevDate = index > 0 ? new Date(messages[index - 1].sentAt || messages[index - 1].createdAt).toDateString() : null;
              const showDate = currentDate !== prevDate;
              
              // Logique améliorée pour le statut de lecture
              let isRead = false;
              if (msg.readBy && msg.readBy.length > 0) isRead = true;
              else if (conversation?.members) {
                 // Filtrer les autres membres actifs (qui n'ont pas quitté) et qui ne sont pas moi
                 const otherMembers = conversation.members.filter(m => String(m.iduser) !== String(currentUserId));
                 
                 if (otherMembers.length > 0) {
                    const msgTime = new Date(msg.sentAt || msg.createdAt).getTime();
                    // Le message est considéré comme "lu" si AU MOINS UN autre membre l'a lu (lastReadAt >= msgTime)
                    isRead = otherMembers.some(m => m.lastReadAt && new Date(m.lastReadAt).getTime() >= msgTime);
                 }
              }

              return (
                <React.Fragment key={msg.id || msg.idmessage || index}>
                {showDate && (
                  <div className="message-date-separator">
                    <span>{formatDateLabel(msg.sentAt || msg.createdAt)}</span>
                  </div>
                )}
                <div className={`message-wrapper ${isOwn ? 'user' : 'other'}`}>
                  <div>
                    <div className={`message-bubble ${isOwn ? 'user' : 'other'} ${msg.isTemp ? 'temp' : ''}`}>
                      {isGroup && !isOwn && (
                          <div 
                            className="message-sender-name"
                            onClick={(e) => {
                              e.stopPropagation();
                              if(msg.senderId) {
                                navigate(`/profile/${msg.senderId}`);
                              }
                            }}
                            style={{cursor: 'pointer'}}
                          >
                              {msg.senderName || (msg.sender ? `${msg.sender.prenom} ${msg.sender.nom}` : 'Unknown')}
                          </div>
                      )}
                      {isImageMessage(msg.content) ? (
                          <img src={msg.content} alt="Sent media" onClick={() => window.open(msg.content, '_blank')} />
                      ) : (
                          renderMessageContent(msg.content)
                      )}
                      <div className="message-footer">
                        <span className={`message-time ${isOwn ? 'user' : 'other'}`}>
                          {new Date(msg.sentAt || msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isOwn && (
                           isRead ? (
                             <CheckCheck size={16} color="#E7A33E" style={{ marginLeft: '4px' }} />
                           ) : (
                             <CheckCheck size={16} color="rgba(255, 255, 255, 0.5)" style={{ marginLeft: '4px' }} />
                           )
                        )}
                        {!isImageMessage(msg.content) && (
                          <div className="message-action-buttons">
                            <button className="message-action-btn" onClick={() => copyMessage(msg.content)} title="Copy message">
                              <Copy />
                            </button>
                            {isOwn && (
                              <>
                                <button className="message-action-btn" onClick={() => handleEditMessage(msg)} title="Edit">
                                  <Pencil />
                                </button>
                                <button className="message-action-btn delete" onClick={() => handleDeleteMessage(msg.id || msg.idmessage)} title="Delete">
                                  <Trash2 />
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
                </React.Fragment>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="input-area">
          <div className="input-content">
            <div className="input-wrapper">
              {editingMessageId && (
                <button type="button" className="cancel-edit-btn" onClick={() => { setEditingMessageId(null); setNewMessage(''); }}>
                  <X size={20} color="#6b7280" />
                </button>
              )}
              <input
                className="composer-input"
                type="text"
                value={newMessage}
                onChange={handleTypingInput}
                onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); } }}
                placeholder={editingMessageId ? "Edit your message..." : "Type a message..."}
                disabled={loading}
              />
              <button className="send-btn" onClick={handleSendMessage} disabled={!newMessage.trim() || loading}>
                {editingMessageId ? <CheckCircle size={24} /> : <Send size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={`sidebar-wrapper ${showGroupInfo ? 'show' : ''}`}>
        <ConversationSidebar
          show={showGroupInfo}
          onClose={() => setShowGroupInfo(false)}
          conversation={conversation}
          isGroup={isGroup}
          isOwner={isOwner}
          currentUserId={currentUserId}
          otherUserImage={otherUserImage}
          headerImage={headerImage}
          onConversationUpdate={fetchData}
        />
      </div>

      {/* Delete Message Modal */}
      {showDeleteModal && (
        <div className="delete-modal-overlay">
          <div className="delete-modal-content">
            <h3>Delete Message?</h3>
            <p>Are you sure you want to delete this message? This action cannot be undone.</p>
            <div className="delete-modal-actions">
              <button className="cancel-btn" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="confirm-btn" onClick={confirmDeleteMessage}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationPage;