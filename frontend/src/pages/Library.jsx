import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ChevronRight } from 'lucide-react';

const Library = () => {
  const navigate = useNavigate();

  const filieres = [
    {
      id: 'prepa',
      nom: 'Classes Préparatoires',
      color: '#7c3aed',
      niveaux: ['AP1', 'AP2']
    },
    {
      id: 'ginf',
      nom: 'Génie Informatique',
      color: '#7c3aed',
      niveaux: ['GINF1', 'GINF2', 'GINF3']
    },
    {
      id: 'gil',
      nom: 'Génie Industriel et Logistique',
      color: '#7c3aed',
      niveaux: ['GIL1', 'GIL2', 'GIL3']
    },
    {
      id: 'gsr',
      nom: 'Génie des Systèmes de Réseaux',
      color: '#7c3aed',
      niveaux: ['GSR1', 'GSR2', 'GSR3']
    },
    {
      id: 'g2ei',
      nom: 'Génie énergétique et Environnement Industriel',
      color: '#7c3aed',
      niveaux: ['G2EI1', 'G2EI2', 'G2EI3']
    },
    {
      id: 'gsea',
      nom: 'Génie des Systèmes Electroniques et Automatique',
      color: '#7c3aed',
      niveaux: ['GSEA1', 'GSEA2', 'GSEA3']
    },
    {
      id: 'gsyc',
      nom: 'Génie des Systèmes et Cybersécurité',
      color: '#7c3aed',
      niveaux: ['GSYC1', 'GSYC2', 'GSYC3']
    }
  ];

  const handleNiveauClick = (niveau) => {
    navigate(`/library/${niveau.toLowerCase()}`);
  };

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto', minHeight: '100vh' }}>
      {/* Header - Même style que Groups et Bookmarks */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: '800', 
          marginBottom: '8px', 
          marginTop: 0,
          background: 'linear-gradient(90deg, #E334FE, #A6048E)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          display: 'inline-block'
        }}>Library</h1>
        <p style={{ color: '#6b7280', margin: 0 }}>
          Select your study level to access documents
        </p>
      </div>

      {/* Grid des filières */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
        gap: '24px',
        paddingBottom: '40px'
      }}>
        {filieres.map((filiere) => (
          <div 
            key={filiere.id}
            style={{ 
              background: 'white',
              borderRadius: '20px',
              padding: '24px',
              border: '1px solid #f3f4f6',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
            }}
          >
            {/* Icône et titre */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '14px', 
                background: '#f5f3ff', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#7c3aed', 
                marginRight: '14px'
              }}>
                <BookOpen size={24} strokeWidth={2} />
              </div>
              <h3 style={{ 
                margin: 0, 
                fontSize: '16px', 
                fontWeight: '700', 
                color: '#1f2937',
                lineHeight: '1.3'
              }}>
                {filiere.nom}
              </h3>
            </div>

            {/* Boutons des niveaux */}
            <div style={{ 
              display: 'flex', 
              gap: '10px', 
              flexWrap: 'wrap'
            }}>
              {filiere.niveaux.map((niveau) => (
                <button 
                  key={niveau}
                  onClick={() => handleNiveauClick(niveau)}
                  style={{ 
                    flex: filiere.niveaux.length === 2 ? '1' : '0 1 calc(33.333% - 7px)',
                    minWidth: '80px',
                    padding: '10px 16px',
                    background: '#faf5ff',
                    color: '#1f2937',
                    border: '2px solid #e9d5ff',
                    borderRadius: '10px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#7c3aed';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.borderColor = '#7c3aed';
                    e.currentTarget.style.transform = 'translateX(3px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#faf5ff';
                    e.currentTarget.style.color = '#1f2937';
                    e.currentTarget.style.borderColor = '#e9d5ff';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  {niveau}
                  <ChevronRight size={16} strokeWidth={2.5} />
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