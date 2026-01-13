import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Search } from 'lucide-react';
import conversationAPI from '../api/conversationAPI';
import '../styles/conversations.css';

const MessagesPage = () => {
  const [conversations, setConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadConversations();
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
    if (query.length > 2) {
      try {
        const results = await conversationAPI.searchUsers(query);
        setSearchResults(results);
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
      navigate(`/conversations/${conv.id}`);
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
                  {user.firstname} {user.lastname}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="conversations-list">
        {conversations.map(conv => (
          <div key={conv.id} className="conv-item" onClick={() => navigate(`/conversations/${conv.id}`)}>
            <div className="conv-meta">
              <div className="conv-title">{conv.name || "User"}</div>
              <div className="conv-desc">{conv.lastMessage?.content || "No messages"}</div>
            </div>
            <div className="conv-last">
               {conv.lastMessage && new Date(conv.lastMessage.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))}
        {conversations.length === 0 && <div className="conv-empty">No conversations yet. Search for someone to chat!</div>}
      </div>
    </div>
  );
};

export default MessagesPage;