import React, { useState, useEffect } from 'react';
import { createPost, updatePost } from '../api/postAPI';
import '../styles/CreatePostModal.css';

const CreatePostModal = ({ isOpen, onClose, onPostCreated, postToEdit }) => {
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]); // Pour gérer les fichiers existants en édition
  const [fileLevels, setFileLevels] = useState([]); // Tableau des niveaux pour chaque fichier
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (postToEdit) {
        setContent(postToEdit.contenu || '');
        setIsAnonymous(postToEdit.isAnonymat === true || postToEdit.isAnonymat === 'true');
        
        // Gérer le fichier existant
        setExistingFiles(postToEdit.documents || (postToEdit.document ? [postToEdit.document] : []));
        
        setFiles([]);
        setFileLevels([]);
      } else {
        setContent('');
        setFiles([]);
        setExistingFiles([]);
        setFileLevels([]);
        setIsAnonymous(false);
      }
      setError('');
    } else {
      setContent('');
    }
  }, [isOpen, postToEdit]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 0) {
      setFiles(prev => [...prev, ...selectedFiles]);
      // Ajouter un niveau par défaut (GINF1) pour chaque nouveau fichier
      setFileLevels(prev => [...prev, ...selectedFiles.map(() => 'GINF1')]);
    }
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setFileLevels(prev => prev.filter((_, i) => i !== index));
  };

  const handleLevelChange = (index, newLevel) => {
    setFileLevels(prev => {
      const newLevels = [...prev];
      newLevels[index] = newLevel;
      return newLevels;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation : il faut au moins du texte OU un fichier (nouveau ou existant)
    if (!content.trim() && files.length === 0 && existingFiles.length === 0) {
      setError('Add content or files');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let response;
      const formData = new FormData();
      formData.append('contenu', content.trim());
      formData.append('isAnonymat', isAnonymous ? 'true' : 'false');
      
      if (postToEdit) {
        // Update logic
        if (files.length > 0) {
          files.forEach((file, index) => {
            formData.append('files', file);
            formData.append('niveau', fileLevels[index]);
          });
        }
        
        // Calculer les fichiers supprimés
        const originalDocs = postToEdit.documents || (postToEdit.document ? [postToEdit.document] : []);
        const originalIds = originalDocs.map(d => d.iddoc);
        const currentIds = existingFiles.map(d => d.iddoc);
        const idsToDelete = originalIds.filter(id => !currentIds.includes(id));
        
        idsToDelete.forEach(id => formData.append('deleteFileIds', id));

        response = await updatePost(postToEdit.idpost, formData);
      } else {
        // Create logic
        if (files.length > 0) {
          files.forEach((file, index) => {
            formData.append('files', file);
            formData.append('niveau', fileLevels[index]);
          });
        }
        response = await createPost(formData);
      }
      
      console.log('🔍 Réponse complète du backend:', response);
      
      if (onPostCreated) {
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
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ 
            margin: 0, 
            fontSize: '22px', 
            fontWeight: '700', 
            background: 'linear-gradient(135deg, #0040D0 0%, #E7A33E 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            color: 'transparent',
            width: 'fit-content'
          }}>{postToEdit ? 'Edit Post' : 'Create a post'}</h2>
          <button className="close-btn" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px', color: '#666' }}>×</button>
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
            
            {/* Aperçu du NOUVEAU fichier */}
            {files.length > 0 && (
              <div className="files-list">
                {files.map((file, index) => (
                  <div key={index} className="file-preview">
                    {file.type.startsWith('image/') ? (
                      <img src={URL.createObjectURL(file)} alt="Preview" />
                    ) : (
                      <div className="document-preview">
                        <p>📄 {file.name}</p>
                      </div>
                    )}
                    
                    {/* Sélecteur de niveau PAR FICHIER */}
                    <select 
                      value={fileLevels[index]} 
                      onChange={(e) => handleLevelChange(index, e.target.value)}
                      className="niveau-select-modal"
                      style={{ marginTop: '8px', width: '100%', fontSize: '12px', padding: '6px' }}
                      onClick={(e) => e.stopPropagation()}
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

                    <button
                      type="button"
                      className="remove-file-btn"
                      onClick={() => removeFile(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Aperçu du FICHIER EXISTANT */}
            {existingFiles.length > 0 && (
               <div className="files-list existing">
                  {existingFiles.map((doc, index) => (
                    <div key={doc.iddoc || index} className="file-preview existing">
                        {(doc.type === 'IMAGE' || doc.url?.match(/\.(jpg|jpeg|png|gif|webp)$/i)) ? (
                            <img src={doc.url} alt="Existing" />
                        ) : (
                            <div className="document-preview">
                              <p>📄 {doc.filename}</p>
                            </div>
                        )}
                        <button
                          type="button"
                          className="remove-file-btn"
                          onClick={() => setExistingFiles(prev => prev.filter((_, i) => i !== index))}
                          title="Remove file"
                        >
                          ×
                        </button>
                    </div>
                  ))}
               </div>
            )}

            <div className="upload-section">
              <label className="upload-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                </svg>
                <span>{postToEdit && existingFiles.length > 0 ? "Add more files" : "Add files"}</span>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </label>

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
          
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button 
                  type="button" 
                  onClick={onClose}
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
                  disabled={loading || (!content.trim() && files.length === 0 && existingFiles.length === 0)}
                  style={{
                    height: '44px', borderRadius: '25px', background: 'linear-gradient(90deg, #4a82fc, #0040D0)', 
                    color: 'white', fontWeight: '700', fontSize: '14px', border: 'none', 
                    padding: '0 30px', cursor: 'pointer', transition: 'all 0.3s ease',
                    opacity: (loading || (!content.trim() && files.length === 0 && existingFiles.length === 0)) ? 0.7 : 1,
                    cursor: (loading || (!content.trim() && files.length === 0 && existingFiles.length === 0)) ? 'not-allowed' : 'pointer'
                  }}
                  onMouseEnter={(e) => !(loading || (!content.trim() && files.length === 0 && existingFiles.length === 0)) && (e.target.style.transform = 'translateY(-1px)')}
                  onMouseLeave={(e) => !(loading || (!content.trim() && files.length === 0 && existingFiles.length === 0)) && (e.target.style.transform = 'translateY(0)')}
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
