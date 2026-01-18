import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, Trash2, ArrowLeft, Users, Pencil, CheckCircle, User, X } from 'lucide-react';
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
  const prevMessagesLength = useRef(0);
  // Nouveaux états pour Typing et Online
  const [typingUsers, setTypingUsers] = useState([]);
  const [isOnline, setIsOnline] = useState(false);
  const typingTimeoutRef = useRef(null);
  const otherUserIdRef = useRef(null);

  const { user } = useAuth();
  const currentUserId = user?.iduser || user?.id;
  const { socket } = useSocket();

  useEffect(() => {
    fetchData();
    // Mise à jour de la ref pour l'utilisateur distant (pour éviter re-render socket)
    if (conversation?.otherUser?.iduser) {
      otherUserIdRef.current = conversation.otherUser.iduser;
      // Demander le statut en ligne si le backend le supporte
      if (socket) socket.emit('check_online', conversation.otherUser.iduser);
      // Signaler au serveur que JE suis connecté (pour que l'autre me voie en ligne)
      if (socket) socket.emit('user_connected', currentUserId);
    }
  }, [id, conversation, socket]);

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
        }
      };

      const handleUserOffline = (userId) => {
        if (otherUserIdRef.current && String(otherUserIdRef.current) === String(userId)) {
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
      };
    }
  }, [id, socket]); // On retire 'conversation' des dépendances pour éviter les re-joins

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      const hasNewMessages = messages.length > prevMessagesLength.current;

      if (isFirstLoad && messages.length > 0) {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
        setIsFirstLoad(false);
      } else if (hasNewMessages) {
        const { scrollHeight, scrollTop, clientHeight } = container;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
        const lastMessage = messages[messages.length - 1];
        const isOwnMessage = lastMessage && String(lastMessage.senderId) === String(currentUserId);

        if (isOwnMessage || isNearBottom) {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
      }
      prevMessagesLength.current = messages.length;
    }
  }, [messages, isFirstLoad]);

  const fetchData = async () => {
    try {
      const conv = await conversationAPI.getConversation(id);
      setConversation(conv);
      const msgs = await conversationAPI.getMessages(id);
      setMessages(msgs);
      setLoading(false);

      // Le backend marque automatiquement comme lu lors du fetch des messages
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
        alert("Échec de l'envoi du message");
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

  const handleJoinGroup = async () => {
    setJoinLoading(true);
    setJoinError(null);
    try {
      await axios.post(`http://localhost:5000/api/conversations/${id}/join`, {}, { withCredentials: true });
      setError(null);
      fetchData();
    } catch (err) {
      console.error("Erreur join group", err);
      let serverMessage = "Impossible de rejoindre ce groupe. Il est peut-être privé ou supprimé.";
      
      if (err.response) {
        const data = err.response.data;
        const status = err.response.status;

        if (status === 500) {
           serverMessage = "Erreur serveur (500). Vérifiez les migrations (npm run migrate) et les logs backend.";
        } else if (status === 404) {
           serverMessage = "Route ou ressource introuvable (404).";
        } else if (data) {
           if (typeof data === 'string') {
             serverMessage = `Erreur (${status}): ${data.substring(0, 100)}`;
           } else {
             serverMessage = data.message || data.error || JSON.stringify(data);
           }
        } else {
           serverMessage = `Erreur ${status}: ${err.response.statusText}`;
        }
      } else if (err.request) {
         serverMessage = "Erreur de connexion au serveur. Le backend est-il lancé ?";
      } else {
         serverMessage = err.message;
      }
      setJoinError(serverMessage);
    } finally {
      setJoinLoading(false);
    }
  };

  if (loading) return <div className="conv-loading">Chargement...</div>;
  if (error) {
    return (
      <div className="conv-empty" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '15px', padding: '20px' }}>
        <div style={{ color: '#111b21', fontSize: '18px', fontWeight: '500' }}>Rejoindre ce groupe ?</div>
        <p style={{ color: '#6b7280', textAlign: 'center' }}>Vous devez être membre pour voir les messages de ce groupe.</p>
        
        {joinError && (
          <div style={{
            color: '#b91c1c',
            background: '#fee2e2',
            padding: '12px 16px',
            borderRadius: '8px',
            width: '100%',
            maxWidth: '400px',
            textAlign: 'center',
            border: '1px solid #fecaca',
            fontSize: '14px'
          }}>
            <strong>Erreur :</strong> {joinError}
          </div>
        )}

        <button 
          onClick={handleJoinGroup}
          disabled={joinLoading}
          style={{
            background: '#7c3aed',
            color: 'white',
            border: 'none',
            padding: '10px 24px',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: joinLoading ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 6px rgba(124, 58, 237, 0.2)',
            opacity: joinLoading ? 0.7 : 1,
            minWidth: '180px'
          }}
        >
          {joinLoading ? 'Tentative...' : 'Rejoindre le groupe'}
        </button>
        <button 
          onClick={() => navigate('/groups')}
          style={{
            background: 'transparent',
            color: '#6b7280',
            border: '1px solid #d1d5db',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          Retour aux groupes
        </button>
      </div>
    );
  }
  if (!conversation) return <div className="conv-empty">Conversation introuvable</div>;

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
      <div className="message-content" style={{ wordWrap: 'break-word' }}>
        {parts.map((part, index) => {
          if (urlRegex.test(part)) {
             return (
                <a 
                    key={index} 
                    href={part} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={{ color: '#027eb5', textDecoration: 'underline', cursor: 'pointer' }}
                    onClick={(e) => {
                        if (part.startsWith(window.location.origin)) {
                            e.preventDefault();
                            const path = part.replace(window.location.origin, '');
                            navigate(path);
                        }
                    }}
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

    if (date.toDateString() === today.toDateString()) return "Aujourd'hui";
    if (date.toDateString() === yesterday.toDateString()) return "Hier";
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div style={{ display: 'flex', height: '100vh', maxHeight: '100dvh', width: '100%', overflow: 'hidden' }}>
      
      {/* Sidebar (Liste des conversations - optionnel si vous voulez l'afficher ici, sinon juste le contenu) */}
      {/* Pour l'instant on garde juste la vue conversation */}

      {/* Main Chat Area */}
      <div className="conv-view" style={{ background: '#efeae2', flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', maxHeight: 'none' }}>
      {/* Header WhatsApp Style */}
      <div 
        className="conv-header" 
        style={{ padding: '10px 16px', background: '#f0f2f5', display: 'flex', alignItems: 'center', borderBottom: '1px solid #d1d7db', boxShadow: 'none', cursor: 'pointer', zIndex: 10 }}
        onClick={() => setShowGroupInfo(true)}
      >
        <button onClick={() => navigate(-1)} style={{ marginRight: '10px', background: 'none', border: 'none', cursor: 'pointer' }}>
          <ArrowLeft size={24} color="#54656f" />
        </button>
        
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px', overflow: 'hidden', color: '#6b7280' }}>
          {headerImage ? (
            <img src={headerImage} alt="Icon" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            isGroup ? <Users size={20} /> : <User size={20} />
          )}
        </div>

        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '16px', margin: 0, color: '#111b21', fontWeight: '500' }}>{getConvName()}</h2>
          {isGroup && (
            <p style={{ fontSize: '13px', margin: 0, color: '#667781', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
              {typingUsers.length > 0 
                ? <span style={{color: '#00a884', fontWeight: 'bold'}}>{typingUsers.map(u => u.name).join(', ')} is typing...</span>
                : (conversation.members ? conversation.members.filter(m => !m.leftAt).map(m => m.prenom).join(', ') : conversation.description)
              }
            </p>
          )}
          {!isGroup && (
             <p style={{ fontSize: '13px', margin: 0, color: '#667781' }}>
                {typingUsers.length > 0 
                    ? <span style={{color: '#00a884', fontWeight: 'bold'}}>typing...</span>
                    : (isOnline ? <span style={{color: '#00a884'}}>En ligne</span> : (conversation.otherUser?.niveau || "Student"))
                }
             </p>
          )}
        </div>
      </div>

       <div className="conv-messages" ref={messagesContainerRef} style={{ flex: 1, padding: '20px', overflowY: 'auto', background: '#efeae2', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {messages.map((msg, index) => {
          const isOwn = String(msg.senderId) === String(currentUserId);
          const currentDate = new Date(msg.sentAt || msg.createdAt).toDateString();
          const prevDate = index > 0 ? new Date(messages[index - 1].sentAt || messages[index - 1].createdAt).toDateString() : null;
          const showDate = currentDate !== prevDate;

          return (
            <React.Fragment key={msg.id || msg.idmessage || index}>
            {showDate && (
              <div style={{ textAlign: 'center', margin: '15px 0', position: 'relative', display: 'flex', justifyContent: 'center' }}>
                <span style={{ background: '#ffffff', color: '#54656f', padding: '5px 12px', borderRadius: '8px', fontSize: '12.5px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', fontWeight: '500' }}>
                  {formatDateLabel(msg.sentAt || msg.createdAt)}
                </span>
              </div>
            )}
            <div 
              className={`message ${isOwn ? 'message-own' : ''}`}
              style={{
                  alignSelf: isOwn ? 'flex-end' : 'flex-start',
                  maxWidth: '65%',
                  marginBottom: '10px',
                  background: isOwn ? '#d9fdd3' : '#ffffff',
                  color: '#111b21',
                  borderRadius: '7.5px',
                  padding: '6px 7px 8px 9px',
                  boxShadow: '0 1px 0.5px rgba(0,0,0,0.13)',
                  fontSize: '14.2px',
                  lineHeight: '19px',
                  position: 'relative',
                  opacity: msg.isTemp ? 0.7 : 1, // Feedback visuel pour l'envoi
              }}
            >
              {isGroup && !isOwn && (
                  <div className="message-sender" style={{ fontSize: '12.8px', color: '#e542a3', fontWeight: '500', marginBottom: '4px' }}>
                      {msg.senderName || (msg.sender ? `${msg.sender.prenom} ${msg.sender.nom}` : 'Unknown')}
                  </div>
              )}
              {isImageMessage(msg.content) ? (
                  <img src={msg.content} alt="Sent media" style={{ maxWidth: '100%', borderRadius: '6px', marginTop: '2px', cursor: 'pointer' }} onClick={() => window.open(msg.content, '_blank')} />
              ) : (
                  renderMessageContent(msg.content)
              )}
              <div style={{ fontSize: '11px', color: '#667781', textAlign: 'right', marginTop: '4px', marginLeft: '8px', display: 'inline-block', float: 'right', verticalAlign: 'bottom' }}>
                  {new Date(msg.sentAt || msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              {isOwn && !isImageMessage(msg.content) && (
                  <div className="message-actions" style={{ position: 'absolute', top: '-25px', right: '0', display: 'none', gap: '4px', background: 'white', borderRadius: '20px', padding: '4px 8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', border: '1px solid #eee' }}>
                      <button onClick={() => handleEditMessage(msg)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px', color: '#6b7280' }} title="Edit"><Pencil size={12} /></button>
                      <button onClick={() => handleDeleteMessage(msg.id || msg.idmessage)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px', color: '#ef4444' }} title="Delete"><Trash2 size={12} /></button>
                  </div>
              )}
              <style>{`.message:hover .message-actions { display: flex !important; animation: fadeIn 0.2s; }`}</style>
            </div>
            </React.Fragment>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form className="message-composer" onSubmit={handleSendMessage} style={{ background: '#f0f2f5', padding: '5px 16px', display: 'flex', alignItems: 'center', gap: '10px', borderTop: '1px solid #d1d7db', flexShrink: 0 }}>
        <input 
          className="composer-input" 
          value={newMessage} 
          onChange={handleTypingInput} 
          placeholder={editingMessageId ? "Edit your message..." : "Type a message..."}
          style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: editingMessageId ? '2px solid #00a884' : 'none', outline: 'none', fontSize: '15px', background: 'white', color: '#111b21' }}
        />
        {editingMessageId && (
          <button type="button" onClick={() => { setEditingMessageId(null); setNewMessage(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
            <X size={24} />
          </button>
        )}
        <button type="submit" className="composer-send" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#54656f', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {editingMessageId ? <CheckCircle size={24} color="#00a884" /> : <Send size={24} />}
        </button>
      </form>

      </div>

      {/* Delete Message Confirmation Modal */}
      {showDeleteModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', width: '90%', maxWidth: '350px', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#111b21' }}>Delete message?</h3>
            <p style={{ color: '#667781', marginBottom: '20px', fontSize: '14px' }}>Are you sure you want to delete this message?</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowDeleteModal(false)} style={{ background: 'none', border: '1px solid #ddd', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', color: '#111b21', fontWeight: '500' }}>Cancel</button>
              <button onClick={confirmDeleteMessage} style={{ background: '#ea0038', border: 'none', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', color: 'white', fontWeight: '500' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

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
  );
};

export default ConversationPage;