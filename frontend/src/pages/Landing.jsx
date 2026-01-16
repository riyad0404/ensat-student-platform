import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, 
  Users, 
  FileText, 
  MessageSquare, 
  Shield, 
  Globe,
  Award,
  BookOpen,
  Sparkles,
  ChevronRight,
  CheckCircle,
  TrendingUp,
  Download,
  Share2,
  Lock,
  Eye
} from 'lucide-react';
import Landing3D from '../components/Landing3D';
import '../styles/Landing.css';

const Landing = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll for header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    
    // Set body class for this page
    document.body.classList.add('landing-page');
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.body.classList.remove('landing-page');
    };
  }, []);

  const features = [
    {
      icon: <Search size={28} />,
      title: "Recherche Intelligente",
      description: "Trouvez rapidement étudiants, documents et ressources par nom, niveau ou domaine d'étude avec notre moteur de recherche avancé.",
      color: "#7c3aed"
    },
    {
      icon: <Users size={28} />,
      title: "Profils Étudiants",
      description: "Consultez les profils publics détaillés avec publications, compétences, parcours académique et projets réalisés.",
      color: "#a855f7"
    },
    {
      icon: <FileText size={28} />,
      title: "Publications Anonymes",
      description: "Partagez vos questions et idées anonymement dans un espace sécurisé, visible uniquement par vous.",
      color: "#ec4899"
    },
    {
      icon: <MessageSquare size={28} />,
      title: "Collaboration en Temps Réel",
      description: "Discussions thématiques, groupes privés et chatbot d'assistance académique pour une collaboration optimale.",
      color: "#10b981"
    },
    {
      icon: <Shield size={28} />,
      title: "Sécurité Maximale",
      description: "Protection avancée des données personnelles avec chiffrement et contrôle total sur vos publications.",
      color: "#3b82f6"
    },
    {
      icon: <Globe size={28} />,
      title: "Accessibilité Mobile",
      description: "Accédez à la plateforme depuis n'importe quel appareil avec une expérience optimisée pour mobile.",
      color: "#f59e0b"
    }
  ];

  const stats = [
    { value: "5K+", label: "Étudiants Actifs", icon: <Users size={20} /> },
    { value: "10K+", label: "Documents Partagés", icon: <FileText size={20} /> },
    { value: "98%", label: "Taux de Satisfaction", icon: <TrendingUp size={20} /> },
    { value: "24/7", label: "Disponibilité", icon: <Globe size={20} /> }
  ];

  const benefits = [
    "Gagnez du temps dans vos recherches académiques",
    "Collaborez efficacement avec vos pairs",
    "Organisez vos documents par niveau et matière",
    "Bénéficiez d'un espace de stockage sécurisé",
    "Accédez à des ressources exclusives ENSA",
    "Recevez des notifications personnalisées"
  ];

  return (
    <div className="landing-container">
      {/* 3D Background - Only on desktop */}
      <div className="landing-3d-container">
        <Landing3D />
      </div>
      
      {/* Fixed Header */}
      <header className={`landing-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="logo-container" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="logo-icon">
            <Sparkles size={20} />
          </div>
          <h1 className="logo-text">DOCEN<span>TRA</span></h1>
        </div>
        
        <div className="nav-actions">
          <button 
            className="btn-secondary" 
            onClick={() => navigate("/login")}
          >
            Connexion
          </button>
          <button 
            className="btn-primary"
            onClick={() => navigate("/register")}
          >
            <Sparkles size={18} />
            S'inscrire Gratuitement
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <motion.div 
          className="hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="hero-badge"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Award size={18} />
            <span style={{ fontWeight: 600, color: '#7c3aed' }}>
              Plateforme Officielle ENSA Tanger
            </span>
          </motion.div>
          
          <h1 className="hero-title">
            Votre plateforme académique
            <br />
            <span className="gradient-text">tout-en-un</span>
          </h1>
          
          <p className="hero-subtitle">
            Docentra centralise l'ensemble de votre vie académique : documents, collaborations, 
            recherche d'étudiants et assistance intelligente. Rejoignez la communauté étudiante 
            la plus dynamique de l'ENSA Tanger.
          </p>
          
          <div style={{ 
            display: 'flex', 
            gap: '1.5rem', 
            flexWrap: 'wrap',
            marginBottom: '2rem'
          }}>
            <button 
              className="btn-primary"
              onClick={() => navigate("/register")}
              style={{ 
                minWidth: '220px'
              }}
            >
              <Sparkles size={18} />
              Commencer Maintenant
              <ChevronRight size={18} />
            </button>
            <button 
              className="btn-secondary"
              onClick={() => document.getElementById('features').scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
              })}
              style={{ minWidth: '220px' }}
            >
              <BookOpen size={18} />
              Explorer les Fonctionnalités
            </button>
          </div>

          {/* Quick Benefits */}
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '1rem',
            alignItems: 'center'
          }}>
            {benefits.slice(0, 3).map((benefit, index) => (
              <motion.div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  background: 'rgba(124, 58, 237, 0.05)',
                  borderRadius: '8px',
                  color: '#4b5563'
                }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
              >
                <CheckCircle size={16} color="#10b981" />
                <span style={{ fontSize: '0.9rem' }}>{benefit}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="section-container">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ 
              fontSize: '3.5rem', 
              fontWeight: 800, 
              marginBottom: '1rem',
              color: '#1f2937'
            }}>
              Tout ce dont vous avez besoin pour
              <br />
              <span className="gradient-text">réussir</span>
            </h2>
            <p style={{ 
              fontSize: '1.25rem', 
              color: '#4b5563', 
              maxWidth: '600px', 
              margin: '0 auto',
              lineHeight: 1.6
            }}>
              Une suite complète d'outils conçue spécialement pour les étudiants ENSA
            </p>
          </div>

          <div className="feature-grid">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="feature-card glass-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ 
                  scale: 1.03,
                  transition: { duration: 0.2 }
                }}
              >
                <div className="feature-icon" style={{ background: `linear-gradient(135deg, ${feature.color}15, ${feature.color}30)` }}>
                  <div style={{ color: feature.color }}>
                    {feature.icon}
                  </div>
                </div>
                <h3 style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 700, 
                  marginBottom: '1rem',
                  color: '#1f2937'
                }}>
                  {feature.title}
                </h3>
                <p style={{ 
                  color: '#4b5563', 
                  lineHeight: 1.7,
                  fontSize: '1rem'
                }}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <div className="stats-section glass-card">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <motion.div 
                key={index} 
                className="stat-item"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.5rem'
                }}>
                  <div style={{
                    background: 'rgba(124, 58, 237, 0.1)',
                    padding: '0.5rem',
                    borderRadius: '10px',
                    color: '#7c3aed'
                  }}>
                    {stat.icon}
                  </div>
                </div>
                <h3>{stat.value}</h3>
                <p style={{ 
                  fontSize: '1.1rem', 
                  fontWeight: 600, 
                  color: '#1f2937' 
                }}>
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* CTA Section */}
      <section className="cta-section">
        <motion.div
          className="cta-content"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div style={{
            background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.05), rgba(168, 85, 247, 0.05))',
            padding: '4rem',
            borderRadius: '30px',
            border: '1px solid rgba(124, 58, 237, 0.1)'
          }}>
            <h2 className="cta-title">
              Prêt à transformer votre
              <br />
              expérience académique ?
            </h2>
            
            <p style={{ 
              fontSize: '1.25rem', 
              color: '#4b5563', 
              marginBottom: '3rem',
              maxWidth: '600px',
              margin: '2rem auto 3rem',
              lineHeight: 1.6
            }}>
              Rejoignez des milliers d'étudiants ENSA qui optimisent déjà leur 
              parcours avec Docentra. C'est gratuit, et ça le restera.
            </p>
            
            <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <motion.button
                className="btn-primary"
                onClick={() => navigate("/register")}
                style={{ padding: '1.2rem 3rem', fontSize: '1.1rem' }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Sparkles size={20} />
                Créer mon Compte Gratuit
              </motion.button>
              <button 
                className="btn-secondary"
                onClick={() => navigate("/login")}
                style={{ padding: '1.2rem 3rem', fontSize: '1.1rem' }}
              >
                <Eye size={20} />
                Voir la Démo
              </button>
            </div>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: '0.5rem',
              marginTop: '2rem', 
              color: '#6b7280',
              fontSize: '0.9rem',
              flexWrap: 'wrap'
            }}>
              <CheckCircle size={16} color="#10b981" />
              <span>Aucune carte de crédit requise • </span>
              <CheckCircle size={16} color="#10b981" />
              <span>Essai gratuit illimité • </span>
              <CheckCircle size={16} color="#10b981" />
              <span>100% sécurisé</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{
        background: '#faf9ff',
        padding: '4rem 5% 2rem',
        textAlign: 'center',
        borderTop: '1px solid rgba(124, 58, 237, 0.1)',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ 
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div className="logo-container" style={{ justifyContent: 'center', marginBottom: '2rem' }}>
            <div className="logo-icon" style={{ width: '48px', height: '48px' }}>
              <Sparkles size={24} />
            </div>
            <h1 className="logo-text" style={{ fontSize: '2rem' }}>
              DOCEN<span>TRA</span>
            </h1>
          </div>
          
          <p style={{ 
            color: '#6b7280', 
            maxWidth: '600px',
            lineHeight: 1.6,
            margin: '0 auto 2rem',
            fontSize: '1.1rem'
          }}>
            La plateforme académique de référence pour les étudiants de l'ENSA Tanger.
            Conçue pour optimiser la collaboration, faciliter le partage de connaissances
            et accompagner chaque étudiant vers la réussite.
          </p>
          
          <div style={{ 
            display: 'flex', 
            gap: '2rem', 
            marginBottom: '2rem',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <a href="#" style={{ 
              color: '#7c3aed', 
              textDecoration: 'none',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}>
              <FileText size={16} />
              Conditions d'utilisation
            </a>
            <a href="#" style={{ 
              color: '#7c3aed', 
              textDecoration: 'none',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}>
              <Lock size={16} />
              Confidentialité
            </a>
            <a href="#" style={{ 
              color: '#7c3aed', 
              textDecoration: 'none',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}>
              <MessageSquare size={16} />
              Contact
            </a>
            <a href="#" style={{ 
              color: '#7c3aed', 
              textDecoration: 'none',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}>
              <Download size={16} />
              Télécharger l'app
            </a>
          </div>
          
          <div style={{
            paddingTop: '2rem',
            borderTop: '1px solid rgba(124, 58, 237, 0.1)',
            color: '#9ca3af',
            fontSize: '0.9rem'
          }}>
            © {new Date().getFullYear()} Docentra — École Nationale des Sciences Appliquées de Tanger.
            <br />
            <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>
              Tous droits réservés. Plateforme développée par et pour les étudiants ENSA.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;