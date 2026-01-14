import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, Trash2, ArrowLeft, Users, X, LogOut, UserPlus, Ban, MoreVertical, Paperclip, Link as LinkIcon, Camera, UserMinus, Check, Shield } from 'lucide-react';
import conversationAPI from '../api/conversationAPI';
import '../styles/conversations.css';
import { useAuth } from '../contexts/AuthContext';

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
  const [newMemberId, setNewMemberId] = useState('');
  const [showAddMember, setShowAddMember] = useState(false);
  const fileInputRef = useRef(null);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [memberSearchResults, setMemberSearchResults] = useState([]);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveError, setLeaveError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [sidebarNotification, setSidebarNotification] = useState(null);
  const [showRemoveMemberModal, setShowRemoveMemberModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [memberToTransfer, setMemberToTransfer] = useState(null);
  const [commonGroups, setCommonGroups] = useState([]);

  const { user } = useAuth();
  // Supporte id ou iduser selon ce que le backend renvoie dans le token
  const currentUserId = user?.id || user?.iduser;

  useEffect(() => {
    fetchData();

    // Mise à jour automatique des messages toutes les 3 secondes (Polling)
    const interval = setInterval(() => {
      refreshMessages();
    }, 3000);

    return () => clearInterval(interval);
  }, [id]);

  // Marquer comme lu quand on ouvre la conversation ou reçoit un message
  useEffect(() => {
    if (id) {
      localStorage.setItem(`lastRead_${id}`, new Date().toISOString());
    }
  }, [id, messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      let convData;
      
      // 1. Tentative de récupération directe
      try {
        convData = await conversationAPI.getConversation(id);
      } catch (err) {
        console.warn("Endpoint direct échoué, tentative via liste...", err);
      }

      // 2. Fallback sur la liste si direct a échoué
      if (!convData) {
        const allConvs = await conversationAPI.getConversations();
        let list = Array.isArray(allConvs) ? allConvs : (allConvs.data || []);
        
        convData = list.find(c => {
          const cId = c.id || c.idconversation || c.id_conversation || c.conversationId;
          return String(cId) === String(id);
        });
      }

      if (!convData) throw new Error("Conversation introuvable");

      // 3. Récupération des messages (Safe)
      let msgs = [];
      try {
        const msgsData = await conversationAPI.getMessages(id);
        msgs = Array.isArray(msgsData) ? msgsData : (msgsData?.data || []);
      } catch (msgErr) {
        console.error("Erreur chargement messages", msgErr);
      }

      setConversation(convData);
      setMessages(msgs);
    } catch (error) {
      console.error("Erreur chargement", error);
      setError("Impossible de charger la conversation.");
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour rafraîchir les messages en arrière-plan sans recharger toute la page
  const refreshMessages = async () => {
    try {
      const msgsData = await conversationAPI.getMessages(id);
      const msgs = Array.isArray(msgsData) ? msgsData : (msgsData?.data || []);
      
      // Jouer un son si un nouveau message arrive et qu'il n'est pas de moi
      if (msgs.length > messages.length) {
        const lastMsg = msgs[msgs.length - 1];
        if (String(lastMsg.senderId) !== String(currentUserId)) {
          new Audio('/notification.mp3').play().catch(() => {}); // Assurez-vous d'avoir un fichier notification.mp3 dans public/
        }
      }
      setMessages(msgs);
    } catch (error) {
      // Erreur silencieuse pour ne pas gêner l'utilisateur
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      const msg = await conversationAPI.sendMessage(id, newMessage);
      setMessages([...messages, msg]);
      setNewMessage('');
    } catch (error) {
      console.error("Erreur envoi", error);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      await conversationAPI.sendFile(id, file);
      fetchData(); // Rafraîchir pour voir le fichier (message système ou autre)
    } catch (error) {
      console.error("Erreur envoi fichier", error);
      const msg = error.response?.data?.message || "Error sending file";
      alert(msg);
    }
  };

  const handleDeleteGroupClick = () => {
    setDeleteError(null);
    setShowDeleteModal(true);
  };

  const confirmDeleteGroup = async () => {
    try {
      await conversationAPI.deleteConversation(id);
      navigate('/groups');
    } catch (error) {
      console.error("Delete group error:", error);
      const msg = error.response?.data?.message || "Unable to delete group.";
      setDeleteError(msg);
    }
  };

  const handleLeaveGroupClick = () => {
    setLeaveError(null);
    setShowLeaveModal(true);
  };

  const confirmLeaveGroup = async () => {
    try {
      await conversationAPI.leaveConversation(id);
      navigate('/groups');
    } catch (error) {
      console.error("Leave group error:", error);
      const msg = error.response?.data?.message || error.message || "Unknown error";
      setLeaveError(msg);
    }
  };

  const handleMemberSearch = async (e) => {
    const query = e.target.value;
    setMemberSearchQuery(query);
    if (query.length > 1) {
      try {
        const results = await conversationAPI.searchUsers(query);
        // Gestion robuste du format de réponse (tableau ou objet)
        const usersList = Array.isArray(results) ? results : (results.data || []);
        
        const currentMemberIds = conversation.members?.map(m => m.iduser) || [];
        setMemberSearchResults(usersList.filter(u => !currentMemberIds.includes(u.iduser)));
      } catch (err) {
        console.error(err);
      }
    } else {
      setMemberSearchResults([]);
    }
  };

  const handleAddSpecificMember = async (userId) => {
    try {
      await conversationAPI.addMember(id, userId);
      setMemberSearchQuery('');
      setMemberSearchResults([]);
      setShowAddMember(false);
      fetchData(); // Rafraîchir les données
      setSidebarNotification({ type: 'success', message: 'Member added successfully' });
      setTimeout(() => setSidebarNotification(null), 3000);
    } catch (error) {
      setSidebarNotification({ type: 'error', message: "Error adding member" });
      setTimeout(() => setSidebarNotification(null), 3000);
    }
  };

  const handleRemoveMemberClick = (member) => {
    setMemberToRemove(member);
    setShowRemoveMemberModal(true);
  };

  const confirmRemoveMember = async () => {
    if (!memberToRemove) return;
    try {
      await conversationAPI.removeMember(id, memberToRemove.iduser);
      fetchData(); // Rafraîchir les données
      setSidebarNotification({ type: 'success', message: 'Member removed' });
      setTimeout(() => setSidebarNotification(null), 3000);
    } catch (error) {
      setSidebarNotification({ type: 'error', message: "Error removing member" });
      setTimeout(() => setSidebarNotification(null), 3000);
    } finally {
      setShowRemoveMemberModal(false);
      setMemberToRemove(null);
    }
  };

  const handleTransferOwnershipClick = (member) => {
    setMemberToTransfer(member);
    setShowTransferModal(true);
  };

  const confirmTransferOwnership = async () => {
    if (!memberToTransfer) return;
    try {
      await conversationAPI.transferOwnership(id, memberToTransfer.iduser);
      fetchData(); // Rafraîchir les données
      setSidebarNotification({ type: 'success', message: 'Ownership transferred successfully' });
      setTimeout(() => setSidebarNotification(null), 3000);
    } catch (error) {
      console.error("Transfer error:", error);
      setSidebarNotification({ type: 'error', message: "Error transferring ownership" });
      setTimeout(() => setSidebarNotification(null), 4000);
    } finally {
      setShowTransferModal(false);
      setMemberToTransfer(null);
    }
  };

  const copyGroupLink = () => {
    const link = `${window.location.origin}/conversations/${id}`;
    navigator.clipboard.writeText(link);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  if (loading) return <div className="conv-loading">Chargement...</div>;
  if (error) return <div className="conv-empty" style={{ color: 'red' }}>{error}</div>;
  if (!conversation) return <div className="conv-empty">Conversation introuvable</div>;

  const isGroup = conversation.type === 'GROUP';
  // Déterminer si l'utilisateur est propriétaire (Admin)
  const currentMember = conversation.members?.find(m => String(m.iduser) === String(currentUserId));
  const isOwner = currentMember?.role === 'OWNER';

  // Fonction pour récupérer le nom du groupe de manière robuste
  const getConvName = () => conversation.name || conversation.nom || conversation.title || conversation.sujet || "Conversation";

  // Fonction utilitaire pour détecter si un message est une image (basique)
  const isImageMessage = (content) => {
    return content && (content.match(/\.(jpeg|jpg|gif|png|webp)$/i) || content.startsWith('data:image'));
  };

  // Filtrer les médias pour la section "Média"
  const mediaMessages = messages.filter(m => isImageMessage(m.content));

  // Récupérer l'image du groupe
  const groupIcon = conversation.icon || conversation.photo;

  // Récupérer l'image de l'autre utilisateur (Direct Chat)
  const otherUser = conversation.otherUser;
  let otherUserImage = null;
  if (otherUser?.iduser) {
      otherUserImage = localStorage.getItem(`profile_image_${otherUser.iduser}`);
  }
  if (!otherUserImage && otherUser?.photo && (otherUser.photo.startsWith('data:') || otherUser.photo.startsWith('http') || otherUser.photo.startsWith('/'))) {
      otherUserImage = otherUser.photo;
  }

  const handleHeaderClick = () => {
    setShowGroupInfo(true);
    if (!isGroup && conversation?.otherUser) {
      loadCommonGroups();
    }
  };

  const loadCommonGroups = async () => {
    try {
      const allConvs = await conversationAPI.getConversations();
      const otherId = conversation.otherUser?.iduser;
      if (Array.isArray(allConvs) && otherId) {
        const common = allConvs.filter(c => c.type === 'GROUP' && c.members?.some(m => m.iduser === otherId));
        setCommonGroups(common);
      }
    } catch (e) {
      console.error("Erreur chargement groupes communs", e);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%', overflow: 'hidden' }}>
      
      {/* Main Chat Area */}
      <div className="conv-view" style={{ background: '#f9fafb', flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Header WhatsApp Style */}
      <div 
        className="conv-header" 
        style={{ padding: '16px 24px', background: 'white', display: 'flex', alignItems: 'center', borderBottom: '1px solid #f3f4f6', boxShadow: '0 1px 2px rgba(0,0,0,0.02)', cursor: 'pointer', zIndex: 10 }}
        onClick={handleHeaderClick}
      >
        <button onClick={() => navigate(-1)} style={{ marginRight: '10px', background: 'none', border: 'none', cursor: 'pointer' }}>
          <ArrowLeft size={24} color="#54656f" />
        </button>
        
        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '16px', overflow: 'hidden', color: '#7c3aed' }}>
          {groupIcon ? (
            <img src={groupIcon} alt="Group Icon" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            isGroup ? <Users size={22} /> : <div style={{fontWeight:'bold', fontSize:'18px'}}>{getConvName().charAt(0)}</div>
          )}
        </div>

        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '18px', margin: 0, color: '#111827', fontWeight: '700' }}>{getConvName()}</h2>
          {isGroup && (
            <p style={{ fontSize: '13px', margin: 0, color: '#667781', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
              {conversation.members ? conversation.members.map(m => m.prenom).join(', ') : conversation.description}
            </p>
          )}
        </div>

        {(
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}>
            <MoreVertical size={20} color="#54656f" />
          </button>
        )}
      </div>

      <div className="conv-messages" style={{ flex: 1, padding: '24px', overflowY: 'auto', background: '#f9fafb', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.senderId === currentUserId ? 'message-own' : ''}`}
               style={{ 
                 alignSelf: msg.senderId === currentUserId ? 'flex-end' : 'flex-start', 
                 background: msg.senderId === currentUserId ? '#7c3aed' : 'white',
                 color: msg.senderId === currentUserId ? 'white' : '#1f2937',
                 borderRadius: msg.senderId === currentUserId ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                 padding: '12px 16px',
                 maxWidth: '70%',
                 boxShadow: msg.senderId === currentUserId ? '0 4px 6px -1px rgba(124, 58, 237, 0.2)' : '0 2px 4px rgba(0,0,0,0.02)',
                 border: msg.senderId === currentUserId ? 'none' : '1px solid #f3f4f6',
                 marginBottom: '4px',
                 position: 'relative',
                 fontSize: '15px',
                 lineHeight: '1.5',
               }}>
            {isGroup && msg.senderId !== currentUserId && (
              <div className="message-sender" style={{ fontSize: '12px', color: '#7c3aed', fontWeight: '600', marginBottom: '4px' }}>
                {msg.senderName || (msg.sender ? `${msg.sender.prenom} ${msg.sender.nom}` : 'Unknown')}
              </div>
            )}
            {isImageMessage(msg.content) ? (
              <img src={msg.content} alt="Sent media" style={{ maxWidth: '100%', borderRadius: '6px', marginTop: '2px', cursor: 'pointer' }} onClick={() => window.open(msg.content, '_blank')} />
            ) : (
              <div className="message-content" style={{ wordWrap: 'break-word' }}>{msg.content}</div>
            )}
            <div style={{ fontSize: '11px', color: msg.senderId === currentUserId ? 'rgba(255,255,255,0.8)' : '#9ca3af', textAlign: 'right', marginTop: '4px', float: 'right', marginLeft: '12px' }}>
              {new Date(msg.sentAt || msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form className="message-composer" onSubmit={handleSendMessage} style={{ background: '#f0f2f5', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '10px', borderTop: '1px solid #ddd' }}>
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={handleFileSelect} 
        />
        <button type="button" onClick={() => fileInputRef.current.click()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#54656f' }} title="Attach file">
          <Paperclip size={24} />
        </button>
        <input 
          className="composer-input" 
          value={newMessage} 
          onChange={(e) => setNewMessage(e.target.value)} 
          placeholder="Type a message" 
          style={{ flex: 1, padding: '9px 12px', borderRadius: '8px', border: 'none', outline: 'none', fontSize: '15px', background: 'white' }}
        />
        <button type="submit" className="composer-send" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#54656f' }}>
          <Send size={24} />
        </button>
      </form>

      </div>

      {/* Group Info Sidebar (WhatsApp Style) */}
      {showGroupInfo && (
        <div style={{ width: '350px', background: '#f0f2f5', borderLeft: '1px solid #d1d7db', display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Sidebar Header */}
          <div style={{ padding: '16px', background: '#f0f2f5', display: 'flex', alignItems: 'center', borderBottom: '1px solid #d1d7db' }}>
            <button onClick={() => setShowGroupInfo(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: '15px' }}>
              <X size={24} color="#54656f" />
            </button>
            <h3 style={{ margin: 0, fontSize: '16px', color: '#111b21' }}>{isGroup ? "Group Info" : "Contact Info"}</h3>
          </div>

          {/* Notification Area */}
          {sidebarNotification && (
            <div style={{ 
              padding: '10px', 
              background: sidebarNotification.type === 'success' ? '#d9fdd3' : '#f8d7da', 
              color: sidebarNotification.type === 'success' ? '#00a884' : '#721c24',
              textAlign: 'center',
              fontSize: '14px',
              borderBottom: '1px solid rgba(0,0,0,0.1)'
            }}>
              {sidebarNotification.message}
            </div>
          )}

          <div style={{ overflowY: 'auto', flex: 1 }}>
            {/* Group Profile */}
            {isGroup ? (
            <div style={{ background: 'white', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <div style={{ position: 'relative', width: '150px', height: '150px', marginBottom: '15px' }}>
                <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#dfe3e5', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {groupIcon ? (
                    <img src={groupIcon} alt="Group Icon" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Users size={80} color="#fff" />
                  )}
                </div>
              </div>
              <h2 style={{ fontSize: '22px', color: '#111b21', margin: '0 0 5px 0' }}>{getConvName()}</h2>
              <p style={{ color: '#667781', fontSize: '14px', textAlign: 'center' }}>{conversation.description || "No description"}</p>
              <p style={{ color: '#667781', fontSize: '13px', marginTop: '5px' }}>Group · {conversation.members?.length} members</p>
            </div>
            ) : (
              /* Direct Chat Profile */
              <div style={{ background: 'white', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <div style={{ width: '150px', height: '150px', borderRadius: '50%', background: '#dfe3e5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px', overflow: 'hidden' }}>
                  {conversation.otherUser?.photo ? (
                    <img src={conversation.otherUser.photo} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <User size={80} color="#fff" />
                  )}
                </div>
                <h2 style={{ fontSize: '22px', color: '#111b21', margin: '0 0 5px 0' }}>{getConvName()}</h2>
                <p style={{ color: '#667781', fontSize: '14px', textAlign: 'center' }}>{conversation.otherUser?.niveau || "Student"}</p>
                <p style={{ color: '#667781', fontSize: '13px', marginTop: '5px' }}>{conversation.otherUser?.email}</p>
              </div>
            )}

            {/* Media, Links and Docs */}
            <div style={{ background: 'white', padding: '15px 20px', marginBottom: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ color: '#667781', fontSize: '14px', fontWeight: '500' }}>Media, links, and docs</span>
                <span style={{ color: '#667781', fontSize: '13px' }}>{mediaMessages.length} &gt;</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '5px' }}>
                {mediaMessages.length > 0 ? (
                  mediaMessages.slice(0, 5).map((m, i) => (
                    <div key={i} style={{ width: '70px', height: '70px', flexShrink: 0, borderRadius: '8px', overflow: 'hidden', border: '1px solid #eee' }}>
                      <img src={m.content} alt="media" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: '13px', color: '#999', fontStyle: 'italic' }}>No media shared yet</div>
                )}
              </div>
            </div>

            {/* Add Member (Admin only) */}
            {isGroup && isOwner && (
              <div style={{ background: 'white', padding: '10px 0', marginBottom: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                {!showAddMember ? (
                  <>
                    <button onClick={() => setShowAddMember(true)} style={{ width: '100%', padding: '15px 20px', display: 'flex', alignItems: 'center', gap: '15px', background: 'none', border: 'none', cursor: 'pointer', color: '#111b21', fontSize: '16px', textAlign: 'left' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#00a884', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <UserPlus size={20} color="white" />
                      </div>
                      Add participant
                    </button>
                    <div style={{ position: 'relative' }}>
                      <button onClick={copyGroupLink} style={{ width: '100%', padding: '15px 20px', display: 'flex', alignItems: 'center', gap: '15px', background: 'none', border: 'none', cursor: 'pointer', color: '#111b21', fontSize: '16px', textAlign: 'left' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#00a884', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {copySuccess ? <Check size={20} color="white" /> : <LinkIcon size={20} color="white" />}
                        </div>
                        {copySuccess ? "Link copied!" : "Invite to group via link"}
                      </button>
                    </div>
                  </>
                ) : (
                  <div style={{ padding: '10px 20px' }}>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                      <input 
                        type="text" 
                        placeholder="Search student name..." 
                        value={memberSearchQuery}
                        onChange={handleMemberSearch}
                        style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ddd', outline: 'none' }}
                        autoFocus
                      />
                    </div>
                    {memberSearchResults.length > 0 && (
                      <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '4px', marginBottom: '10px' }}>
                        {memberSearchResults.map(u => (
                          <div key={u.iduser} onClick={() => handleAddSpecificMember(u.iduser)} style={{ padding: '8px', borderBottom: '1px solid #f5f5f5', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#111b21' }}>
                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#ddd' }}></div>
                            <span>{u.prenom || u.firstname || u.nom || u.lastname || u.email || "Utilisateur"}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <button type="button" onClick={() => setShowAddMember(false)} style={{ background: '#f0f2f5', color: '#54656f', border: 'none', borderRadius: '4px', padding: '8px 12px', cursor: 'pointer' }}>
                      <X size={18} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Members List */}
            {isGroup && (<div style={{ background: 'white', padding: '10px 0', marginBottom: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <div style={{ padding: '10px 20px', color: '#667781', fontSize: '14px', fontWeight: '500' }}>
                {conversation.members?.length} participants
              </div>
              {conversation.members?.map(member => {
                // Récupération de l'image de profil
                // 1. Chercher dans le localStorage (pour l'utilisateur courant et les tests localhost)
                let memberImage = localStorage.getItem(`profile_image_${member.iduser}`);
                
                // 2. Sinon utiliser la photo du backend si elle est valide (URL ou Base64)
                if (!memberImage && member.photo && (member.photo.startsWith('data:') || member.photo.startsWith('http') || member.photo.startsWith('/'))) {
                  memberImage = member.photo;
                }

                return (
                  <div key={member.iduser} style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', borderBottom: '1px solid #f0f2f5' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#dfe3e5', marginRight: '15px', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      {memberImage ? (
                        <img src={memberImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <Users size={20} color="#fff" />
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#111b21', fontSize: '16px' }}>
                        {member.prenom} {member.nom} {String(member.iduser) === String(currentUserId) && "(You)"}
                      </div>
                      {member.role === 'OWNER' && <span style={{ fontSize: '12px', color: '#00a884', background: '#e7fce3', padding: '2px 6px', borderRadius: '4px', marginTop: '2px', display: 'inline-block' }}>Group Admin</span>}
                    </div>
                    
                    {/* Bouton Supprimer Membre (Admin seulement, pas sur soi-même) */}
                    {isOwner && String(member.iduser) !== String(currentUserId) && (
                      <div style={{ display: 'flex' }}>
                        <button onClick={() => handleTransferOwnershipClick(member)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f59e0b', padding: '8px' }} title="Promote to Admin">
                          <Shield size={18} />
                        </button>
                        <button onClick={() => handleRemoveMemberClick(member)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ea0038', padding: '8px' }} title="Remove member">
                          <UserMinus size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            )}

            {/* Common Groups (Direct only) */}
            {!isGroup && commonGroups.length > 0 && (
              <div style={{ background: 'white', padding: '10px 0', marginBottom: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <div style={{ padding: '10px 20px', color: '#667781', fontSize: '14px', fontWeight: '500' }}>
                  {commonGroups.length} groupes en commun
                </div>
                {commonGroups.map(g => (
                  <div key={g.idconversation} onClick={() => navigate(`/conversations/${g.idconversation}`)} style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', borderBottom: '1px solid #f0f2f5', cursor: 'pointer' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#dfe3e5', marginRight: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Users size={20} color="#fff" />
                    </div>
                    <div style={{ color: '#111b21', fontSize: '16px' }}>{g.title || g.name}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div style={{ background: 'white', padding: '10px 0', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              {isGroup ? (
                <button onClick={handleLeaveGroupClick} style={{ width: '100%', padding: '15px 20px', display: 'flex', alignItems: 'center', gap: '15px', background: 'none', border: 'none', cursor: 'pointer', color: '#ea0038', fontSize: '16px', textAlign: 'left' }}>
                  <LogOut size={20} /> Exit group
                </button>
              ) : (
                <button onClick={() => alert("Block feature coming soon")} style={{ width: '100%', padding: '15px 20px', display: 'flex', alignItems: 'center', gap: '15px', background: 'none', border: 'none', cursor: 'pointer', color: '#ea0038', fontSize: '16px', textAlign: 'left' }}>
                  <Ban size={20} /> Block {conversation.otherUser?.prenom}
                </button>
              )}
              
              {(isOwner || !isGroup) && (
                <button onClick={handleDeleteGroupClick} style={{ width: '100%', padding: '15px 20px', display: 'flex', alignItems: 'center', gap: '15px', background: 'none', border: 'none', cursor: 'pointer', color: '#ea0038', fontSize: '16px', textAlign: 'left' }}>
                  <Trash2 size={20} /> {isGroup ? 'Delete group' : 'Delete chat'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Leave Group Confirmation Modal */}
      {showLeaveModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 2000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: 'white', width: '90%', maxWidth: '350px',
            borderRadius: '12px', padding: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            textAlign: 'center'
          }}>
            {leaveError ? (
              <>
                <h3 style={{ margin: '0 0 10px 0', color: '#ea0038' }}>Unable to exit</h3>
                <p style={{ color: '#667781', marginBottom: '20px', fontSize: '14px' }}>
                  {leaveError}
                </p>
                <button 
                  onClick={() => setShowLeaveModal(false)}
                  style={{ background: '#f0f2f5', border: 'none', padding: '8px 24px', borderRadius: '20px', cursor: 'pointer', color: '#111b21', fontWeight: '500' }}
                >
                  OK
                </button>
              </>
            ) : (
              <>
                <h3 style={{ margin: '0 0 10px 0', color: '#111b21' }}>Exit group?</h3>
                <p style={{ color: '#667781', marginBottom: '20px', fontSize: '14px' }}>
                  Are you sure you want to exit "{getConvName()}"?
                </p>
                {isOwner && (
                  <p style={{ color: '#ea0038', fontSize: '13px', fontWeight: 'bold', marginBottom: '15px' }}>
                    ⚠️ You are the group admin. You must transfer ownership to another member before you can leave.
                  </p>
                )}
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button 
                    onClick={() => setShowLeaveModal(false)}
                    style={{ background: 'none', border: '1px solid #ddd', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', color: '#111b21', fontWeight: '500' }}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={confirmLeaveGroup}
                    style={{ background: '#ea0038', border: 'none', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', color: 'white', fontWeight: '500' }}
                  >
                    Exit
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Delete Group Confirmation Modal */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 2000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: 'white', width: '90%', maxWidth: '350px',
            borderRadius: '12px', padding: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            textAlign: 'center'
          }}>
            {deleteError ? (
              <>
                <h3 style={{ margin: '0 0 10px 0', color: '#ea0038' }}>Error</h3>
                <p style={{ color: '#667781', marginBottom: '20px', fontSize: '14px' }}>{deleteError}</p>
                <button onClick={() => setShowDeleteModal(false)} style={{ background: '#f0f2f5', border: 'none', padding: '8px 24px', borderRadius: '20px', cursor: 'pointer', color: '#111b21', fontWeight: '500' }}>OK</button>
              </>
            ) : (
              <>
                <h3 style={{ margin: '0 0 10px 0', color: '#111b21' }}>Delete group?</h3>
                {conversation.members && conversation.members.length > 1 ? (
                  <p style={{ color: '#667781', marginBottom: '20px', fontSize: '14px' }}>
                    You cannot delete this group because there are other members. Please remove them first.
                  </p>
                ) : (
                  <p style={{ color: '#667781', marginBottom: '20px', fontSize: '14px' }}>
                    Are you sure you want to delete "{getConvName()}" permanently?
                  </p>
                )}
                
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button onClick={() => setShowDeleteModal(false)} style={{ background: 'none', border: '1px solid #ddd', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', color: '#111b21', fontWeight: '500' }}>
                    Cancel
                  </button>
                  {(!conversation.members || conversation.members.length <= 1) && (
                    <button onClick={confirmDeleteGroup} style={{ background: '#ea0038', border: 'none', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', color: 'white', fontWeight: '500' }}>
                      Delete
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Remove Member Confirmation Modal */}
      {showRemoveMemberModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 2000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: 'white', width: '90%', maxWidth: '350px',
            borderRadius: '12px', padding: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#111b21' }}>Remove member?</h3>
            <p style={{ color: '#6b7280', marginBottom: '20px', fontSize: '14px' }}>
              Are you sure you want to remove {memberToRemove?.prenom} {memberToRemove?.nom} from the group?
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setShowRemoveMemberModal(false)}
                style={{ background: 'none', border: '1px solid #ddd', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', color: '#111b21', fontWeight: '500' }}
              >
                Cancel
              </button>
              <button 
                onClick={confirmRemoveMember}
                style={{ background: '#ea0038', border: 'none', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', color: 'white', fontWeight: '500' }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Ownership Confirmation Modal */}
      {showTransferModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 2000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: 'white', width: '90%', maxWidth: '350px',
            borderRadius: '12px', padding: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#111b21' }}>Transfer ownership?</h3>
            <p style={{ color: '#6b7280', marginBottom: '20px', fontSize: '14px' }}>
              Do you want to transfer admin rights to {memberToTransfer?.prenom} {memberToTransfer?.nom}? You will become a regular member.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowTransferModal(false)} style={{ background: 'none', border: '1px solid #ddd', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', color: '#111b21', fontWeight: '500' }}>Cancel</button>
              <button onClick={confirmTransferOwnership} style={{ background: '#00a884', border: 'none', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', color: 'white', fontWeight: '500' }}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationPage;