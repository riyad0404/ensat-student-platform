import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/edit-profile.css';

const EditProfile = () => {
    const { user, updateProfile } = useAuth();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        firstName: user.prenom ,
        lastName: user.nom ,
        level: user.niveau ,
        about: user.description || 'Short personal description',
        email: user.email ,
        secretCode: '',
        password: ''
    });
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            await updateProfile({
                prenom: formData.firstName,
                nom: formData.lastName,
                niveau: formData.level,
                description: formData.about,
                email: formData.email
            });
            
            navigate('/profile');
        } catch (error) {
            console.error('Erreur lors de la mise à jour:', error);
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
                            />
                        </div>
                        
                        {/* Code Secret */}
                        <div className="form-group">
                            <label htmlFor="secretCode">Code Secret</label>
                            <input
                                type="password"
                                id="secretCode"
                                name="secretCode"
                                value={formData.secretCode}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Enter Your code secret"
                            />
                        </div>
                        
                        {/* Password */}
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Enter Your password"
                            />
                        </div>
                        
                        {/* Buttons */}
                        <div className="form-actions">
                            <button 
                                type="button" 
                                className="cancel-btn"
                                onClick={handleCancel}
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className="save-btn"
                            >
                                Save
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditProfile;