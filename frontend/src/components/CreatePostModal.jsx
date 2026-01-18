import React, { useState, useEffect } from 'react';
import { createPost } from '../api/postAPI';
import '../styles/CreatePostModal.css';

const CreatePostModal = ({ isOpen, onClose, onPostCreated }) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [niveau, setNiveau] = useState('GINF1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setContent('');
      setImage(null);
      setImagePreview(null);
      setNiveau('GINF1');
      setIsAnonymous(false);
      setError('');
    }
  }, [isOpen]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      alert('Veuillez sélectionner une image valide');
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!content.trim() && !image) {
    setError('Ajoutez du contenu ou une image');
    return;
  }

  setLoading(true);
  setError('');
  
  try {
    const formData = new FormData();
    formData.append('contenu', content.trim());
    formData.append('isAnonymat', isAnonymous ? 'true' : 'false');
    
    if (image) {
      formData.append('file', image);
      formData.append('niveau', niveau);
    }

    console.log('🔵 Envoi au backend...');
    const response = await createPost(formData);
    
    console.log('🔍 Réponse complète du backend:', response);
    console.log('📎 Documents dans la réponse:', response.documents);
    console.log('📊 Type de documents:', typeof response.documents);
    console.log('📊 Est un array?', Array.isArray(response.documents));
    
    if (response.documents && response.documents.length > 0) {
      console.log('✅ Document trouvé:', response.documents[0]);
    } else {
      console.log('❌ Aucun document dans la réponse!');
    }

    if (onPostCreated) {
      console.log('📤 Envoi du post à HomePage...');
      onPostCreated(response);
    }
    
    onClose();
    
  } catch (err) {
    console.error('❌ Erreur:', err);
    setError(err.response?.data?.message || 'Erreur');
  } finally {
    setLoading(false);
  }
};

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Créer un post</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="error-message">{error}</div>}
            
            <textarea 
              className="post-textarea" 
              placeholder="Qu'avez-vous en tête ?" 
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
              rows={5} 
            />
            
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Aperçu" />
                <button 
                  type="button" 
                  className="remove-image-btn" 
                  onClick={() => {
                    setImage(null);
                    setImagePreview(null);
                  }}
                >
                  ×
                </button>
              </div>
            )}

            <div className="upload-section">
              <label className="upload-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '6px'}}>
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                <span>Ajouter une photo</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange} 
                  style={{ display: 'none' }} 
                />
              </label>
              
              {image && (
                <select 
                  value={niveau} 
                  onChange={(e) => setNiveau(e.target.value)}
                  className="niveau-select-modal"
                >
                  <optgroup label="Prépa">
                    <option value="AP1">AP1</option>
                    <option value="AP2">AP2</option>
                  </optgroup>
                  <optgroup label="Génie Informatique">
                    <option value="GINF1">GINF1</option>
                    <option value="GINF2">GINF2</option>
                    <option value="GINF3">GINF3</option>
                  </optgroup>
                  <optgroup label="Génie Logiciel">
                    <option value="GIL1">GIL1</option>
                    <option value="GIL2">GIL2</option>
                    <option value="GIL3">GIL3</option>
                  </optgroup>
                  <optgroup label="Génie des Systèmes et Réseaux">
                    <option value="GSR1">GSR1</option>
                    <option value="GSR2">GSR2</option>
                    <option value="GSR3">GSR3</option>
                  </optgroup>
                  <optgroup label="Génie Électrique et Informatique Industrielle">
                    <option value="G2EI1">G2EI1</option>
                    <option value="G2EI2">G2EI2</option>
                    <option value="G2EI3">G2EI3</option>
                  </optgroup>
                  <optgroup label="Génie des Systèmes Électriques et Automatiques">
                    <option value="GSEA1">GSEA1</option>
                    <option value="GSEA2">GSEA2</option>
                    <option value="GSEA3">GSEA3</option>
                  </optgroup>
                  <optgroup label="Génie des Systèmes de Communication">
                    <option value="GSYC1">GSYC1</option>
                    <option value="GSYC2">GSYC2</option>
                    <option value="GSYC3">GSYC3</option>
                  </optgroup>
                </select>
              )}
            </div>

            <div className="publication-mode-container">
              <span className="mode-label">Mode de publication</span>
              <div 
                className={`mode-switch ${isAnonymous ? 'is-anonymous' : 'is-public'}`} 
                onClick={() => setIsAnonymous(!isAnonymous)}
              >
                <div className="mode-option public">Public</div>
                <div className="mode-option anonymous">Anonyme</div>
                <div className="mode-slider"></div>
              </div>
            </div>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Annuler
            </button>
            <button 
              type="submit" 
              className="submit-btn" 
              disabled={loading || (!content.trim() && !image)}
            >
              {loading ? '⏳ Publication...' : '📤 Publier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;