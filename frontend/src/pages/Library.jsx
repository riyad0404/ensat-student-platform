import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Library.css';

const Library = () => {
  const navigate = useNavigate();

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
      color: '#7c3aed',
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

      <div className="filieres-grid">
        {filieres.map((filiere) => (
          <div 
            key={filiere.id}
            className="filiere-card"
            style={{ 
              background: `linear-gradient(135deg, ${filiere.color}08, ${filiere.color}02)`,
              borderColor: `${filiere.color}20`
            }}
          >
            <h3 className="filiere-nom" style={{ color: filiere.color }}>
              {filiere.nom}
            </h3>
            <div className="filiere-niveaux-buttons">
              {filiere.niveaux.map((niveau) => (
                <button 
                  key={niveau} 
                  className="niveau-button" 
                  style={{ 
                    backgroundColor: `${filiere.color}15`, 
                    color: filiere.color,
                    borderColor: `${filiere.color}40`
                  }}
                  onClick={() => handleNiveauClick(niveau)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = filiere.color;
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = `${filiere.color}15`;
                    e.currentTarget.style.color = filiere.color;
                  }}
                >
                  {niveau}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Library;