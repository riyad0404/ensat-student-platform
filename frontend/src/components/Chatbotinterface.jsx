import React, { useState, useRef, useEffect } from 'react';
import { Send, ThumbsUp, ThumbsDown, Copy, ExternalLink, Check } from 'lucide-react';

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(to bottom right, #faf5ff, #ffffff, #faf5ff)',
  },
  header: {
    background: 'linear-gradient(to right, #9333ea, #7e22ce)',
    color: 'white',
    padding: '1rem',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  headerContent: {
    maxWidth: '56rem',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  logoCircle: {
    width: '3rem',
    height: '3rem',
    backgroundColor: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoInner: {
    width: '2rem',
    height: '2rem',
    backgroundColor: '#9333ea',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.25rem',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    margin: 0,
  },
  status: {
    color: '#e9d5ff',
    fontSize: '0.875rem',
    margin: 0,
  },
  closeBtn: {
    width: '2rem',
    height: '2rem',
    borderRadius: '50%',
    backgroundColor: '#a855f7',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    fontSize: '1.5rem',
    transition: 'background-color 0.2s',
  },
  messagesContainer: {
    maxWidth: '56rem',
    margin: '0 auto',
    padding: '1rem',
    height: 'calc(100vh - 200px)',
    overflowY: 'auto',
  },
  messageWrapper: {
    display: 'flex',
    marginBottom: '1rem',
  },
  messageWrapperUser: {
    justifyContent: 'flex-end',
  },
  messageWrapperBot: {
    justifyContent: 'flex-start',
  },
  botAvatar: {
    width: '2.5rem',
    height: '2.5rem',
    backgroundColor: '#9333ea',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '0.5rem',
  },
  messageBubble: {
    borderRadius: '1rem',
    padding: '1rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    maxWidth: '40rem',
  },
  messageBubbleUser: {
    backgroundColor: '#9333ea',
    color: 'white',
  },
  messageBubbleBot: {
    backgroundColor: '#f3f4f6',
    color: '#1f2937',
  },
  messageText: {
    fontSize: '0.875rem',
    lineHeight: '1.5',
    margin: 0,
  },
  messageFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '0.5rem',
  },
  messageTime: {
    fontSize: '0.75rem',
  },
  messageTimeUser: {
    color: '#e9d5ff',
  },
  messageTimeBot: {
    color: '#6b7280',
  },
  actionButtons: {
    display: 'flex',
    gap: '0.5rem',
  },
  actionBtn: {
    padding: '0.25rem',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '0.25rem',
    transition: 'background-color 0.2s',
  },
  loadingDots: {
    display: 'flex',
    gap: '0.5rem',
  },
  dot: {
    width: '0.5rem',
    height: '0.5rem',
    backgroundColor: '#9333ea',
    borderRadius: '50%',
    animation: 'bounce 1s infinite',
  },
  inputArea: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTop: '1px solid #e5e7eb',
    padding: '1rem',
    boxShadow: '0 -4px 6px rgba(0, 0, 0, 0.1)',
  },
  inputContent: {
    maxWidth: '56rem',
    margin: '0 auto',
  },
  quickButtons: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '0.5rem',
    flexWrap: 'wrap',
  },
  quickBtn: {
    fontSize: '0.875rem',
    color: '#9333ea',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '500',
    padding: '0.25rem 0.5rem',
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#f9fafb',
    borderRadius: '9999px',
    padding: '0.5rem',
    border: '1px solid #e5e7eb',
  },
  input: {
    flex: 1,
    backgroundColor: 'transparent',
    padding: '0.5rem 1rem',
    outline: 'none',
    border: 'none',
    color: '#1f2937',
  },
  sendBtn: {
    backgroundColor: '#9333ea',
    color: 'white',
    borderRadius: '50%',
    padding: '0.75rem',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  sendBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  // Styles pour le contenu enrichi
  card: {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    padding: '1rem',
    marginTop: '0.5rem',
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
  },
  cardTitle: {
    fontSize: '1rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
    color: '#1f2937',
  },
  cardButton: {
    backgroundColor: '#9333ea',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.875rem',
    marginTop: '0.5rem',
    marginRight: '0.5rem',
    transition: 'background-color 0.2s',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '0.5rem',
    fontSize: '0.875rem',
  },
  tableHeader: {
    backgroundColor: '#f3f4f6',
    fontWeight: 'bold',
    padding: '0.5rem',
    textAlign: 'left',
    borderBottom: '2px solid #e5e7eb',
  },
  tableCell: {
    padding: '0.5rem',
    borderBottom: '1px solid #e5e7eb',
  },
  link: {
    color: '#9333ea',
    textDecoration: 'underline',
    cursor: 'pointer',
  },
  image: {
    maxWidth: '100%',
    borderRadius: '0.5rem',
    marginTop: '0.5rem',
  },
  copyNotification: {
    position: 'fixed',
    top: '5rem',
    right: '1rem',
    backgroundColor: '#10b981',
    color: 'white',
    padding: '0.75rem 1rem',
    borderRadius: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    zIndex: 1000,
  }
};

// Composant pour afficher le contenu enrichi
const RichContent = ({ content, onCopy }) => {
  const renderContent = (text) => {
    // Détection et rendu de tableaux
    if (text.includes('|') && text.includes('---')) {
      const lines = text.split('\n');
      const tableLines = lines.filter(line => line.includes('|'));
      
      if (tableLines.length > 0) {
        const headers = tableLines[0].split('|').filter(cell => cell.trim());
        const rows = tableLines.slice(2).map(line => 
          line.split('|').filter(cell => cell.trim())
        );
        
        return (
          <table style={styles.table}>
            <thead>
              <tr>
                {headers.map((header, i) => (
                  <th key={i} style={styles.tableHeader}>{header.trim()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j} style={styles.tableCell}>{cell.trim()}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        );
      }
    }

    // Parser le markdown
    let processed = text;
    
    // Gras **texte**
    processed = processed.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    
    // Italique *texte*
    processed = processed.replace(/\*(.+?)\*/g, '<em>$1</em>');
    
    // Liens [texte](url)
    processed = processed.replace(/\[(.+?)\]\((.+?)\)/g, 
      '<a href="$2" style="color: #9333ea; text-decoration: underline;" target="_blank" rel="noopener noreferrer">$1 ↗</a>'
    );
    
    // Listes à puces - item
    processed = processed.replace(/^- (.+)$/gm, '<li style="margin-left: 1.5rem;">$1</li>');
    processed = processed.replace(/(<li>.*<\/li>)/s, '<ul style="margin: 0.5rem 0;">$1</ul>');
    
    // Listes numérotées 1. item
    processed = processed.replace(/^\d+\. (.+)$/gm, '<li style="margin-left: 1.5rem;">$1</li>');
    
    // Titres ### Titre
    processed = processed.replace(/^### (.+)$/gm, '<h3 style="font-size: 1.125rem; font-weight: bold; margin: 0.5rem 0;">$1</h3>');
    processed = processed.replace(/^## (.+)$/gm, '<h2 style="font-size: 1.25rem; font-weight: bold; margin: 0.75rem 0;">$1</h2>');
    
    // Code inline `code`
    processed = processed.replace(/`(.+?)`/g, '<code style="background-color: #f3f4f6; padding: 0.125rem 0.25rem; border-radius: 0.25rem; font-family: monospace;">$1</code>');
    
    return <div dangerouslySetInnerHTML={{ __html: processed }} />;
  };

  // Détection de cartes [CARD: titre | contenu | bouton1,bouton2]
  if (content.includes('[CARD:')) {
    const cardMatch = content.match(/\[CARD:(.+?)\|(.+?)\|(.+?)\]/);
    if (cardMatch) {
      const [, title, cardContent, buttons] = cardMatch;
      const buttonList = buttons.split(',');
      
      return (
        <div>
          {content.replace(/\[CARD:.+?\]/, '').trim() && renderContent(content.replace(/\[CARD:.+?\]/, ''))}
          <div style={styles.card}>
            <div style={styles.cardTitle}>{title.trim()}</div>
            <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>{cardContent.trim()}</p>
            {buttonList.map((btn, i) => (
              <button 
                key={i} 
                style={styles.cardButton}
                onMouseOver={(e) => e.target.style.backgroundColor = '#7e22ce'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#9333ea'}
              >
                {btn.trim()}
              </button>
            ))}
          </div>
        </div>
      );
    }
  }

  // Détection d'images [IMG: url]
  if (content.includes('[IMG:')) {
    const imgMatch = content.match(/\[IMG:(.+?)\]/);
    if (imgMatch) {
      const [, url] = imgMatch;
      return (
        <div>
          {content.replace(/\[IMG:.+?\]/, '').trim() && renderContent(content.replace(/\[IMG:.+?\]/, ''))}
          <img src={url.trim()} alt="Image" style={styles.image} />
        </div>
      );
    }
  }

  return renderContent(content);
};

export default function ChatbotInterface() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: "Bienvenue! Je suis l'assistant virtuel de l'ENSA Tanger. Comment puis-je vous aider aujourd'hui?",
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCopyNotification, setShowCopyNotification] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      text: input,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: input })
      });

      const data = await response.json();

      const botMessage = {
        id: messages.length + 2,
        type: 'bot',
        text: data.answer || "Désolé, je n'ai pas pu traiter votre demande.",
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Erreur:', error);
      const errorMessage = {
        id: messages.length + 2,
        type: 'bot',
        text: "Désolé, une erreur s'est produite. Veuillez réessayer.",
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleQuickQuestion = (question) => {
    if (isLoading) return;
    
    setInput(question);
    
    setTimeout(() => {
      const userMessage = {
        id: messages.length + 1,
        type: 'user',
        text: question,
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, userMessage]);
      setInput('');
      setIsLoading(true);

      fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: question })
      })
      .then(response => response.json())
      .then(data => {
        const botMessage = {
          id: messages.length + 2,
          type: 'bot',
          text: data.answer || "Désolé, je n'ai pas pu traiter votre demande.",
          time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, botMessage]);
      })
      .catch(error => {
        console.error('Erreur:', error);
        const errorMessage = {
          id: messages.length + 2,
          type: 'bot',
          text: "Désolé, une erreur s'est produite. Veuillez réessayer.",
          time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, errorMessage]);
      })
      .finally(() => {
        setIsLoading(false);
      });
    }, 100);
  };

  const copyMessage = (text) => {
    // Nettoyer le texte des balises markdown pour la copie
    const cleanText = text
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/\[(.+?)\]\((.+?)\)/g, '$1 ($2)')
      .replace(/\[CARD:.+?\]/g, '')
      .replace(/\[IMG:.+?\]/g, '');
    
    navigator.clipboard.writeText(cleanText);
    setShowCopyNotification(true);
    setTimeout(() => setShowCopyNotification(false), 2000);
  };

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-0.5rem); }
        }
        .dot:nth-child(2) { animation-delay: 0.1s; }
        .dot:nth-child(3) { animation-delay: 0.2s; }
      `}</style>
      
      {/* Notification de copie */}
      {showCopyNotification && (
        <div style={styles.copyNotification}>
          <Check size={20} />
          <span>Message copié!</span>
        </div>
      )}

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logo}>
            <div style={styles.logoCircle}>
              <div style={styles.logoInner}>🤖</div>
            </div>
            <div>
              <h1 style={styles.title}>ENSA Chatbot</h1>
              <p style={styles.status}>En ligne</p>
            </div>
          </div>
          <button 
            style={styles.closeBtn}
            onMouseOver={(e) => e.target.style.backgroundColor = '#c084fc'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#a855f7'}
          >
            ×
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div style={styles.messagesContainer}>
        <div>
          {messages.map((message) => (
            <div
              key={message.id}
              style={{
                ...styles.messageWrapper,
                ...(message.type === 'user' ? styles.messageWrapperUser : styles.messageWrapperBot)
              }}
            >
              <div>
                {message.type === 'bot' && (
                  <div style={styles.botAvatar}>
                    <span style={{ color: 'white' }}>🤖</span>
                  </div>
                )}
                <div
                  style={{
                    ...styles.messageBubble,
                    ...(message.type === 'user' ? styles.messageBubbleUser : styles.messageBubbleBot)
                  }}
                >
                  <div style={styles.messageText}>
                    {message.type === 'bot' ? (
                      <RichContent content={message.text} />
                    ) : (
                      message.text
                    )}
                  </div>
                  <div style={styles.messageFooter}>
                    <span
                      style={{
                        ...styles.messageTime,
                        ...(message.type === 'user' ? styles.messageTimeUser : styles.messageTimeBot)
                      }}
                    >
                      {message.time}
                    </span>
                    {message.type === 'bot' && (
                      <div style={styles.actionButtons}>
                        <button 
                          style={styles.actionBtn}
                          onClick={() => copyMessage(message.text)}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#e5e7eb'}
                          onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                          title="Copier le message"
                        >
                          <Copy style={{ width: '1rem', height: '1rem', color: '#4b5563' }} />
                        </button>
                        <button 
                          style={styles.actionBtn}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#e5e7eb'}
                          onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                          title="Utile"
                        >
                          <ThumbsUp style={{ width: '1rem', height: '1rem', color: '#4b5563' }} />
                        </button>
                        <button 
                          style={styles.actionBtn}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#e5e7eb'}
                          onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                          title="Pas utile"
                        >
                          <ThumbsDown style={{ width: '1rem', height: '1rem', color: '#4b5563' }} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div style={styles.messageWrapper}>
              <div style={styles.messageBubbleBot}>
                <div style={styles.loadingDots}>
                  <div className="dot" style={styles.dot}></div>
                  <div className="dot" style={styles.dot}></div>
                  <div className="dot" style={styles.dot}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div style={styles.inputArea}>
        <div style={styles.inputContent}>
          <div style={styles.quickButtons}>
            <button 
              style={styles.quickBtn}
              onClick={() => handleQuickQuestion("Qu'est-ce que l'ENSA Tanger?")}
              onMouseOver={(e) => e.target.style.color = '#7e22ce'}
              onMouseOut={(e) => e.target.style.color = '#9333ea'}
              disabled={isLoading}
            >
              💡 Qu'est-ce que l'ENSA?
            </button>
            <button 
              style={styles.quickBtn}
              onClick={() => handleQuickQuestion("Quelles sont les filières disponibles à l'ENSA Tanger?")}
              onMouseOver={(e) => e.target.style.color = '#7e22ce'}
              onMouseOut={(e) => e.target.style.color = '#9333ea'}
              disabled={isLoading}
            >
              📚 Filières disponibles
            </button>
            <button 
              style={styles.quickBtn}
              onClick={() => handleQuickQuestion("Quelles sont les questions fréquemment posées sur l'ENSA?")}
              onMouseOver={(e) => e.target.style.color = '#7e22ce'}
              onMouseOut={(e) => e.target.style.color = '#9333ea'}
              disabled={isLoading}
            >
              ❓ FAQs
            </button>
          </div>
          <div style={styles.inputWrapper}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tapez votre message ici..."
              style={styles.input}
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              style={{
                ...styles.sendBtn,
                ...(isLoading || !input.trim() ? styles.sendBtnDisabled : {})
              }}
              onMouseOver={(e) => !isLoading && input.trim() && (e.target.style.backgroundColor = '#7e22ce')}
              onMouseOut={(e) => (e.target.style.backgroundColor = '#9333ea')}
            >
              <Send style={{ width: '1.25rem', height: '1.25rem' }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}