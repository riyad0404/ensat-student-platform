import React, { useState, useEffect } from 'react';
import { createPost, updatePost } from '../api/postAPI';
import '../styles/CreatePostModal.css';

const CreatePostModal = ({ isOpen, onClose, onPostCreated, postToEdit }) => {
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [niveau, setNiveau] = useState('GINF1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (postToEdit) {
        setContent(postToEdit.contenu || '');
        setNiveau(postToEdit.niveau || 'GINF1');
        setIsAnonymous(postToEdit.isAnonymat === true || postToEdit.isAnonymat === 'true');
        // Note: Handling existing files for edit is complex, usually we just let them replace it
        setFile(null);
        setFilePreview(null);
      } else {
        setContent('');
        setFile(null);
        setFilePreview(null);
        setNiveau('GINF1');
        setIsAnonymous(false);
      }
      setError('');
    } else {
      setContent('');
    }
  }, [isOpen, postToEdit]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => setFilePreview(reader.result);
        reader.readAsDataURL(selectedFile);
      } else {
        setFilePreview(selectedFile.name);
      }
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!content.trim() && !file) {
    setError('Add content or a file');
    return;
  }

  setLoading(true);
  setError('');

  try {
    let response;
    
    if (postToEdit) {
        // Update logic
        response = await updatePost(postToEdit.idpost, { contenu: content.trim(), isAnonymat: isAnonymous });
    } else {
        // Create logic
        const formData = new FormData();
        formData.append('contenu', content.trim());
        formData.append('isAnonymat', isAnonymous ? 'true' : 'false');

        if (file) {
          formData.append('file', file);
          formData.append('niveau', niveau);
        }
        response = await createPost(formData);
    }
    
    console.log('🔍 Réponse complète du backend:', response);
    
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
          <h2>{postToEdit ? 'Edit Post' : 'Create a post'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="error-message">{error}</div>}
            
            <textarea 
              className="post-textarea" 
              placeholder="What's on your mind?" 
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
              rows={5} 
            />
            
            {filePreview && (
              <div className="file-preview">
                {file && file.type.startsWith('image/') ? (
                  <img src={filePreview} alt="Aperçu" />
                ) : (
                  <div className="document-preview">
                    <p>📄 {filePreview}</p>
                  </div>
                )}
                <button
                  type="button"
                  className="remove-file-btn"
                  onClick={() => {
                    setFile(null);
                    setFilePreview(null);
                  }}
                >
                  ×
                </button>
              </div>
            )}

            <div className="upload-section">
              <label className="upload-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                </svg>
                <span>Add file</span>
                <input
                  type="file"
                  accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </label>

              {file && (
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
              <span className="mode-label">Publication mode</span>
              <div 
                className={`mode-switch ${isAnonymous ? 'is-anonymous' : 'is-public'}`} 
                onClick={() => setIsAnonymous(!isAnonymous)}
              >
                <div className="mode-option public">Public</div>
                <div className="mode-option anonymous">Anonymous</div>
                <div className="mode-slider"></div>
              </div>
            </div>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={loading || (!content.trim() && !file)}
            >
              {loading ? (postToEdit ? 'Saving...' : 'Publishing...') : (postToEdit ? 'Save Changes' : 'Publish')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;