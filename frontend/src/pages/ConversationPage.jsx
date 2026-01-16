import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, Trash2, ArrowLeft, Users, Pencil, CheckCircle, User, X } from 'lucide-react';
import conversationAPI from '../api/conversationAPI';
import '../styles/conversations.css';
import { useAuth } from '../contexts/AuthContext';
import ConversationSidebar from '../components/conversations/ConversationSidebar';

const ConversationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState(null);

  const { user } = useAuth();
  const currentUserId = user?.iduser || user?.id;

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchData = async () => {
    try {
      const conv = await conversationAPI.getConversation(id);
      setConversation(conv);
      const msgs = await conversationAPI.getMessages(id);
      setMessages(msgs);
      setLoading(false);

      // Marquer la conversation comme lue (mise à jour du timestamp local)
      localStorage.setItem(`lastRead_${id}`, new Date().toISOString());
    } catch (error) {
      console.error("Erreur chargement", error);
      setError("Impossible de charger la conversation.");
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

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
      try {
        const msg = await conversationAPI.sendMessage(id, newMessage);
        setMessages([...messages, msg]);
        setNewMessage('');
      } catch (error) {
        console.error("Erreur envoi", error);
      }
    }
  };

  const handleEditMessage = (msg) => {
    setNewMessage(msg.content);
    setEditingMessageId(msg.id || msg.idmessage);
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm("Delete this message?")) return;
    try {
      await conversationAPI.deleteMessage(id, messageId);
      setMessages(messages.filter(m => (m.id || m.idmessage) !== messageId));
    } catch (error) {
      console.error("Delete error", error);
      alert("Failed to delete message");
    }
  };

  const handleJoinGroup = async () => {
    setJoinLoading(true);
    setJoinError(null);
    try {
      await conversationAPI.addMember(id, currentUserId);
      setError(null);
      fetchData();
    } catch (err) {
      console.error("Erreur join group", err);
      const serverMessage = err.response?.data?.message || err.response?.data?.error || "Impossible de rejoindre ce groupe. Il est peut-être privé ou supprimé.";
      setJoinError(serverMessage);
    } finally {
      setJoinLoading(false);
    }
  };

  if (loading) return <div className="conv-loading">Chargement...</div>;
  if (error) {
    return (
      <div className="conv-empty" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '15px', padding: '20px' }}>
        <div style={{ color: '#ef4444', fontSize: '18px', fontWeight: '500' }}>{error}</div>
        <p style={{ color: '#6b7280', textAlign: 'center' }}>Vous n'êtes pas membre de ce groupe ou il n'existe pas.</p>
        
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
              {conversation.members ? conversation.members.map(m => m.prenom).join(', ') : conversation.description}
            </p>
          )}
        </div>
      </div>

       <div className="conv-messages" style={{ flex: 1, padding: '20px', overflowY: 'auto', background: '#efeae2', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {messages.map((msg) => {
          const isOwn = String(msg.senderId) === String(currentUserId);

          return (
            <div 
              key={msg.id} 
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
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form className="message-composer" onSubmit={handleSendMessage} style={{ background: '#f0f2f5', padding: '5px 16px', display: 'flex', alignItems: 'center', gap: '10px', borderTop: '1px solid #d1d7db', flexShrink: 0 }}>
        <input 
          className="composer-input" 
          value={newMessage} 
          onChange={(e) => setNewMessage(e.target.value)} 
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