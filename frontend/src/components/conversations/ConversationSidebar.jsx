import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, UserPlus, Link as LinkIcon, Check, LogOut, Trash2, UserMinus, Shield, Users, User, MessageCircle, EyeOff } from 'lucide-react';
import conversationAPI from '../../api/conversationAPI';
import axios from 'axios';

const ConversationSidebar = ({
  show,
  onClose,
  conversation,
  isGroup,
  isOwner,
  currentUserId,
  otherUserImage,
  headerImage,
  onConversationUpdate,
}) => {
  const navigate = useNavigate();

  const [showAddMember, setShowAddMember] = useState(false);
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
  const [showHideModal, setShowHideModal] = useState(false);

  const getConvName = () => conversation.name || conversation.nom || conversation.title || conversation.sujet || "Conversation";

  const loadCommonGroups = async () => {
    const convId = conversation.id || conversation.idconversation || conversation.id_conversation;
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

  useEffect(() => {
    if (show && !isGroup && conversation?.otherUser) {
      loadCommonGroups();
    }
  }, [show, isGroup, conversation]);


  const handleMemberSearch = async (e) => {
    const query = e.target.value;
    setMemberSearchQuery(query);
    if (query.length > 1) {
      try {
        const results = await conversationAPI.searchUsers(query);
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
    const convId = conversation.id || conversation.idconversation || conversation.id_conversation;
    try {
      await conversationAPI.addMember(convId, userId);
      setMemberSearchQuery('');
      setMemberSearchResults([]);
      setShowAddMember(false);
      onConversationUpdate(); // Refresh parent data
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
    const convId = conversation.id || conversation.idconversation || conversation.id_conversation;
    const userIdToRemove = memberToRemove.iduser || memberToRemove.userId || memberToRemove.id;
    
    try {
      await axios.delete(`http://localhost:5000/api/conversations/${convId}/members/${userIdToRemove}`, { withCredentials: true });
      onConversationUpdate();
      setSidebarNotification({ type: 'success', message: 'Member removed' });
      setTimeout(() => setSidebarNotification(null), 3000);
    } catch (error) {
      console.error("Error removing member:", error);
      let msg = "Error removing member";
      if (error.response) {
        const data = error.response.data;
        if (typeof data === 'string') {
             msg = `Error ${error.response.status}: ${data.substring(0, 60)}`;
        } else {
             msg = data?.message || data?.error || `Error ${error.response.status}`;
        }
      } else if (error.request) {
        msg = "Server unreachable";
      }
      setSidebarNotification({ type: 'error', message: msg });
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
    const convId = conversation.id || conversation.idconversation || conversation.id_conversation;
    try {
      await conversationAPI.transferOwnership(convId, memberToTransfer.iduser);
      onConversationUpdate();
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
    const convId = conversation.id || conversation.idconversation || conversation.id_conversation;
    const link = `${window.location.origin}/conversations/${convId}`;
    navigator.clipboard.writeText(link);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleDeleteGroupClick = () => {
    setDeleteError(null);
    setShowDeleteModal(true);
  };

  const confirmDeleteGroup = async () => {
    const convId = conversation.id || conversation.idconversation || conversation.id_conversation;
    try {
      await conversationAPI.deleteConversation(convId);
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
    const convId = conversation.id || conversation.idconversation || conversation.id_conversation;
    try {
      await conversationAPI.leaveConversation(convId);
      navigate('/groups');
    } catch (error) {
      console.error("Leave group error:", error);
      const msg = error.response?.data?.message || error.message || "Unknown error";
      setLeaveError(msg);
    }
  };

  const handleMessageUser = async (userId) => {
    try {
      const conv = await conversationAPI.createDirect(userId);
      const convId = conv.id || conv.idconversation;
      navigate(`/conversations/${convId}`);
      onClose(); // Fermer la sidebar
    } catch (error) {
      console.error("Error creating direct chat", error);
    }
  };

  const handleHideConversationClick = () => {
    setShowHideModal(true);
  };

  const confirmHideConversation = async () => {
    const convId = conversation.id || conversation.idconversation || conversation.id_conversation;
    try {
      await axios.post(`http://localhost:5000/api/conversations/${convId}/hide`, {}, { withCredentials: true });
      navigate('/messages');
    } catch (error) {
      console.error("Error hiding conversation", error);
      let msg = "Failed to delete conversation";
      if (error.response) {
        const data = error.response.data;
        if (typeof data === 'string') {
             msg = `Error ${error.response.status}: ${data.substring(0, 60)}`;
        } else {
             msg = data?.message || data?.error || `Error ${error.response.status}`;
        }
      } else if (error.request) {
        msg = "Server unreachable";
      }
      setSidebarNotification({ type: 'error', message: msg });
    } finally {
      setShowHideModal(false);
    }
  };

  const handleMemberClick = (memberId) => {
    if (String(memberId) === String(currentUserId)) {
      // If the user clicks on their own name, navigate to their main profile page
      navigate('/profile');
    } else {
      // Otherwise, navigate to the other member's profile
      navigate(`/profile/${memberId}`);
    }
    onClose(); // Close the sidebar after navigation
  };

  if (!show) return null;

  return (
    <div style={{ width: '350px', background: '#f0f2f5', borderLeft: '1px solid #d1d7db', display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Sidebar Header */}
      <div style={{ padding: '16px', background: '#f0f2f5', display: 'flex', alignItems: 'center', borderBottom: '1px solid #d1d7db' }}>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: '15px' }}>
          <X size={24} color="#54656f" />
        </button>
        <h3 style={{ margin: 0, fontSize: '16px', color: '#111b21' }}>{isGroup ? "Group Info" : "Contact Info"}</h3>
      </div>

      {/* Notification Area */}
      {sidebarNotification && (
        <div style={{ padding: '10px', background: sidebarNotification.type === 'success' ? '#d9fdd3' : '#f8d7da', color: sidebarNotification.type === 'success' ? '#00a884' : '#721c24', textAlign: 'center', fontSize: '14px', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
          {sidebarNotification.message}
        </div>
      )}

      <div style={{ overflowY: 'auto', flex: 1 }}>
        {/* Profile Section */}
        {isGroup ? (
          <div style={{ background: 'white', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <div style={{ position: 'relative', width: '150px', height: '150px', marginBottom: '15px' }}>
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', color: '#9ca3af' }}>
                {headerImage ? <img src={headerImage} alt="Group Icon" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Users size={64} />}
              </div>
            </div>
            <h2 style={{ fontSize: '22px', color: '#111b21', margin: '0 0 5px 0' }}>{getConvName()}</h2>
            <p style={{ color: '#667781', fontSize: '14px', textAlign: 'center' }}>{conversation.description || "No description"}</p>
            <p style={{ color: '#667781', fontSize: '13px', marginTop: '5px' }}>Group · {(conversation.members || []).filter(m => !m.leftAt).length} members</p>
          </div>
        ) : (
          <div style={{ background: 'white', padding: '30px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', borderBottom: '1px solid #f3f4f6' }}>
            <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', overflow: 'hidden', color: '#9ca3af' }}>
              {otherUserImage ? <img src={otherUserImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={64} />}
            </div>
            <h2 style={{ fontSize: '20px', color: '#111827', margin: '0 0 8px 0', fontWeight: '700' }}>{getConvName()}</h2>
            <p style={{ color: '#6b7280', fontSize: '14px', textAlign: 'center', margin: 0 }}>{conversation.otherUser?.niveau || "Student"}</p>
            <p style={{ color: '#9ca3af', fontSize: '13px', marginTop: '8px' }}>{conversation.otherUser?.email}</p>
          </div>
        )}

        {/* Add Member & Invite Link */}
        {isGroup && (
          <div style={{ background: 'white', padding: '10px 0', marginBottom: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            {!showAddMember ? (
              <>
                {isOwner && (
                  <button onClick={() => setShowAddMember(true)} style={{ width: '100%', padding: '15px 20px', display: 'flex', alignItems: 'center', gap: '15px', background: 'none', border: 'none', cursor: 'pointer', color: '#111b21', fontSize: '16px', textAlign: 'left' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#00a884', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <UserPlus size={20} color="white" />
                    </div>
                    Add participant
                  </button>
                )}
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
                  <input type="text" placeholder="Search student name..." value={memberSearchQuery} onChange={handleMemberSearch} style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ddd', outline: 'none' }} autoFocus />
                </div>
                {memberSearchResults.length > 0 && (
                  <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '4px', marginBottom: '10px' }}>
                    {memberSearchResults.map(u => {
                      let avatarSrc = null;
                      if (u.iduser) {
                         avatarSrc = localStorage.getItem(`profile_image_${u.iduser}`);
                      }
                      if (!avatarSrc && u.photo) {
                         avatarSrc = u.photo;
                      }
                      return (
                      <div key={u.iduser} onClick={() => handleAddSpecificMember(u.iduser)} style={{ padding: '8px', borderBottom: '1px solid #f5f5f5', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#111b21' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#ddd', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {avatarSrc ? <img src={avatarSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={14} color="#666" />}
                        </div>
                        <span>{u.prenom || u.firstname || u.nom || u.lastname || u.email || "Utilisateur"}</span>
                      </div>
                    )})}
                  </div>
                )}
                <button type="button" onClick={() => setShowAddMember(false)} style={{ background: '#f0f2f5', color: '#54656f', border: 'none', borderRadius: '4px', padding: '8px 12px', cursor: 'pointer' }}><X size={18} /></button>
              </div>
            )}
          </div>
        )}

        {/* Members List */}
        {isGroup && (
          <div style={{ background: 'white', padding: '10px 0', marginBottom: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <div style={{ padding: '10px 20px', color: '#667781', fontSize: '14px', fontWeight: '500' }}>{(conversation.members || []).filter(m => !m.leftAt).length} participants</div>
            {(conversation.members || []).filter(m => !m.leftAt).map(member => {
              let memberImage = localStorage.getItem(`profile_image_${member.iduser}`);
              if (!memberImage && member.photo && (member.photo.startsWith('data:') || member.photo.startsWith('http') || member.photo.startsWith('/'))) {
                memberImage = member.photo;
              }
              return (
                <div key={member.iduser} style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', borderBottom: '1px solid #f0f2f5' }}>
                  <div 
                    style={{ flex: 1, display: 'flex', alignItems: 'center', cursor: 'pointer', borderRadius: '8px', padding: '4px' }}
                    title={`View profile of ${member.prenom} ${member.nom}`}
                    onClick={() => handleMemberClick(member.iduser)}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#dfe3e5', marginRight: '15px', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      {memberImage ? <img src={memberImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Users size={20} color="#fff" />}
                    </div>
                    <div>
                      <div style={{ color: '#111b21', fontSize: '16px' }}>{member.prenom} {member.nom} {String(member.iduser) === String(currentUserId) && "(You)"}</div>
                      {member.role === 'OWNER' && <span style={{ fontSize: '12px', color: '#00a884', background: '#e7fce3', padding: '2px 6px', borderRadius: '4px', marginTop: '2px', display: 'inline-block' }}>Group Admin</span>}
                    </div>
                  </div>
                  {String(member.iduser) !== String(currentUserId) && (
                    <button onClick={() => handleMessageUser(member.iduser)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#00a884', padding: '8px' }} title="Message"><MessageCircle size={20} /></button>
                  )}
                  {isOwner && String(member.iduser) !== String(currentUserId) && (
                    <div style={{ display: 'flex' }}>
                      <button onClick={() => handleTransferOwnershipClick(member)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f59e0b', padding: '8px' }} title="Promote to Admin"><Shield size={18} /></button>
                      <button onClick={() => handleRemoveMemberClick(member)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ea0038', padding: '8px' }} title="Remove member"><UserMinus size={18} /></button>
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
            <div style={{ padding: '10px 20px', color: '#667781', fontSize: '14px', fontWeight: '500' }}>{commonGroups.length} groupes en commun</div>
            {commonGroups.map(g => (
              <div key={g.idconversation} onClick={() => navigate(`/conversations/${g.idconversation}`)} style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', borderBottom: '1px solid #f0f2f5', cursor: 'pointer' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#dfe3e5', marginRight: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={20} color="#fff" /></div>
                <div style={{ color: '#111b21', fontSize: '16px' }}>{g.title || g.name}</div>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div style={{ background: 'white', padding: '10px 0', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          {isGroup ? (
            <button onClick={handleLeaveGroupClick} style={{ width: '100%', padding: '15px 20px', display: 'flex', alignItems: 'center', gap: '15px', background: 'none', border: 'none', cursor: 'pointer', color: '#ea0038', fontSize: '16px', textAlign: 'left' }}><LogOut size={20} /> Exit group</button>
          ) : (
            <button onClick={handleHideConversationClick} style={{ width: '100%', padding: '15px 20px', display: 'flex', alignItems: 'center', gap: '15px', background: 'none', border: 'none', cursor: 'pointer', color: '#ea0038', fontSize: '16px', textAlign: 'left' }}><Trash2 size={20} /> Delete conversation</button>
          )}
          {isGroup && isOwner && (
            <button onClick={handleDeleteGroupClick} style={{ width: '100%', padding: '15px 20px', display: 'flex', alignItems: 'center', gap: '15px', background: 'none', border: 'none', cursor: 'pointer', color: '#ea0038', fontSize: '16px', textAlign: 'left' }}><Trash2 size={20} /> Delete group</button>
          )}
        </div>
      </div>

      {/* Modals */}
      {/* Leave Group Confirmation Modal */}
      {showLeaveModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', width: '90%', maxWidth: '350px', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', textAlign: 'center' }}>
            {leaveError ? (
              <><h3 style={{ margin: '0 0 10px 0', color: '#ea0038' }}>Unable to exit</h3><p style={{ color: '#667781', marginBottom: '20px', fontSize: '14px' }}>{leaveError}</p><button onClick={() => setShowLeaveModal(false)} style={{ background: '#f0f2f5', border: 'none', padding: '8px 24px', borderRadius: '20px', cursor: 'pointer', color: '#111b21', fontWeight: '500' }}>OK</button></>
            ) : (
              <><h3 style={{ margin: '0 0 10px 0', color: '#111b21' }}>Exit group?</h3><p style={{ color: '#667781', marginBottom: '20px', fontSize: '14px' }}>Are you sure you want to exit "{getConvName()}"?</p>{isOwner && (<p style={{ color: '#ea0038', fontSize: '13px', fontWeight: 'bold', marginBottom: '15px' }}>⚠️ You are the group admin. You must transfer ownership to another member before you can leave.</p>)}<div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}><button onClick={() => setShowLeaveModal(false)} style={{ background: 'none', border: '1px solid #ddd', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', color: '#111b21', fontWeight: '500' }}>Cancel</button><button onClick={confirmLeaveGroup} style={{ background: '#ea0038', border: 'none', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', color: 'white', fontWeight: '500' }}>Exit</button></div></>
            )}
          </div>
        </div>
      )}

      {/* Delete Group Confirmation Modal */}
      {showDeleteModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', width: '90%', maxWidth: '350px', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', textAlign: 'center' }}>
            {deleteError ? (
              <><h3 style={{ margin: '0 0 10px 0', color: '#ea0038' }}>Error</h3><p style={{ color: '#667781', marginBottom: '20px', fontSize: '14px' }}>{deleteError}</p><button onClick={() => setShowDeleteModal(false)} style={{ background: '#f0f2f5', border: 'none', padding: '8px 24px', borderRadius: '20px', cursor: 'pointer', color: '#111b21', fontWeight: '500' }}>OK</button></>
            ) : (
              <><h3 style={{ margin: '0 0 10px 0', color: '#111b21' }}>Delete group?</h3><p style={{ color: '#667781', marginBottom: '20px', fontSize: '14px' }}>Are you sure you want to delete "{getConvName()}" permanently?</p><div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}><button onClick={() => setShowDeleteModal(false)} style={{ background: 'none', border: '1px solid #ddd', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', color: '#111b21', fontWeight: '500' }}>Cancel</button><button onClick={confirmDeleteGroup} style={{ background: '#ea0038', border: 'none', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', color: 'white', fontWeight: '500' }}>Delete</button></div></>
            )}
          </div>
        </div>
      )}

      {/* Hide Conversation Confirmation Modal */}
      {showHideModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', width: '90%', maxWidth: '350px', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#111b21' }}>Delete conversation?</h3>
            <p style={{ color: '#667781', marginBottom: '20px', fontSize: '14px' }}>Delete this conversation from your list? It will reappear if you receive a new message.</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowHideModal(false)} style={{ background: 'none', border: '1px solid #ddd', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', color: '#111b21', fontWeight: '500' }}>Cancel</button>
              <button onClick={confirmHideConversation} style={{ background: '#ea0038', border: 'none', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', color: 'white', fontWeight: '500' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Member Confirmation Modal */}
      {showRemoveMemberModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', width: '90%', maxWidth: '350px', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#111b21' }}>Remove member?</h3>
            <p style={{ color: '#6b7280', marginBottom: '20px', fontSize: '14px' }}>Are you sure you want to remove {memberToRemove?.prenom} {memberToRemove?.nom} from the group?</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}><button onClick={() => setShowRemoveMemberModal(false)} style={{ background: 'none', border: '1px solid #ddd', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', color: '#111b21', fontWeight: '500' }}>Cancel</button><button onClick={confirmRemoveMember} style={{ background: '#ea0038', border: 'none', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', color: 'white', fontWeight: '500' }}>Remove</button></div>
          </div>
        </div>
      )}

      {/* Transfer Ownership Confirmation Modal */}
      {showTransferModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', width: '90%', maxWidth: '350px', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#111b21' }}>Transfer ownership?</h3>
            <p style={{ color: '#6b7280', marginBottom: '20px', fontSize: '14px' }}>Do you want to transfer admin rights to {memberToTransfer?.prenom} {memberToTransfer?.nom}? You will become a regular member.</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}><button onClick={() => setShowTransferModal(false)} style={{ background: 'none', border: '1px solid #ddd', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', color: '#111b21', fontWeight: '500' }}>Cancel</button><button onClick={confirmTransferOwnership} style={{ background: '#00a884', border: 'none', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', color: 'white', fontWeight: '500' }}>Confirm</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationSidebar;