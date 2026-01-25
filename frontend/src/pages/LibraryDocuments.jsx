import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Download, FileText, Image as ImageIcon, File } from 'lucide-react';
import { getDocumentsByNiveau } from '../api/DocumentsAPI';

const LibraryDocuments = () => {
  const { niveau } = useParams();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState(null);

  const loadDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Chargement documents pour niveau:', niveau);
      
      const data = await getDocumentsByNiveau(niveau);
      
      console.log('Documents reçus:', data);
      
      const formattedData = data.map(doc => {
        const docId = doc.iddocument || doc.id;
        
        return {
          id: docId,
          filename: doc.filename,
          url: doc.url,
          type: doc.type,
          size: formatFileSize(doc.size || 0),
          uploadedBy: doc.User ? `${doc.User.prenom} ${doc.User.nom}` : 'Inconnu',
          sourceType: doc.idpost ? 'post' : 'comment',
          uploadDate: doc.createdAt,
          niveau: doc.niveau
        };
      });
      
      console.log('Documents formatés:', formattedData);
      setDocuments(formattedData);
    } catch (error) {
      console.error('Erreur chargement documents:', error);
      console.error('Détails:', error.response?.data);
      setError(error.response?.data?.message || error.message || 'Erreur lors du chargement des documents');
    } finally {
      setLoading(false);
    }
  }, [niveau]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleDownload = async (doc) => {
    try {
      // Nettoyer l'URL - si elle commence déjà par http, l'utiliser directement
      const downloadUrl = doc.url.startsWith('http') ? doc.url : `http://localhost:3001${doc.url}`;
      
      const response = await fetch(downloadUrl);
      
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
    } catch (error) {
      console.error('Erreur téléchargement:', error);
    }
  };

  const getFileIcon = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    
    if (['pdf'].includes(extension)) {
      return <FileText size={24} />;
    } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
      return <ImageIcon size={24} />;
    }
    
    return <File size={24} />;
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
      <div className="library-page-container" style={{ minHeight: '100vh', background: '#F3F2EF', display: 'flex', flexDirection: 'column' }}>
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: '800', 
          marginBottom: '8px',
          color: '#333333'
        }}>Documents {niveau?.toUpperCase()}</h1>
        
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
          <div style={{ fontSize: '18px', color: '#666' }}>Loading documents...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="library-page-container" style={{ minHeight: '100vh', background: '#F3F2EF', display: 'flex', flexDirection: 'column' }}>
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: '800', 
          marginBottom: '8px',
          color: '#333333'
        }}>Documents {niveau?.toUpperCase()}</h1>
        
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p style={{ color: '#ef4444', fontSize: '16px' }}>{error}</p>
          <button 
            onClick={loadDocuments}
            style={{
              padding: '10px 20px',
              background: '#0040D0',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontWeight: '600',
              cursor: 'pointer',
              marginTop: '20px'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="library-page-container" style={{ minHeight: '100vh', background: '#F3F2EF', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div className="page-header">
        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: '800', 
          margin: 0,
          color: '#333333'
        }}>Documents {niveau?.toUpperCase()}</h1>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        {/* Filters */}
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          flexWrap: 'wrap'
        }}>
          {[
            { key: 'all', label: 'All' },
            { key: 'pdf', label: 'PDF' },
            { key: 'image', label: 'Images' },
            { key: 'other', label: 'Others' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              style={{
                padding: '8px 16px',
                background: filter === key ? '#0040D0' : '#e5e7eb',
                color: filter === key ? 'white' : '#374151',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {label}
            </button>
          ))}
        </div>
        </div>
        <p style={{ color: '#6b7280', margin: 0 }}>
          {documents.length} document{documents.length > 1 ? 's' : ''} available
        </p>
      </div>

      <div className="page-content" style={{ maxWidth: '1200px', margin: '24px auto 0 auto', width: '100%', padding: '0 20px', flex: 1 }}>
          {/* Documents Grid */}
          {filteredDocuments.length === 0 ? (
            <div style={{ 
              display: 'flex', background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px 20px',
              textAlign: 'center'
            }}>
              <FileText size={56} color="#d1d5db" strokeWidth={1.5} style={{ marginBottom: '20px' }} />
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937', margin: '0 0 8px 0' }}>
                No documents found
              </h2>
              <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
                No documents available for this level and filter.
              </p>
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '20px'
            }}>
              {filteredDocuments.map((doc) => (
                <div 
                  key={doc.id}
                  style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '20px',
                    border: '1px solid #f3f4f6',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '16px',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.08)';
                    e.currentTarget.style.borderColor = '#e6f0ff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                    e.currentTarget.style.borderColor = '#f3f4f6';
                  }}
                >
                  {/* Icon */}
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: '#f5f3ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#0040D0',
                    flexShrink: 0
                  }}>
                    {getFileIcon(doc.filename)}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{
                      fontSize: '15px',
                      fontWeight: '700',
                      color: '#1f2937',
                      margin: '0 0 8px 0',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {doc.filename}
                    </h3>
                    
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: '600',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: '#f3f4f6',
                        color: '#6b7280'
                      }}>
                        {doc.filename.split('.').pop().toUpperCase()}
                      </span>
                    </div>

                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                      {new Date(doc.uploadDate).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  </div>

                  {/* Download Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(doc);
                    }}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: '#0040D0',
                      border: 'none',
                      color: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s',
                      flexShrink: 0
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#002884';
                      e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#0040D0';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <Download size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  );
};

export default LibraryDocuments;
             