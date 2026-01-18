import React, { useState, useEffect } from 'react';
import { createPost } from '../api/postAPI';
import '../styles/CreatePostModal.css';

const CreatePostModal = ({ isOpen, onClose, onPostCreated }) => {
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [niveau, setNiveau] = useState('GINF1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setContent('');
      setFile(null);
      setFilePreview(null);
      setNiveau('GINF1');
      setIsAnonymous(false);
      setError('');
    }
  }, [isOpen]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Accept images and documents
      const allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain'
      ];

      if (allowedTypes.includes(selectedFile.type) || selectedFile.name.match(/\.(pdf|doc|docx|ppt|pptx|xls|xlsx|txt)$/i)) {
        setFile(selectedFile);

        if (selectedFile.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onloadend = () => setFilePreview(reader.result);
          reader.readAsDataURL(selectedFile);
        } else {
          setFilePreview(null); // No preview for documents
        }
      } else {
        alert('Type de fichier non supporté. Utilisez des images, PDF, documents Word, PowerPoint, Excel ou texte.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim() && !file) {
      setError('Ajoutez du contenu ou un fichier');
      return;
    }

    if (file && !niveau) {
      setError('Le niveau est obligatoire pour un document');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('contenu', content.trim());
      formData.append('isAnonymat', isAnonymous ? 'true' : 'false');

      if (file) {
        formData.append('typeContenu', 'DOCUMENT');
        formData.append('file', file);
        formData.append('niveau', niveau);
      } else {
        formData.append('typeContenu', 'TEXTE');
      }

      console.log('📤 Création du post...');
      const newPost = await createPost(formData);
      console.log('✅ Post créé:', newPost);

      if (onPostCreated) {
        onPostCreated(newPost);
      }

      onClose();

    } catch (err) {
      console.error('❌ Erreur création post:', err);
      setError(err.response?.data?.message || 'Erreur lors de la création du post');
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType === 'application/pdf') return '📄';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '📊';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📈';
    return '📎';
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

            {filePreview && file?.type.startsWith('image/') && (
              <div className="image-preview">
                <img src={filePreview} alt="Aperçu" />
                <button
                  type="button"
                  className="remove-image-btn"
                  onClick={() => {
                    setFile(null);
                    setFilePreview(null);
                  }}
                >
                  ×
                </button>
              </div>
            )}

            {file && !file.type.startsWith('image/') && (
              <div className="file-preview">
                <div className="file-info">
                  <span className="file-icon">{getFileIcon(file.type)}</span>
                  <span className="file-name">{file.name}</span>
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
              </div>
            )}

            <div className="upload-section">
              <label className="upload-btn">
                <span>📎 Joindre un fichier</span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif,.webp"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </label>

              {file && (
                <select
                  value={niveau}
                  onChange={(e) => setNiveau(e.target.value)}
                  className="niveau-select-modal"
                  required
                >
                  <option value="">📚 Sélectionner le niveau</option>
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
              disabled={loading || (!content.trim() && !file)}
            >
              {loading ? ' Publication...' : ' Publier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;
