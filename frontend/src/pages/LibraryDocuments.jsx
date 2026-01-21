import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/LibraryDocuments.css';

const LibraryDocuments = () => {
  const { niveau } = useParams();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState(null);

  const loadDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Appel API pour récupérer les documents du niveau spécifié
      const response = await fetch(`http://localhost:5000/api/library/documents/${niveau}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des documents');
      }
      
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      console.error('Erreur chargement documents:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [niveau]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleDownload = async (doc) => {
    try {
      // Télécharger depuis votre serveur backend
      const response = await fetch(`http://localhost:5000/api/documents/download/${doc.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Erreur de téléchargement');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.filename;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);

      // Incrémenter le compteur de téléchargements
      await fetch(`http://localhost:5000/api/documents/${doc.id}/increment-download`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
    } catch (error) {
      console.error('Erreur téléchargement:', error);
      alert('Erreur lors du téléchargement du fichier');
    }
  };

  const getFileIcon = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    
    if (['pdf'].includes(extension)) {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <path d="M9 15h6"></path>
        </svg>
      );
    } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle>
          <polyline points="21 15 16 10 5 21"></polyline>
        </svg>
      );
    } else if (['doc', 'docx'].includes(extension)) {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
        </svg>
      );
    }
    
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
        <polyline points="13 2 13 9 20 9"></polyline>
      </svg>
    );
  };

  const getFileType = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    if (['pdf'].includes(extension)) return 'pdf';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) return 'image';
    return 'other';
  };

  const filteredDocuments = documents.filter(doc => {
    if (filter === 'all') return true;
    const fileType = getFileType(doc.filename);
    return fileType === filter;
  });

  if (loading) {
    return (
      <div className="library-documents-page">
        <div className="documents-header">
          <button className="back-btn" onClick={() => navigate('/library')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Retour à la bibliothèque
          </button>
          <h1>Documents {niveau?.toUpperCase()}</h1>
        </div>
        <div className="loading-documents">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2">
            <circle cx="12" cy="12" r="10" opacity="0.3"/>
            <path d="M12 2 A10 10 0 0 1 22 12" strokeLinecap="round">
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 12 12"
                to="360 12 12"
                dur="1s"
                repeatCount="indefinite"
              />
            </path>
          </svg>
          <p>Chargement des documents...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="library-documents-page">
        <div className="documents-header">
          <button className="back-btn" onClick={() => navigate('/library')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Retour à la bibliothèque
          </button>
          <h1>Documents {niveau?.toUpperCase()}</h1>
        </div>
        <div className="error-documents">
          <p>❌ {error}</p>
          <button onClick={loadDocuments}>Réessayer</button>
        </div>
      </div>
    );
  }

  return (
    <div className="library-documents-page">
      <div className="documents-header">
        <button className="back-btn" onClick={() => navigate('/library')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Retour à la bibliothèque
        </button>
        <div className="header-info">
          <h1>Documents {niveau?.toUpperCase()}</h1>
          <p>{documents.length} document{documents.length > 1 ? 's' : ''} disponible{documents.length > 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="documents-filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Tous
        </button>
        <button 
          className={`filter-btn ${filter === 'pdf' ? 'active' : ''}`}
          onClick={() => setFilter('pdf')}
        >
          📄 PDF
        </button>
        <button 
          className={`filter-btn ${filter === 'image' ? 'active' : ''}`}
          onClick={() => setFilter('image')}
        >
          🖼️ Images
        </button>
        <button 
          className={`filter-btn ${filter === 'other' ? 'active' : ''}`}
          onClick={() => setFilter('other')}
        >
          📁 Autres
        </button>
      </div>

      {filteredDocuments.length === 0 ? (
        <div className="empty-documents">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
          </svg>
          <h2>Aucun document trouvé</h2>
          <p>Aucun document disponible pour ce niveau</p>
        </div>
      ) : (
        <div className="documents-grid">
          {filteredDocuments.map((doc) => (
            <div key={doc.id} className="document-card">
              <div className="document-icon">
                {getFileIcon(doc.filename)}
              </div>
              <div className="document-info">
                <h3 className="document-name">{doc.filename}</h3>
                <div className="document-meta">
                  <span className="doc-type">{doc.filename.split('.').pop().toUpperCase()}</span>
                  <span className="doc-size">{doc.size}</span>
                </div>
                <div className="document-details">
                  <span>Par {doc.uploadedBy}</span>
                  <span>{doc.downloads || 0} téléchargement{doc.downloads > 1 ? 's' : ''}</span>
                </div>
                <div className="document-source">
                  <span>📍 {doc.sourceType === 'post' ? 'Publication' : 'Commentaire'}</span>
                  <span>{new Date(doc.uploadDate).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
              <button 
                className="download-document-btn"
                onClick={() => handleDownload(doc)}
                title="Télécharger"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LibraryDocuments;