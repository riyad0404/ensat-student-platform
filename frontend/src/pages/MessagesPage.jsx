import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User } from 'lucide-react';
import conversationAPI from '../api/conversationAPI';
import '../styles/conversations.css';

const MessagesPage = () => {
  const [conversations, setConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadConversations();
    // Actualisation automatique toutes les 3 secondes
    const interval = setInterval(loadConversations, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadConversations = async () => {
    try {
      const allConvs = await conversationAPI.getConversations();
      // Filtrer pour ne garder que les messages privés (DIRECT)
      setConversations(allConvs.filter(c => c.type === 'DIRECT'));
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
    try {
      const conv = await conversationAPI.createDirect(userId);
      const convId = conv.id || conv.idconversation;
      navigate(`/conversations/${convId}`);
    } catch (error) {
      console.error("Erreur création conversation", error);
    }
  };

  return (
    <div className="conversations-page" style={{ backgroundColor: 'white', minHeight: '100vh' }}>
      <div className="page-header" style={{ padding: '10px 15px', background: 'white', borderBottom: '1px solid #eee' }}>
        <div className="search-bar" style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
          <input 
            type="text" 
            placeholder="Search for a student..." 
            value={searchQuery}
            onChange={handleSearch}
            style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '4px', border: 'none', backgroundColor: '#eef3f8', fontSize: '14px', height: '36px' }}
          />
          {searchResults.length > 0 && (
            <div className="search-results" style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #ddd', zIndex: 10, borderRadius: '8px', marginTop: '5px' }}>
              {searchResults.map(user => (
                <div 
                  key={user.iduser} 
                  onClick={() => startConversation(user.iduser)}
                  style={{ padding: '10px', cursor: 'pointer', borderBottom: '1px solid #eee' }}
                >
                  {user.prenom || user.firstname} {user.nom || user.lastname}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="conversations-list">
        {conversations.map(conv => {
          const convId = conv.id || conv.idconversation;
          
          // Logique de notification (Non lu)
          const lastRead = localStorage.getItem(`lastRead_${convId}`);
          const lastMsgDate = conv.lastMessage?.sentAt;
          const hasUnread = lastMsgDate && (!lastRead || new Date(lastMsgDate) > new Date(lastRead));

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
          <div key={convId} className="conv-item" onClick={() => navigate(`/conversations/${convId}`)}>
            {/* Avatar Section */}
            <div style={{ marginRight: '15px', position: 'relative' }}>
                <div style={{ 
                  width: '50px', height: '50px', borderRadius: '50%', 
                  background: '#e1e4e8', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden'
                }}>
                  {avatarSrc ? (
                    <img src={avatarSrc} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <User size={24} color="#666" />
                  )}
                </div>
                {hasUnread && (
                  <div style={{ position: 'absolute', top: -2, right: -2, minWidth: '18px', height: '18px', backgroundColor: '#25D366', borderRadius: '50%', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '10px', fontWeight: 'bold' }}>
                    1
                  </div>
                )}
            </div>

            <div className="conv-meta">
              <div className="conv-title" style={{ fontWeight: hasUnread ? '700' : '600' }}>
                {conv.title || conv.name || "User"}
              </div>
              <div className="conv-desc" style={{ fontWeight: hasUnread ? '600' : '400', color: hasUnread ? '#111' : '#666' }}>
                {conv.lastMessage?.content || "No messages"}
              </div>
            </div>
            <div className="conv-last">
               {conv.lastMessage && new Date(conv.lastMessage.sentAt || conv.lastMessage.createdAt).toLocaleDateString()}
            </div>
          </div>
        )})}
        {conversations.length === 0 && <div className="conv-empty">No conversations yet. Search for someone to chat!</div>}
      </div>
    </div>
  );
};

export default MessagesPage;