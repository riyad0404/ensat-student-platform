import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

const FiliereCard = ({ filiere, onNavigate }) => {
  return (
    <div 
      style={{ 
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid #e5e7eb',
        boxShadow: 'none',
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1)';
        e.currentTarget.style.borderColor = '#0040D0';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = '#e5e7eb';
      }}
    >
      {/* Icône et titre */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          borderRadius: '10px', 
          background: '#f0f5ff', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: '#0040D0', 
          marginRight: '12px',
          flexShrink: 0
        }}>
          <BookOpen size={20} strokeWidth={2.5} />
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
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto', minHeight: '100vh', background: '#ffffff' }}>
      {/* Header - Même style que Groups et Bookmarks */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: '800', 
          marginBottom: '8px', 
          marginTop: 0,
          color: '#333333'
        }}>Library</h1>
        <p style={{ color: '#6b7280', margin: 0 }}>
          Select your study level to access documents
        </p>
      </div>

      {/* Grid des filières */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
        gap: '20px',
        paddingBottom: '40px'
      }}>
        {filieres.map((filiere) => (
          <FiliereCard 
            key={filiere.id} 
            filiere={filiere} 
            onNavigate={handleNiveauClick} 
          />
        ))}
      </div>
    </div>
  );
};
export default Library;