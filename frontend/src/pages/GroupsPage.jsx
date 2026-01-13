import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Search, X, Camera } from 'lucide-react';
import conversationAPI from '../api/conversationAPI';
import '../styles/conversations.css';

const GroupsPage = () => {
  const [groups, setGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    loadGroups();
  }, []);

  // Fonctions utilitaires pour gérer les différents formats de données possibles du backend
  const getGroupId = (g) => g.id || g.idconversation || g.id_conversation || g.conversationId || g.conversation_id;
  const getGroupName = (g) => g.name || g.nom || g.title || g.sujet || "Unnamed Group";

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredGroups(groups);
    } else {
      const lowerQ = searchQuery.toLowerCase();
      setFilteredGroups(groups.filter(g => 
        (getGroupName(g).toLowerCase().includes(lowerQ)) || 
        (g.description && g.description.toLowerCase().includes(lowerQ))
      ));
    }
  }, [searchQuery, groups]);

  const loadGroups = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await conversationAPI.getConversations();

      // Gestion robuste : supporte si l'API renvoie un tableau direct ou un objet { data: [...] }
      let allConvs = [];
      if (Array.isArray(response)) allConvs = response;
      else if (response && Array.isArray(response.data)) allConvs = response.data;

      if (Array.isArray(allConvs)) {
        const groupList = allConvs.filter(c => c.type === 'GROUP');
        setGroups(groupList);
      } else {
        setGroups([]);
      }
    } catch (err) {
      console.error("Erreur chargement groupes", err);
      setError("Failed to load groups.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroup.name.trim()) return;
    
    setCreating(true);
    let createdGroup = null;

    try {
      // 1. Créer le groupe avec les membres
      createdGroup = await conversationAPI.createGroup({ 
        name: newGroup.name, 
        description: newGroup.description, 
        memberIds: [] 
      });
    } catch (error) {
      console.error(error);
      let msg = "Error creating group";
      if (error.response && error.response.data) {
        const data = error.response.data;
        // Gère si le backend renvoie du HTML (erreur 404/500) ou un objet JSON
        if (typeof data === 'string' && data.trim().startsWith('<')) {
          msg = "Server endpoint not found or internal error.";
        } else {
          msg = data.message || data.error || JSON.stringify(data);
        }
      } else if (error.message) {
        msg = error.message;
      }
      if (msg.length > 200) msg = "Server error (check console)";
      alert(`Failed to create group: ${msg}`);
      setCreating(false);
      return;
    }

    // 2. Succès
    setShowModal(false);
    setNewGroup({ name: '', description: '' });
    loadGroups(); // Recharger la liste
    setCreating(false);
  };

  return (
    <div className="whatsapp-layout" style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#fff' }}>
      {/* Header WhatsApp Style */}
      <div style={{ 
        padding: '10px 16px', 
        background: '#f0f2f5', 
        display: 'flex', 
        justifyContent: 'flex-end', 
        alignItems: 'center',
        borderBottom: '1px solid #e0e0e0'
      }}>
        <button 
          onClick={() => setShowModal(true)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#54656f' }}
          title="New Group"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ padding: '8px 12px', borderBottom: '1px solid #f0f2f5' }}>
        <div style={{ 
          background: '#f0f2f5', 
          borderRadius: '8px', 
          padding: '8px 12px', 
          display: 'flex', 
          alignItems: 'center' 
        }}>
          <Search size={18} color="#54656f" style={{ marginRight: '10px' }} />
          <input 
            type="text" 
            placeholder="Search groups..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ 
              border: 'none', 
              background: 'transparent', 
              width: '100%', 
              outline: 'none', 
              fontSize: '15px' 
            }}
          />
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading && <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>Loading...</div>}
        {error && <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>{error}</div>}

        {!loading && !error && filteredGroups.map((group, index) => {
          const groupName = getGroupName(group);
          const groupId = getGroupId(group);

          return (
          <div 
            key={groupId || index} 
            onClick={() => groupId ? navigate(`/conversations/${groupId}`) : console.error("ID manquant pour le groupe", group)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              padding: '12px 16px', 
              cursor: 'pointer',
              borderBottom: '1px solid #f0f2f5',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f5f6f6'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
          >
            {/* Avatar Placeholder */}
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '50%', 
              background: '#dfe3e5', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              marginRight: '15px',
              color: '#fff'
            }}>
              <Users size={24} color="#8696a0" />
            </div>
            
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ 
                fontSize: '17px', 
                color: '#111b21', 
                fontWeight: '400', 
                marginBottom: '4px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {groupName}
              </div>
              {group.description && (
                <div style={{ 
                  fontSize: '14px', 
                  color: '#667781', 
                  whiteSpace: 'nowrap', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis' 
                }}>
                  {group.description}
                </div>
              )}
            </div>
          </div>
          );
        })}
        
        {!loading && filteredGroups.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#8696a0' }}>
            No groups found.
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: 'white', width: '90%', maxWidth: '400px',
            borderRadius: '12px', padding: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', color: '#111b21' }}>New Group</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={24} color="#54656f" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup}>
              {/* Image Placeholder (Visual only) */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <div 
                  style={{ 
                  width: '80px', height: '80px', borderRadius: '50%', 
                  background: '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1px solid #eee'
                }}>
                  <Users size={40} color="#54656f" />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <input
                  type="text"
                  placeholder="Group Subject (Name)"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({...newGroup, name: e.target.value, nom: e.target.value})}
                  style={{ 
                    width: '100%', padding: '10px', border: 'none', 
                    borderBottom: '2px solid #00a884', outline: 'none',
                    fontSize: '16px'
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <input
                  type="text"
                  placeholder="Description (Optional)"
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({...newGroup, description: e.target.value})}
                  style={{ 
                    width: '100%', padding: '10px', border: 'none', 
                    borderBottom: '1px solid #e0e0e0', outline: 'none',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                  type="submit" 
                  disabled={creating}
                  style={{ 
                    background: '#00a884', color: 'white', border: 'none', 
                    padding: '10px 24px', borderRadius: '24px', 
                    fontWeight: 'bold', cursor: 'pointer',
                    opacity: creating ? 0.7 : 1
                  }}
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupsPage;