import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/edit-profile.css';
import { FiEye, FiEyeOff } from 'react-icons/fi'; // ⚠️ IMPORTEZ LES ICÔNES

const EditProfile = () => {
    const { user, updateProfile } = useAuth();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        firstName: user.prenom ,
        lastName: user.nom ,
        level: user.niveau ,
        about: user.bio || 'Short personal description',
        email: user.email ,
        secretCode: '',
        password: ''
    });
    
    const [passwordError, setPasswordError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Mettre à jour immédiatement
    const updatedFormData = {
        ...formData,
        [name]: value
    };
    
    setFormData(updatedFormData);
    
    // Vérifier la confirmation AVEC LES NOUVELLES VALEURS
    if (name === 'newPassword' || name === 'confirmPassword') {
        const newPass = name === 'newPassword' ? value : updatedFormData.newPassword;
        const confirmPass = name === 'confirmPassword' ? value : updatedFormData.confirmPassword;
        
        // Vérifier seulement quand les deux ont une valeur
        if (newPass && confirmPass) {
            if (newPass !== confirmPass) {
                setPasswordError('Les mots de passe ne correspondent pas');
            } else {
                setPasswordError('');
            }
        } else {
            // Si un des champs est vide, pas d'erreur
            setPasswordError('');
        }
    }
    
    // Effacer le message quand l'utilisateur tape
    if (message) setMessage('');
};

