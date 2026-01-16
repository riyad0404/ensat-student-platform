import React, { useState } from 'react';
import { createPost } from '../api/postAPI';
import '../styles/CreatePostModal.css';

const CreatePostModal = ({ isOpen, onClose, onPostCreated }) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Veuillez sélectionner une image valide');
        return;
      }
      setImage(file);
      setError('');
      const reader = new FileReader();
      reader.onloadend = () => { setImagePreview(reader.result); };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('contenu', content);
      formData.append('isAnonymat', 'false');

      if (image) {
        formData.append('typeContenu', 'DOCUMENT');
        // CRUCIAL: 'file' doit correspondre au champ configuré dans votre route backend
        formData.append('file', image); 
        formData.append('niveau', 'ING1'); 
      } else {
        formData.append('typeContenu', 'TEXTE');
      }

      const response = await createPost(formData);
      
      // Fusion des données pour l'affichage immédiat sans rafraîchir
      // On s'adapte au retour du backend : { post, document }
      const postToDisplay = response.post ? { 
        ...response.post, 
        isAnonymat: false,  // Assurer que c'est non-anonyme
        image: response.document?.url,  // Aplatir l'URL du document pour affichage
        document: response.document 
      } : response;

      if (onPostCreated) onPostCreated(postToDisplay);
      
      setContent('');
      setImage(null);
      setImagePreview(null);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création');
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
              disabled={loading}
              rows={5}
            />
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Aperçu" />
                <button type="button" className="remove-image-btn" onClick={() => {setImage(null); setImagePreview(null);}}>×</button>
              </div>
            )}
            <div className="upload-section">
              <label className="upload-btn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                </svg>
                <span>Photo/Image</span>
                <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
              </label>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={onClose}>Annuler</button>
            <button type="submit" className="submit-btn" disabled={loading || !content.trim()}>
              {loading ? 'Publication...' : 'Publier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;