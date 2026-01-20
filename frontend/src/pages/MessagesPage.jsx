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
      setConversations(conversationsList.filter(c => c.type === 'DIRECT'));
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
        setSearchResults(users);
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
        navigate(`/conversations/${convId}`);
      } else {
        alert("Erreur: Impossible de récupérer l'ID de la conversation.");
      }
    } catch (error) {      
      console.error("Erreur création conversation", error);
      alert(`Impossible de démarrer la conversation. Veuillez réessayer. Détails: ${error.message || error}`);
    }
  };

  return (
    <div className="messages-page" style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto', minHeight: '100vh' }}>
      {/* Header Moderne */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: '800', 
          marginBottom: '8px', 
          marginTop: 0,
          background: 'linear-gradient(90deg, #E334FE, #A6048E)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          display: 'inline-block'
        }}>Messages</h1>
        <p style={{ color: '#6b7280', margin: 0 }}>Your private conversations.</p>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '30px', position: 'relative' }}>
        <Search size={20} color="#9ca3af" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
        <input 
          type="text" 
          placeholder="Search for a student to chat..." 
          value={searchQuery}
          onChange={handleSearch}
          style={{ 
            width: '100%', 
            padding: '14px 14px 14px 50px', 
            borderRadius: '16px', 
            border: '1px solid #e5e7eb', 
            fontSize: '16px',
            outline: 'none',
            background: 'white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
            transition: 'border-color 0.2s'
          }}
          onFocus={(e) => e.target.style.borderColor = '#7c3aed'}
          onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
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

      {/* Grid Layout */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '24px',
        paddingBottom: '40px'
      }}>
        {conversations.map(conv => {
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

          return (
          <div 
            key={convId}
            onClick={() => navigate(`/conversations/${convId}`)}
            style={{ 
              background: 'white',
              borderRadius: '20px',
              padding: '24px',
              cursor: 'pointer',
              border: '1px solid #f3f4f6',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
            }}
          >
            {hasUnread && (
              <div style={{ position: 'absolute', top: '15px', right: '15px', minWidth: '20px', height: '20px', background: '#25D366', borderRadius: '50%', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '11px', fontWeight: 'bold' }}>
                1
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ 
                  width: '56px', height: '56px', borderRadius: '16px', 
                  background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#7c3aed', marginRight: '16px', overflow: 'hidden'
                }}>
                  {avatarSrc ? (
                    <img src={avatarSrc} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <User size={28} />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1f2937', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {conv.title || conv.name || "User"}
                  </h3>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>
                     {new Date(conv.lastMessage?.sentAt || conv.updatedAt).toLocaleDateString()}
                  </span>
                </div>
            </div>

            <p style={{ 
              color: hasUnread ? '#111' : '#4b5563', 
              fontSize: '14px', lineHeight: '1.5', margin: 0, 
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
              flex: 1,
              fontWeight: hasUnread ? '600' : '400'
            }}>
               {conv.lastMessage?.content || "No messages yet."}
            </p>
          </div>
        )})}
        {conversations.length === 0 && <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#6b7280' }}>No conversations yet. Search for someone to chat!</div>}
      </div>
    </div>
  );
};

export default MessagesPage;