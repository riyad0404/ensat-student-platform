import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

const FiliereCard = ({ filiere, onNavigate, iconColor, iconBg }) => {
  return (
    <div 
      style={{ 
        background: 'white',
        borderRadius: '16px',
        padding: '32px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.15)';
        e.currentTarget.style.borderColor = iconColor;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
        e.currentTarget.style.borderColor = '#e5e7eb';
      }}
    >
      {/* Icône et titre */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ 
          width: '48px', 
          height: '48px', 
          borderRadius: '12px', 
          background: iconBg, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: iconColor, 
          marginRight: '16px',
          flexShrink: 0
        }}>
          <BookOpen size={24} strokeWidth={2.5} />
        </div>
        <h3 style={{ 
          margin: 0, 
          fontSize: '16px', 
          fontWeight: '700', 
          background: 'linear-gradient(135deg, #0040D0 0%, #E7A33E 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: '1.3'
        }}>
          {filiere.nom}
        </h3>
      </div>

      {/* Select Level & Button */}
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <select
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) onNavigate(e.target.value);
            }}
            style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '14px',
                backgroundColor: '#f9fafb',
                cursor: 'pointer',
                outline: 'none',
                color: '#4b5563'
            }}
        >
            <option value="" disabled>Select Level</option>
            {filiere.niveaux.map((niveau) => (
                <option key={niveau} value={niveau}>{niveau}</option>
            ))}
        </select>
      </div>
    </div>
  );
};

const Library = () => {
  const navigate = useNavigate();

  const filieres = [
    {
      id: 'prepa',
      nom: 'Classes Préparatoires',
      color: '#0040D0',
      niveaux: ['AP1', 'AP2']
    },
    {
      id: 'ginf',
      nom: 'Génie Informatique',
      color: '#0040D0',
      niveaux: ['GINF1', 'GINF2', 'GINF3']
    },
    {
      id: 'gil',
      nom: 'Génie Industriel et Logistique',
      color: '#0040D0',
      niveaux: ['GIL1', 'GIL2', 'GIL3']
    },
    {
      id: 'gsr',
      nom: 'Génie des Systèmes de Réseaux',
      color: '#0040D0',
      niveaux: ['GSR1', 'GSR2', 'GSR3']
    },
    {
      id: 'g2ei',
      nom: 'Génie énergétique et Environnement Industriel',
      color: '#0040D0',
      niveaux: ['G2EI1', 'G2EI2', 'G2EI3']
    },
    {
      id: 'gsea',
      nom: 'Génie des Systèmes Electroniques et Automatique',
      color: '#0040D0',
      niveaux: ['GSEA1', 'GSEA2', 'GSEA3']
    },
    {
      id: 'gsyc',
      nom: 'Génie des Systèmes et Cybersécurité',
      color: '#0040D0',
      niveaux: ['GSYC1', 'GSYC2', 'GSYC3']
    }
  ];

  const handleNiveauClick = (niveau) => {
    navigate(`/library/${niveau.toLowerCase()}`);
  };

  return (
    <div className="library-page-container" style={{ background: '#f4f6fa' }}>
      {/* Header - Même style que Groups et Bookmarks */}
      <div className="page-header">
        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: '800', 
          margin: 0,
          background: 'linear-gradient(135deg, #333333 0%, #E7A33E 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          color: 'transparent',
          width: 'fit-content'
        }}>Library</h1>
        <p style={{ color: '#6b7280', margin: 0 }}>
          Select your study level to access documents
        </p>
      </div>

      <div className="page-content">
        {/* Grid des filières */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)', 
          gap: '24px',
          paddingBottom: '40px'
        }}>
          {filieres.map((filiere, index) => {
            // Logique damier pour 2 colonnes : (Ligne + Colonne) % 2
            const isBlue = (Math.floor(index / 2) + index % 2) % 2 === 0;
            return (
            <FiliereCard 
              key={filiere.id} 
              filiere={filiere} 
              onNavigate={handleNiveauClick} 
              iconColor={isBlue ? '#0040D0' : '#E7A33E'}
              iconBg={isBlue ? '#E6F0FF' : '#FFF4E5'}
            />
          )})}
        </div>
      </div>
    </div>
  );
};
export default Library;