import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Library.css';

const Library = () => {
  const navigate = useNavigate();

  const filieres = [
    {
      id: 'prepa',
      nom: 'Classes Préparatoires',
      color: '#a855f7',
      niveaux: ['AP1', 'AP2']
    },
    {
      id: 'ginf',
      nom: 'Génie Informatique',
      color: '#a855f7',
      niveaux: ['GINF1', 'GINF2', 'GINF3']
    },
    {
      id: 'gil',
      nom: 'Génie Logistique et Industrielle',
      color: '#a855f7',
      niveaux: ['GIL1', 'GIL2', 'GIL3']
    },
    {
      id: 'gsr',
      nom: 'Génie des Systèmes et Réseaux',
      color: '#a855f7',
      niveaux: ['GSR1', 'GSR2', 'GSR3']
    },
    {
      id: 'g2ei',
      nom: 'Génie Environnement',
      color: '#a855f7',
      niveaux: ['G2EI1', 'G2EI2', 'G2EI3']
    },
    {
      id: 'gsea',
      nom: 'Génie Électrique et Automatique',
      color: '#a855f7',
      niveaux: ['GSEA1', 'GSEA2', 'GSEA3']
    },
    {
      id: 'gsyc',
      nom: 'Génie Cyber et Sécurité',
      color: '#a855f7',
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
          >
            <h3 className="filiere-nom">
              {filiere.nom}
            </h3>
            <div className="filiere-niveaux-buttons">
              {filiere.niveaux.map((niveau) => (
                <button 
                  key={niveau} 
                  className="niveau-button" 
                  onClick={() => handleNiveauClick(niveau)}
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