import React, { useState, useEffect } from 'react';
import { conversationAPI } from '../../api/conversationAPI';
import '../../styles/conversations.css';
import { Link as LinkIcon, Check } from 'lucide-react';

const GroupMembersManager = ({ conversationId, currentUserId, conversationData }) => {
  const [members, setMembers] = useState([]);
  const [isOwner, setIsOwner] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMemberId, setNewMemberId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (conversationData?.members) {
      setMembers(conversationData.members);
      // Vérifier si l'utilisateur actuel est propriétaire
      const currentMember = conversationData.members.find(m => m.iduser === currentUserId);
      setIsOwner(currentMember?.role === 'OWNER');
    }
  }, [conversationData, currentUserId]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMemberId.trim()) return;

    setLoading(true);
    setError('');

    try {
      await conversationAPI.addMember(conversationId, newMemberId.trim());
      setNewMemberId('');
      setShowAddForm(false);
      // Recharger la page pour mettre à jour
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'ajout du membre');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir retirer ce membre ?')) return;

    try {
      await conversationAPI.removeMember(conversationId, memberId);
      // Recharger la page pour mettre à jour
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du retrait du membre');
    }
  };

  const copyInviteLink = () => {
    const link = `${window.location.origin}/conversations/${conversationId}`;
    navigator.clipboard.writeText(link);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="group-members-manager">
      <div className="members-header">
        <h3>Membres du groupe ({members.length})</h3>
        {isOwner && (
          <button
            className="add-member-btn"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? 'Annuler' : '+ Ajouter'}
          </button>
        )}
      </div>

      <button 
        className="sidebar-action-btn" 
        onClick={copyInviteLink}
        style={{ marginBottom: '20px', width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '12px', background: 'white', cursor: 'pointer', color: '#0040D0', justifyContent: 'center', fontWeight: '600', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}
      >
        {copySuccess ? <Check size={18} color="#10b981" /> : <LinkIcon size={18} />}
        <span>{copySuccess ? 'Link copied!' : 'Invite to group via link'}</span>
      </button>

      {error && <div className="error-message">{error}</div>}

      {isOwner && showAddForm && (
        <form className="add-member-form" onSubmit={handleAddMember}>
          <input
            type="text"
            placeholder="ID de l'utilisateur"
            value={newMemberId}
            onChange={(e) => setNewMemberId(e.target.value)}
            disabled={loading}
          />
          <button type="submit" disabled={loading || !newMemberId.trim()}>
            {loading ? 'Ajout...' : 'Ajouter'}
          </button>
        </form>
      )}

      <div className="members-list">
        {members.map((member) => (
          <div key={member.iduser} className="member-item">
            <div className="member-info">
              <div className="member-name">
                {member.prenom} {member.nom}
                {member.role === 'OWNER' && <span className="owner-badge">Propriétaire</span>}
              </div>
              <div className="member-details">
                Niveau: {member.niveau}
              </div>
            </div>
            {isOwner && member.role !== 'OWNER' && member.iduser !== currentUserId && (
              <button
                className="remove-member-btn"
                onClick={() => handleRemoveMember(member.iduser)}
                title="Retirer du groupe"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GroupMembersManager;