const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Réinitialiser les messages
    setPasswordError('');
    setMessage('');
    
    // Vérifier si l'utilisateur veut changer son mot de passe
    const wantsToChangePassword = formData.currentPassword || 
                                 formData.newPassword || 
                                 formData.confirmPassword;
    
    if (wantsToChangePassword) {
        // Si un champ de mot de passe est rempli, tous doivent l'être
        if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
            setMessage('Pour changer le mot de passe, remplissez tous les champs de mot de passe');
            return;
        }
        
        // Vérifier que les nouveaux mots de passe correspondent
        if (formData.newPassword !== formData.confirmPassword) {
            setPasswordError('Les mots de passe ne correspondent pas');
            return;
        }
        
        // Vérifier que le nouveau mot de passe est différent
        if (formData.currentPassword === formData.newPassword) {
            setMessage('Le nouveau mot de passe doit être différent de l\'actuel');
            return;
        }
        
        // Vérifier la longueur minimale
        if (formData.newPassword.length < 6) {
            setMessage('Le mot de passe doit contenir au moins 6 caractères');
            return;
        }
    }
    
    setLoading(true);
    
    try {
        // ⚠️ **CORRECTION IMPORTANTE** : Utiliser les noms attendus par le backend
        const dataToSend = {};
        
        // ⚠️ CORRECTIF : Utiliser 'prenom' et 'nom' au lieu de 'firstName' et 'lastName'
        if (formData.firstName !== user.prenom) dataToSend.prenom = formData.firstName;
        if (formData.lastName !== user.nom) dataToSend.nom = formData.lastName;
        if (formData.level !== user.niveau) dataToSend.niveau = formData.level;
        if (formData.about !== user.bio) dataToSend.bio = formData.about;
        if (formData.email !== user.email) dataToSend.email = formData.email;
        
        // ⚠️ CORRECTION : Vérifier d'abord les changements sur les autres champs
        const hasProfileChanges = Object.keys(dataToSend).length > 0;
        const hasPasswordChanges = wantsToChangePassword && 
                                  formData.currentPassword && 
                                  formData.newPassword && 
                                  formData.confirmPassword;
        
        // Si pas de changements du tout
        if (!hasProfileChanges && !hasPasswordChanges) {
            setMessage('Aucune modification détectée');
            setLoading(false);
            return;
        }
        
        // Ajouter les champs de mot de passe si nécessaire
        if (hasPasswordChanges) {
            dataToSend.currentPassword = formData.currentPassword;
            dataToSend.newPassword = formData.newPassword;
        }
        
        console.log('📤 Données envoyées au serveur:', dataToSend);
        
        try {
            await updateProfile({
                prenom: formData.firstName,
                nom: formData.lastName,
                niveau: formData.level,
                bio: formData.about,
                email: formData.email
            });
            
            // Si erreur de mot de passe, réinitialiser le champ currentPassword
            if (errorMsg.includes('mot de passe') || errorMsg.includes('password')) {
                setFormData(prev => ({
                    ...prev,
                    currentPassword: ''
                }));
            }
        }
    } catch (error) {
        console.error('Erreur lors de la mise à jour:', error);
        setMessage('Erreur de connexion au serveur');
    } finally {
        setLoading(false);
    }
};
    
    const handleCancel = () => {
        navigate('/profile');
    };
    
    return (
        <div className="edit-profile-page">
            <div className="edit-profile-container">
                <div className="edit-profile-card">
                    <h1 className="edit-profile-title">Edit Profile</h1>
                    
                    {/* Message de statut */}
                    {message && (
                        <div className={`edit-message ${message.includes('succès') ? 'success' : message.includes('Aucune') ? 'info' : 'error'}`}>
                            {message}
                        </div>
                    )}
                    
                    {/* Petit texte d'information */}
                    <div className="edit-info">
                        <p><small>💡 <strong>Tip:</strong> Modify only the fields you want to change. Leave others as they are.</small></p>
                    </div>
                    
                    <form onSubmit={handleSubmit}>
                        {/* First Name and Last Name */}
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="firstName">First Name</label>
                                <input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Enter Your first name"
                                    disabled={loading}
                                />
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="lastName">Last Name</label>
                                <input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Enter Your last name"
                                    disabled={loading}
                                />
                            </div>
                        </div>
                        
                        {/* Level */}
                        <div className="form-group">
                            <label htmlFor="level">Level</label>
                            <input
                                type="text"
                                id="level"
                                name="level"
                                value={formData.level}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Enter Your level"
                                disabled={loading}
                            />
                        </div>
                        
                        {/* About Me */}
                        <div className="form-group">
                            <label htmlFor="about">About Me</label>
                            <textarea
                                id="about"
                                name="about"
                                value={formData.about}
                                onChange={handleChange}
                                className="form-textarea"
                                rows="3"
                                placeholder="Short personal description"
                                disabled={loading}
                            />
                        </div>
                        
                        {/* Email */}
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Enter Your email"
                                disabled={loading}
                            />
                        </div>
                        
                        {/* Section pour changer le mot de passe */}
                        <div className="password-section">
                            <h3>Change Password </h3>
                            
                            {/* Current Password avec icône œil comme login */}
                            <div className="form-group">
                                <label htmlFor="currentPassword">Current Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showCurrentPassword ? "text" : "password"}
                                        id="currentPassword"
                                        name="currentPassword"
                                        value={formData.currentPassword}
                                        onChange={handleChange}
                                        className="form-input"
                                        placeholder="Enter your current password"
                                        disabled={loading}
                                    />
                                    <span 
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        style={{ 
                                            position: 'absolute',
                                            right: '15px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            cursor: 'pointer',
                                            color: '#666',
                                            display: 'flex',
                                            alignItems: 'center',
                                            zIndex: 10,
                                            transition: 'color 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.color = '#4a90e2'}
                                        onMouseLeave={(e) => e.currentTarget.style.color = '#666'}
                                    >
                                        {showCurrentPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                                    </span>
                                </div>
                            </div>
                            
                            {/* New Password avec icône œil comme login */}
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="newPassword">New Password</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            id="newPassword"
                                            name="newPassword"
                                            value={formData.newPassword}
                                            onChange={handleChange}
                                            className="form-input"
                                            placeholder="Enter new password"
                                            disabled={loading}
                                        />
                                        <span 
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            style={{ 
                                                position: 'absolute',
                                                right: '15px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                cursor: 'pointer',
                                                color: '#666',
                                                display: 'flex',
                                                alignItems: 'center',
                                                zIndex: 10,
                                                transition: 'color 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.color = '#4a90e2'}
                                            onMouseLeave={(e) => e.currentTarget.style.color = '#666'}
                                        >
                                            {showNewPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="confirmPassword">Confirm Password</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className="form-input"
                                            placeholder="Confirm new password"
                                            disabled={loading}
                                        />
                                        <span 
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            style={{ 
                                                position: 'absolute',
                                                right: '15px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                cursor: 'pointer',
                                                color: '#666',
                                                display: 'flex',
                                                alignItems: 'center',
                                                zIndex: 10,
                                                transition: 'color 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.color = '#4a90e2'}
                                            onMouseLeave={(e) => e.currentTarget.style.color = '#666'}
                                        >
                                            {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            {passwordError && (
                                <div className="error-message">{passwordError}</div>
                            )}
                            
                            <div className="password-note">
                                <p><small>⚠️ Fill all three password fields only if you want to change your password.</small></p>
                            </div>
                        </div>
                        
                        {/* Buttons */}
                        <div className="form-actions">
                            <button 
                                type="button" 
                                className="cancel-btn"
                                onClick={handleCancel}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className="save-btn"
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditProfile;