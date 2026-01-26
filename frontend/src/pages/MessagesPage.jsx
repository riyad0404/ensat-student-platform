import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, MessageCircle } from 'lucide-react';
import conversationAPI from '../api/conversationAPI';
import '../styles/conversations.css';
import { useAuth } from '../contexts/AuthContext';

const MessagesPage = () => {
  const [conversations, setConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentUserId = user?.iduser || user?.id;

  useEffect(() => {
    loadConversations();
    // Actualisation automatique toutes les 3 secondes
    const interval = setInterval(loadConversations, 3000);
    return () => clearInterval(interval);
  }, []);

  // Helper pour récupérer l'ID de manière robuste (comme dans GroupsPage)
  const getConvId = (c) => c.id || c.idconversation || c.id_conversation || c.conversationId || c.conversation_id;

  const loadConversations = async () => {
    try {
      const allConvs = await conversationAPI.getConversations();
      
      // Gestion robuste du format de réponse (tableau ou objet { data: ... })
      const conversationsList = Array.isArray(allConvs) ? allConvs : (allConvs?.data || []);
      
      // Filtrer pour ne garder que les messages privés (DIRECT)
      const directConvs = conversationsList.filter(c => c.type === 'DIRECT' && c.lastMessage);
      
      // Trier par date de mise à jour (le plus récent en haut)
      directConvs.sort((a, b) => {
        const dateA = new Date(a.lastMessage?.sentAt || a.updatedAt || 0);
        const dateB = new Date(b.lastMessage?.sentAt || b.updatedAt || 0);
        return dateB - dateA;
      });
      
      setConversations(directConvs);
    } catch (error) {
      console.error("Erreur chargement messages", error);
    }
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length > 1) {
      try {
        const results = await conversationAPI.searchUsers(query);
        const users = Array.isArray(results) ? results : (results.data || []);
        setSearchResults(users.filter(u => String(u.iduser) !== String(currentUserId)));
      } catch (error) {
        console.error("Erreur recherche", error);
      }
    } else {
      setSearchResults([]);
    }
  };

  const startConversation = async (userId) => {
    if (!userId) return;
    if (String(userId) === String(currentUserId)) {
      alert("Vous ne pouvez pas démarrer une conversation avec vous-même.");
      return;
    }
    try {
      const response = await conversationAPI.createDirect(userId)
      const conv = response.data || response
      const convId = getConvId(conv);
      if (convId) {
        navigate(`/conversations/${convId}`, { state: { type: 'direct' } });
      } else {
        alert("Erreur: Impossible de récupérer l'ID de la conversation.");
      }
    } catch (error) {      
      console.error("Erreur création conversation", error);
      alert(`Impossible de démarrer la conversation. Veuillez réessayer. Détails: ${error.message || error}`);
    }
  };

  return (
    <div className="messages-page-container" style={{ background: '#f4f6fa' }}>
      {/* Header Moderne */}
      <div className="page-header">
        <div>
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: '800', 
            margin: 0,
            color: '#333333'
          }}>Messages</h1>
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', flex: 1, maxWidth: '600px', margin: '0 20px' }}>
          <Search size={20} color="#9ca3af" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search for a student..." 
            value={searchQuery}
            onChange={handleSearch}
            style={{ 
              width: '100%', 
              padding: '12px 20px 12px 45px',
              borderRadius: '25px',
              border: '1px solid #e5e7eb', 
              fontSize: '15px',
              outline: 'none',
              transition: 'all 0.2s',
              background: 'white'
            }}
            onFocus={(e) => { e.target.style.borderColor = '#0040D0'; e.target.style.background = 'white'; }}
            onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.background = 'white'; }}
          />
          {searchResults.length > 0 && (
              <div className="search-results" style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #e5e7eb', zIndex: 10, borderRadius: '12px', marginTop: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                {searchResults.map(user => {
                  let avatarSrc = null;
                  if (user.iduser) {
                     avatarSrc = localStorage.getItem(`profile_image_${user.iduser}`);
                  }
                  if (!avatarSrc && user.photo) {
                     avatarSrc = user.photo;
                  }

                  return (
                  <div 
                    key={user.iduser} 
                    onClick={() => startConversation(user.iduser)}
                    style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '10px' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                  >
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {avatarSrc ? <img src={avatarSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={16} />}
                    </div>
                    <div>
                      <div style={{ fontWeight: '500', color: '#1f2937' }}>{user.prenom || user.firstname} {user.nom || user.lastname}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>{user.email}</div>
                    </div>
                  </div>
                )})}
              </div>
            )}
        </div>
      </div>

      <div className="page-content">
        {/* List Layout */}
        <div style={{ 
          background: 'white',
          borderRadius: '16px',
          border: '1px solid #e5e7eb',
          overflow: 'hidden',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
        }}>
          {conversations.map((conv, index) => {
            const convId = getConvId(conv);
            
            // Logique de notification (Non lu)
            const lastMsg = conv.lastMessage;
            const isOwnMessage = lastMsg?.senderId && String(lastMsg.senderId) === String(currentUserId);
            let hasUnread = false;

            // On ne montre JAMAIS de notification si le dernier message vient de nous
            if (!isOwnMessage) {
              // 1. Si le backend supporte unreadCount
              if (conv.unreadCount !== undefined) {
                hasUnread = conv.unreadCount > 0;
              } 
              // 2. Fallback local
              else {
                const lastRead = localStorage.getItem(`lastRead_${convId}`);
                const lastMsgDate = lastMsg?.sentAt || lastMsg?.createdAt || conv.updatedAt;
                const isLastReadValid = lastRead && !isNaN(new Date(lastRead).getTime());
                
                hasUnread = lastMsgDate && (!isLastReadValid || new Date(lastMsgDate) > new Date(lastRead));
              }
            }

            // Avatar
            const otherUser = conv.otherUser;
            let avatarSrc = null;
            
            // 1. Essayer localStorage (pour tests locaux)
            if (otherUser?.iduser) {
               avatarSrc = localStorage.getItem(`profile_image_${otherUser.iduser}`);
            }
            // 2. Sinon photo du backend
            if (!avatarSrc && otherUser?.photo) {
               avatarSrc = otherUser.photo;
            }
            
            const msgDate = new Date(conv.lastMessage?.sentAt || conv.updatedAt);
            const now = new Date();
            const isToday = msgDate.toDateString() === now.toDateString();
            const yesterday = new Date(now);
            yesterday.setDate(now.getDate() - 1);
            const isYesterday = msgDate.toDateString() === yesterday.toDateString();
            
            let dateDisplay = msgDate.toLocaleDateString('fr-FR');
            if (isToday) {
                dateDisplay = msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            } else if (isYesterday) {
                dateDisplay = 'Hier';
            }

            return (
            <div 
              key={convId}
              onClick={() => navigate(`/conversations/${convId}`, { state: { type: 'direct' } })}
              style={{ 
                display: 'flex',
                alignItems: 'center',
                padding: '16px 24px',
                cursor: 'pointer',
                borderBottom: index !== conversations.length - 1 ? '1px solid #f3f4f6' : 'none',
                transition: 'background-color 0.2s ease',
                backgroundColor: 'white'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
            >
              {/* Avatar */}
              <div style={{ marginRight: '20px', position: 'relative', flexShrink: 0 }}>
                  <div style={{ 
                    width: '52px', height: '52px', borderRadius: '50%', 
                    background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#9ca3af', overflow: 'hidden'
                  }}>
                    {avatarSrc ? (
                      <img src={avatarSrc} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <User size={26} />
                    )}
                  </div>
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1f2937', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {conv.title || conv.name || "User"}
                    </h3>
                    <span style={{ fontSize: '12px', color: hasUnread ? '#25D366' : '#6b7280', whiteSpace: 'nowrap' }}>
                       {dateDisplay}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p
  style={{ 
    margin: 0,
    fontSize: '14px',
    color: hasUnread ? '#25D366' : '#6b7280',
    fontWeight: hasUnread ? '600' : '400',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '70%'
  }}
>
  {conv.lastMessage?.content || "No messages yet."}
</p>

                    {hasUnread && (
                      <div style={{ 
                        minWidth: '20px', height: '20px', borderRadius: '10px', 
                        background: '#25D366', color: 'white', fontSize: '11px', 
                        fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '0 6px', marginLeft: '10px'
                      }}>
                        {conv.unreadCount > 0 ? conv.unreadCount : '1'}
                      </div>
                    )}
                  </div>
              </div>
            </div>
          )})}
          {conversations.length === 0 && <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>No conversations yet. Search for someone to chat!</div>}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;