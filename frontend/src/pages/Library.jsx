import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Library.css';

const Library = () => {
  const navigate = useNavigate();
  const [selectedFiliere, setSelectedFiliere] = useState(null);

  const filieres = [
    {
      id: 'prepa',
      nom: 'Classes Préparatoires',
      color: '#6d1ae1',
      niveaux: ['AP1', 'AP2']
    },
    {
      id: 'ginf',
      nom: 'Génie Informatique',
      color: '#8b5cf6',
      niveaux: ['GINF1', 'GINF2', 'GINF3']
    },
    {
      id: 'gil',
      nom: 'Génie Logistique et Industrielle',
      color: '#b958ed',
      niveaux: ['GIL1', 'GIL2', 'GIL3']
    },
    {
      id: 'gsr',
      nom: 'Génie des Systèmes et Réseaux',
      color: '#6e23ac',
      niveaux: ['GSR1', 'GSR2', 'GSR3']
    },
    {
      id: 'g2ei',
      nom: 'Génie Environnement',
      color: '#753194',
      niveaux: ['G2EI1', 'G2EI2', 'G2EI3']
    },
    {
      id: 'gsea',
      nom: 'Génie Électrique et Automatique',
      color: '#35113f',
      niveaux: ['GSEA1', 'GSEA2', 'GSEA3']
    },
    {
      id: 'gsyc',
      nom: 'Génie Cyber et Sécurité',
      color: '#6c44ef',
      niveaux: ['GSYC1', 'GSYC2', 'GSYC3']
    }
  ];

  const handleNiveauClick = (niveau) => {
    navigate(`/library/${niveau.toLowerCase()}`);
  };

  return (
    <div className="library-page">
      <div className="library-header">
        <h1>📖 Library</h1>
        <p className="library-subtitle">Select your study level to access documents</p>
      </div>

      {selectedFiliere ? (
        <div className="niveaux-view">
          <button 
            className="back-btn"
            onClick={() => setSelectedFiliere(null)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Programs
          </button>

          <div className="filiere-title-card" style={{ background: `linear-gradient(135deg, ${selectedFiliere.color}, ${selectedFiliere.color}dd)` }}>
            <h2>{selectedFiliere.nom}</h2>
          </div>

          <div className="niveaux-grid">
            {selectedFiliere.niveaux.map((niveau) => (
              <div 
                key={niveau}
                className="niveau-card"
                onClick={() => handleNiveauClick(niveau)}
              >
                <div className="niveau-icon" style={{ backgroundColor: `${selectedFiliere.color}20`, color: selectedFiliere.color }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                  </svg>
                </div>
                <h3>{niveau}</h3>
                <p className="niveau-desc">Documents & Resources</p>
                <div className="niveau-arrow" style={{ color: selectedFiliere.color }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="filieres-grid">
          {filieres.map((filiere) => (
            <div 
              key={filiere.id}
              className="filiere-card"
              onClick={() => setSelectedFiliere(filiere)}
              style={{ 
                background: `linear-gradient(135deg, ${filiere.color}08, ${filiere.color}02)`,
                borderColor: `${filiere.color}20`
              }}
            >
              <h3 className="filiere-nom" style={{ color: filiere.color }}>
                {filiere.nom}
              </h3>
              <div className="filiere-niveaux">
                {filiere.niveaux.map((niveau) => (
                  <span key={niveau} className="niveau-badge" style={{ backgroundColor: `${filiere.color}15`, color: filiere.color }}>
                    {niveau}
                  </span>
                ))}
              </div>
              <div className="filiere-arrow" style={{ color: filiere.color }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Library;