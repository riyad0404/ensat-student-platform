import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Search, X, Camera } from 'lucide-react';
import conversationAPI from '../api/conversationAPI';
import '../styles/conversations.css';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';

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
  const { user } = useAuth();
  const currentUserId = user?.iduser || user?.id;
  const { socket } = useSocket();

  useEffect(() => {
    loadGroups();
    
    if (socket) {
      // Si le backend envoie un événement global "notification" ou "update_group_list"
      // Demande à ton équipe le nom exact de l'événement
      socket.on('notification', loadGroups);
      socket.on('receive_message', loadGroups); // Rafraîchir si un message arrive (pour le compteur non-lu)

      return () => {
        socket.off('notification', loadGroups);
        socket.off('receive_message', loadGroups);
      };
    }
  }, [socket]);

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
      let msg = "Failed to load groups.";
      if (err.response) {
        msg += ` Server returned ${err.response.status} - ${err.response.statusText}`;
      } else {
        msg += " " + (err.message || "");
      }
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
    <div className="groups-page-container">
      {/* Header Moderne */}
      <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: '800', 
            marginBottom: '8px', 
            marginTop: 0,
            color: '#333333'
          }}>Work Groups</h1>
          <p style={{ color: '#6b7280', margin: 0 }}>Join groups and collaborate with your peers.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          style={{ 
             background: 'linear-gradient(90deg, #4a82fc, #0040D0)', 
            color: 'white', 
            border: 'none', 
            padding: '12px 24px', 
            borderRadius: '12px', 
            fontWeight: '600', 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(0, 64, 208, 0.2)',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <Plus size={20} /> New Group
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '30px', position: 'relative' }}>
        <Search size={20} color="#9ca3af" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
        <input 
          type="text" 
          placeholder="Search for a group..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
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
          onFocus={(e) => e.target.style.borderColor = '#0040D0'}
          onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
        />
      </div>

      {/* Grid Layout */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '24px',
        paddingBottom: '40px'
      }}>
        {loading && <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>Loading...</div>}
        {error && <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>{error}</div>}

        {!loading && !error && filteredGroups.map((group, index) => {
          const groupName = getGroupName(group);
          const groupId = getGroupId(group);
          
          // Logique de notification (Non lu)
          const lastMsg = group.lastMessage;
          const isOwnMessage = lastMsg?.senderId && String(lastMsg.senderId) === String(currentUserId);
          let hasUnread = false;

          // On ne montre JAMAIS de notification si le dernier message vient de nous
          if (!isOwnMessage) {
            if (group.unreadCount !== undefined) {
               hasUnread = group.unreadCount > 0;
            } else {
               const lastRead = localStorage.getItem(`lastRead_${groupId}`);
               const lastMsgDate = lastMsg?.sentAt || lastMsg?.createdAt || group.updatedAt;
               const isLastReadValid = lastRead && !isNaN(new Date(lastRead).getTime());
  
               hasUnread = lastMsgDate && (!isLastReadValid || new Date(lastMsgDate) > new Date(lastRead));
            }
          }

          return (
          <div 
            key={groupId || index} 
            onClick={() => groupId ? navigate(`/conversations/${groupId}`, { state: { type: 'group' } }) : console.error("ID manquant pour le groupe", group)}
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
               <div style={{ position: 'absolute', top: '15px', right: '15px', width: '12px', height: '12px', background: '#25D366', borderRadius: '50%', border: '2px solid white' }} />
             )}
 
             <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
               <div style={{ 
                 width: '56px', height: '56px', borderRadius: '50%', 
                 background: '#E6F0FF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                 color: '#0040D0', marginRight: '16px'
               }}>
                 <Users size={28} />
               </div>
               <div style={{ flex: 1, minWidth: 0 }}>
                 <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1f2937', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                   {groupName}
                 </h3>
                 <span style={{ fontSize: '14px', color: '#6b7280' }}>
                   {(group.members || []).filter(m => !m.leftAt).length} members
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
              {(() => {
                if (group.lastMessage) {
                   const senderId = group.lastMessage.senderId;
                   const isMe = String(senderId) === String(currentUserId);
                   let senderName = "Unknown";
                   if (isMe) {
                     senderName = "You";
                   } else {
                     const sender = group.members?.find(m => String(m.iduser) === String(senderId));
                     if (sender) senderName = sender.prenom || sender.nom || "User";
                   }
                   return <>{senderName}: {group.lastMessage.content}</>;
                }
                return group.description || "No description available.";
              })()}
             </p>
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
          background: 'rgba(0,0,0,0.4)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: 'white', width: '90%', maxWidth: '500px',
            borderRadius: '16px', padding: '32px',
            boxShadow: '0 10px 25px rgba(0, 64, 208, 0.15)', border: '1px solid rgba(0, 64, 208, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ 
                margin: 0, 
                fontSize: '22px', 
                fontWeight: '700',
                color: '#333333'
              }}>Create New Group</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={24} color="#0040D0" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#060606', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Group Name</label>
                <input
                  type="text"
                  placeholder="Group Name"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({...newGroup, name: e.target.value, nom: e.target.value})}
                  style={{ 
                    width: '100%', height: '44px', padding: '0 16px', border: '1.5px solid #e0e0e0', 
                    borderRadius: '6px', outline: 'none', fontSize: '14px',
                    background: '#ffffff', transition: 'all 0.2s ease', color: '#333'
                  }}
                  onFocus={(e) => { e.target.style.borderColor = '#0040D0'; e.target.style.boxShadow = '0 0 0 2px rgba(0, 64, 208, 0.1)'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#e0e0e0'; e.target.style.boxShadow = 'none'; }}
                  required
                />
              </div>

              <div style={{ marginBottom: '32px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#060606', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Description</label>
                <textarea
                  placeholder="Description (Optional)"
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({...newGroup, description: e.target.value})}
                  style={{ 
                    width: '100%', padding: '12px 16px', border: '1.5px solid #e0e0e0', 
                    borderRadius: '6px', outline: 'none', fontSize: '14px',
                    background: '#ffffff', minHeight: '100px', resize: 'vertical', transition: 'all 0.2s ease', color: '#333'
                  }}
                  onFocus={(e) => { e.target.style.borderColor = '#0040D0'; e.target.style.boxShadow = '0 0 0 2px rgba(0, 64, 208, 0.1)'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#e0e0e0'; e.target.style.boxShadow = 'none'; }}
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  style={{
                    height: '44px', borderRadius: '25px', background: 'transparent',
                    border: '2px solid #E7A33E', color: '#E7A33E', fontWeight: '700',
                    fontSize: '14px', padding: '0 30px', cursor: 'pointer', transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => { e.target.style.background = 'linear-gradient(90deg, #E7A33E, #FF6B00)'; e.target.style.color = 'white'; e.target.style.borderColor = 'transparent'; }}
                  onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#E7A33E'; e.target.style.borderColor = '#E7A33E'; }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={creating}
                  style={{
                    height: '44px', borderRadius: '25px', background: 'linear-gradient(90deg, #4a82fc, #0040D0)', 
                    color: 'white', fontWeight: '700', fontSize: '14px', border: 'none', 
                    padding: '0 30px', cursor: 'pointer', transition: 'all 0.3s ease',
                    opacity: creating ? 0.7 : 1
                  }}
                  onMouseEnter={(e) => !creating && (e.target.style.transform = 'translateY(-1px)')}
                  onMouseLeave={(e) => !creating && (e.target.style.transform = 'translateY(0)')}
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