"use client"
import { FileText } from "lucide-react"; 
import { useState, useRef, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import {
  Send,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Check,
  Sparkles,
  MessageCircle,
  Clock,
  Bot,
  User,
  Plus,
  Trash2,
  Menu,
  X,
  CheckCheck,
} from "lucide-react"

const API_BASE_URL = "http://localhost:5000/api/chat"

const styles = {
  container: {
  display: "flex", // Aligne les éléments horizontalement
  flexDirection: "row", // Éléments sur une ligne
  width: "100%", // Assure que le container prend toute la largeur
  height: "100vh", // Prend toute la hauteur de la fenêtre
  background: "#f4f6fa", // Couleur de fond
},
  backgroundPattern: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage:
      "radial-gradient(circle at 20% 50%, rgba(0, 64, 208, 0.03) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(0, 64, 208, 0.02) 0%, transparent 50%)",
    pointerEvents: "none",
  },
sidebar: {
  position: "fixed",
  left: 0, // Aligné à gauche
  top: 0,
  bottom: 0,
  width: "320px", // Largeur du sidebar
  background: "#ffffff",
  backdropFilter: "blur(20px)", // Flou d'arrière-plan
  boxShadow: "2px 0 16px rgba(0, 64, 208, 0.08)",
  zIndex: 20,
  transition: "transform 0.3s ease",
  display: "flex",
  flexDirection: "column",
  padding: "0",
  margin: "0",
},
  sidebarHidden: {
    transform: "translateX(-100%)",
  },
  sidebarHeader: {
    padding: "1.5rem 1rem",
     paddingTop: "1.75rem",
    borderBottom: "2px solid #0040D0",
    background: "#ffffff",
  },
  sidebarTitle: {
    fontSize: "1.25rem",
    fontWeight: "600",
    color: "#333333",
    marginBottom: "1rem",
    textAlign: "center",
  },
newConvBtn: {
  width: "100%",
  padding: "1.1rem 1.25rem",
  background: "linear-gradient(90deg, #0040D0 0%, #E7A33E 100%)",
  color: "#ffffff",
  border: "none",
  borderRadius: "1.25rem",
  cursor: "pointer",
  fontSize: "1rem",
  fontWeight: "600",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.6rem",
  boxShadow: "0 8px 20px rgba(0, 64, 208, 0.25)",
  transition: "all 0.3s ease",
},

  conversationsList: {
    flex: 1,
    overflowY: "auto",
    padding: "1rem",
  },
  conversationItem: {
    padding: "1rem",
    marginBottom: "0.5rem",
    background: "rgba(0, 64, 208, 0.04)",
    borderRadius: "0.75rem",
    cursor: "pointer",
    transition: "all 0.3s",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "0.75rem",
  },
  conversationItemActive: {
    background:  "rgba(0, 64, 208, 0.08)",
    borderLeft: "4px solid #0040D0",
  },
  conversationInfo: {
    flex: 1,
    overflow: "hidden",
  },
  conversationTitle: {
    fontSize: "0.9375rem",
    fontWeight: "500",
    color:"#333333",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  conversationDate: {
    fontSize: "0.75rem",
    color:  "#6b7280",
    marginTop: "0.25rem",
  },
  deleteBtn: {
    padding: "0.5rem",
    background: "rgba(231, 163, 62, 0.08)",
    border: "none",
    borderRadius: "0.5rem",
    cursor: "pointer",
    color:"#E7A33E",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s",
  },
  toggleSidebarBtn: {
    position: "absolute",
    left: "1rem",
    top: "1rem",
    width: "2rem",
    height: "2rem",
    borderRadius: "0.5rem",
    background: "rgba(255, 255, 255, 0.98)",
    backdropFilter: "blur(10px)",
    border:  "1px solid rgba(0, 64, 208, 0.12)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 12px rgba(0, 64, 208, 0.06)",
    zIndex: 30,
    transition: "all 0.3s",
  },
mainContent: {
  marginLeft: "320px", // Le contenu commence après le sidebar
  transition: "margin-left 0.3s ease", // Transition pour l'ouverture/fermeture du sidebar
  display: "flex",
  flexDirection: "column",
  height: "100vh", // Remplir toute la hauteur
},
mainContentExpanded: {
  marginLeft: 0, // Lorsque le sidebar est caché, la conversation occupe toute la largeur
},
header: {
  background: "#ffffff",
  backdropFilter: "blur(20px)",
  color: "#4a5568",
  padding: "1rem 2rem",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.03)",
  borderBottom: "none",
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  width: "100%",
  zIndex: 10,
  margin: "0",
  transition: "padding-left 0.3s ease",
},
headerOpen: {
  paddingLeft: "calc(320px + 2rem)",
},
headerClosed: {
  paddingLeft: "calc(2rem + 3rem)",
},

  headerContent: {
    display: "flex", // Utilise flexbox pour l'alignement des éléments
    justifyContent: "space-between", // Aligne le logo à gauche et le statut à droite
    alignItems: "center", // Aligne les éléments verticalement
    width: "100%", // Assure que le contenu occupe toute la largeur du header
    transition: "margin-left 0.3s ease",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  logoCircle: {
    width: "3.5rem",
    height: "3.5rem",
    borderRadius: "1rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 16px rgba(227, 52, 254, 0.15)",
    background: "#ffffff",
  },
  logoImage: {
    width: "100%",
    height: "100%",
    borderRadius: "1rem",
    objectFit: "contain",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: "600",
    margin: 0,
    color: "#0040D0",
    background: "none",
    WebkitTextFillColor: "initial",
    backgroundClip: "text",
  },
  '@keyframes pulse': {
  '0%, 100%': { 
    opacity: 1,
    transform: 'scale(1)'
  },
  '50%': { 
    opacity: 0.5,
    transform: 'scale(1.1)'
  }
},
  statusContainer: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
 statusDot: {
  width: "10px", // Augmenté de 8px
  height: "10px", // Augmenté de 8px
  backgroundColor: "#25D366",
  borderRadius: "50%",
  animation: "pulse 2s infinite",
  boxShadow: "0 0 8px rgba(37, 211, 102, 0.5)", // Ajout d'un glow
},
  status: {
    color: "#6b7280",
    fontSize: "0.875rem",
    margin: 0,
    fontWeight: "500",
  },
 messagesContainer: {
  flex: 1,
  maxWidth: "56rem",
  margin: "0 auto",
  padding: "2rem 1rem",
  paddingTop: "9rem",  // Ajouter un espace pour que les messages ne soient pas recouverts par le header
  overflowY: "auto",
  width: "100%",
  
},
  messageWrapper: {
    display: "flex",
    marginBottom: "1.5rem",
    animation: "slideIn 0.3s ease-out",
  },
  messageWrapperUser: {
    justifyContent: "flex-end",
  },
  messageWrapperBot: {
    justifyContent: "flex-start",
  },
  avatarWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginRight: "0.75rem",
  },
  botAvatar: {
    width: "2.5rem",
    height: "2.5rem",
    background: "#0040D0",
    borderRadius: "0.75rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 12px rgba(0, 64, 208, 0.15)",
  },
  userAvatar: {
    width: "2.5rem",
    height: "2.5rem",
    background: "#e5e7eb",
    borderRadius: "0.75rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.06)",
    marginLeft: "0.75rem",
    color: "#0040D0",
  },
  messageBubble: {
    borderRadius: "1.25rem",
    padding: "1.25rem",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
    maxWidth: "40rem",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.5)",
  },
messageBubbleUser: {
  background: "linear-gradient(135deg, #4a82fc 0%, #0040D0 100%)", // Gradient diagonal
  color: "white",
  boxShadow: "0 4px 16px rgba(0, 64, 208, 0.25)", // Ombre plus prononcée
  transition: "all 0.3s ease",
},
messageBubbleBot: {
  backgroundColor: "rgba(255, 255, 255, 0.99)",
  color: "#1f2937",
  borderColor: "rgba(0, 64, 208, 0.08)",
  boxShadow: "0 4px 16px rgba(0, 64, 208, 0.08)", // Ombre plus prononcée
  transition: "all 0.3s ease", // Animation smooth
},
  messageText: {
    fontSize: "0.9375rem",
    lineHeight: "1.6",
    margin: 0,
  },
  messageFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "0.75rem",
  },
  messageTime: {
    fontSize: "0.75rem",
    display: "flex",
    alignItems: "center",
    gap: "0.25rem",
  },
  messageTimeUser: {
    color: "#4B5563",
  },
  messageTimeBot: {
    color:  "#4B5563",
  },
  actionButtons: {
    display: "flex",
    gap: "0.5rem",
  },
  actionBtn: {
    padding: "0.5rem",
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    borderRadius: "0.5rem",
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingDots: {
    display: "flex",
    gap: "0.5rem",
    padding: "0.5rem 0",
  },
  dot: {
    width: "0.625rem",
    height: "0.625rem",
    background: "#0040D0",
    borderRadius: "50%",
    animation: "bounce 1s infinite",
  },
inputArea: {
  background: "#ffffff",
  backdropFilter: "blur(20px)",
  borderTop: "1px solid rgba(0, 64, 208, 0.12)",
  padding: "1rem 1.5rem",
  boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.02)", // Ombre inversée vers le haut
  zIndex: 10,
  position: "relative", // Ajouté pour le positionnement
},
  inputContent: {
    maxWidth: "56rem",
    margin: "0 auto",
    width: "100%",
    position: "relative", // Pour le contexte d'empilement
  },
  quickButtons: {
    display: "flex",
    gap: "0.75rem",
    marginBottom: "1rem",
    flexWrap: "wrap",
  },
quickBtn: {
  fontSize: "0.875rem",
  color: "#0040D0",
  background: "rgba(0, 64, 208, 0.06)",
  border: "1px solid rgba(0, 64, 208, 0.18)",
  cursor: "pointer",
  fontWeight: "500",
  padding: "0.625rem 1rem",
  borderRadius: "9999px",
  transition: "all 0.3s ease",
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
},

inputWrapper: {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  backgroundColor: "white",
  borderRadius: "1.5rem", // Plus arrondi
  padding: "0.875rem 1.25rem", // Padding augmenté
  border: "2px solid rgba(0, 64, 208, 0.2)", // Bordure plus visible par défaut
  transition: "all 0.3s ease",
  boxShadow: "0 4px 16px rgba(0, 64, 208, 0.08)", // Ombre plus prononcée
},
  input: {
    flex: 1,
    backgroundColor: "transparent",
    padding: "0.5rem",
    outline: "none",
    border: "none",
    color:  "#333333",
    fontSize: "0.9375rem",
  },
  sendBtn: {
    background: "transparent",
    color: "#0040D0",
    borderRadius: "0.875rem",
    padding: "0.875rem",
    border: "none",
    cursor: "pointer",
    transition: "all 0.3s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "none",
    zIndex: 5, // S'assurer qu'il est au-dessus
  },
  sendBtnDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  copyNotification: {
    position: "fixed",
    top: "6rem",
    right: "1.5rem",
    background: "linear-gradient(90deg, #4a82fc, #0040D0)",
    color: "white",
    padding: "1rem 1.5rem",
    borderRadius: "0.875rem",
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    boxShadow: "0 8px 24px rgba(0, 64, 208, 0.2)",
    zIndex: 1000,
    animation: "slideInRight 0.3s ease-out",
    fontWeight: "500",
  },
  listNumber: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "1.75rem",
    height: "1.75rem",
    borderRadius: "0.5rem",
    background: "#0040D0",
    color: "white",
    fontWeight: "bold",
    fontSize: "0.875rem",
    marginRight: "0.75rem",
    flexShrink: 0,
  },
  listItem: {
    display: "flex",
    alignItems: "flex-start",
    padding: "1rem",
    marginBottom: "0.75rem",
    background: "rgba(0, 64, 208, 0.04)",
    borderRadius: "0.75rem",
    borderLeft: "3px solid #0040D0",
    transition: "all 0.2s",
  },
  bulletPoint: {
    width: "0.5rem",
    height: "0.5rem",
    borderRadius: "50%",
    background: "#0040D0",
    marginRight: "0.75rem",
    marginTop: "0.5rem",
    flexShrink: 0,
  },
historyIcon: {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "48px", // Augmenté de 40px
  height: "48px", // Augmenté de 40px
  borderRadius: "12px", // Plus arrondi
  background: "linear-gradient(135deg, #E7A33E 0%, #FFC168 100%)", // Gradient au lieu d'une couleur unie
  cursor: "pointer",
  transition: "all 0.3s ease",
  boxShadow: "0 4px 12px rgba(231, 163, 62, 0.3)", // Ombre plus prononcée
},

historyIconInside: {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "18px", // Réduire la taille de l'icône à l'intérieur du cercle
  height: "18px", // Réduire la taille de l'icône à l'intérieur du cercle
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)", // Ombre légère autour de l'icône pour l'effet de profondeur
}
,
historyModal: {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0, 0, 0, 0.5)",
  zIndex: 1000,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backdropFilter: "blur(8px)", // Flou de l'arrière-plan
  borderRadius: "10px", // Arrondir les bords du modal
  padding: "1rem",
},

modalContent: {
  background: "#fff",
  borderRadius: "1rem",
  padding: "2rem",
  width: "90%",
  maxWidth: "600px", // Taille max du modal
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)", // Ombre pour un effet de profondeur
},

modalHeader: {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "1rem",
},

modalTitle: {
  fontSize: "1.25rem",
  fontWeight: "600",
  color: "#0040D0",
},

closeModalBtn: {
  background: "transparent",
  border: "none",
  cursor: "pointer",
  padding: "0.5rem",
},

conversationsList: {
  maxHeight: "400px",
  overflowY: "auto",
  marginBottom: "1rem",
},

conversationItem: {
  display: "flex",
  justifyContent: "space-between",
  padding: "1rem",
  marginBottom: "1rem",
  backgroundColor: "rgba(0, 64, 208, 0.04)", // Couleur de fond claire pour chaque conversation
  borderRadius: "0.75rem",
  cursor: "pointer",
  transition: "all 0.3s ease",
  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
},

conversationTitle: {
  fontSize: "1rem",
  fontWeight: "500",
  color: "#333",
},

conversationDate: {
  fontSize: "0.875rem",
  color:"#6b7280",
  marginTop: "0.25rem",
},

deleteBtn: {
  background: "transparent",
  border: "none",
  cursor: "pointer",
  padding: "0.5rem",
  transition: "all 0.3s ease",
  ":hover": {
    color:  "#E7A33E",
  },
},

newConvBtn: {
  width: "100%",
  padding: "1rem",
  background: "linear-gradient(90deg, #4a82fc, #0040D0)",
  color: "white",
  border: "none",
  borderRadius: "1rem",
  cursor: "pointer",
  fontSize: "1rem",
  fontWeight: "600",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.5rem",
  boxShadow: "0 4px 12px rgba(99, 102, 241, 0.2)",
  transition: "all 0.3s ease",
},


}

const RichContent = ({ content }) => {
  const renderContent = (text) => {
    if (/^\d+\.\s/.test(text)) {
      const items = text.split(/\n(?=\d+\.\s)/).filter((item) => item.trim())

      return (
        <div>
          {items.map((item, index) => {
            const match = item.match(/^(\d+)\.\s(.+)$/s)
            if (match) {
              const [, number, content] = match
              return (
                <div key={index} style={styles.listItem}>
                  <span style={styles.listNumber}>{number}</span>
                  <div style={{ flex: 1 }}>{processInlineMarkdown(content.trim())}</div>
                </div>
              )
            }
            return null
          })}
        </div>
      )
    }

    if (text.includes("\n- ")) {
      const parts = text.split(/\n- /)
      return (
        <div>
          {parts[0] && <div style={{ marginBottom: "0.75rem" }}>{processInlineMarkdown(parts[0])}</div>}
          <div>
            {parts.slice(1).map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                <span style={styles.bulletPoint}></span>
                <span style={{ flex: 1 }}>{processInlineMarkdown(item.trim())}</span>
              </div>
            ))}
          </div>
        </div>
      )
    }

    return <div>{processInlineMarkdown(text)}</div>
  }

  const processInlineMarkdown = (text) => {
    let processed = text

    processed = processed.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")

    processed = processed.replace(/\*(.+?)\*/g, "<em>$1</em>")

    processed = processed.replace(
      /\[(.+?)\]$$(.+?)$$/g,
      '<a href="$2" style="color: #0040D0; text-decoration: underline; font-weight: 500;" target="_blank" rel="noopener noreferrer">$1 ↗</a>',
    )

    processed = processed.replace(
      /`(.+?)`/g,
      '<code style="background-color: rgba(0, 64, 208, 0.1); padding: 0.125rem 0.5rem; border-radius: 0.375rem; font-family: monospace; color: #0040D0;">$1</code>',
    )

    return <span dangerouslySetInnerHTML={{ __html: processed }} />
  }

  return renderContent(content)
}

export default function ChatbotInterface() {
  const { user } = useAuth()
 const [isChatbotInterface, setIsChatbotInterface] = useState(true); 
 const [sidebarOpen, setSidebarOpen] = useState(true)

useEffect(() => {
  if (window.location.pathname === '/chatbot') {
    setIsChatbotInterface(true); // On est dans l'interface chatbot
  } else {
    setIsChatbotInterface(false); // On est dans une autre page
  }
}, [window.location.pathname]);

  const [conversations, setConversations] = useState([])
  const [currentConversationId, setCurrentConversationId] = useState(null)
  const [showHistoryModal, setShowHistoryModal] = useState(false);

// Fonction pour afficher/masquer le modal d'historique
const toggleHistoryModal = () => {
  setShowHistoryModal(!showHistoryModal);
}; 
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      text: "Bienvenue! Je suis l'assistant virtuel de l'ENSA Tanger. Comment puis-je vous aider aujourd'hui?",
      time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showCopyNotification, setShowCopyNotification] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (user?.iduser) {
      loadConversations()
    }
  }, [user])

  const loadConversations = async () => {
    if (!user?.iduser) {
      console.error("Utilisateur non connecté")
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/conversations/${user.iduser}`)
      const data = await response.json()
      console.log("[v0] Conversations chargées:", data.conversations)
      setConversations(data.conversations || [])
    } catch (error) {
      console.error("Erreur lors du chargement des conversations:", error)
    }
  }

 const createNewConversation = async () => {
  if (!user?.iduser) {
    console.error("Utilisateur non connecté");
    return;
  }

  // Fermer le modal d'historique
  setShowHistoryModal(false);

  try {
    const response = await fetch(`${API_BASE_URL}/conversation/new`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: user.iduser }),
    });
    const data = await response.json();
    console.log("[v0] Nouvelle conversation créée:", data);

    setCurrentConversationId(data.conversationId); // Met à jour l'ID de la conversation
    setMessages([ // Initialisation des messages pour la nouvelle conversation
      {
        id: 1,
        type: "bot",
        text: "Bienvenue! Je suis l'assistant virtuel de l'ENSA Tanger. Comment puis-je vous aider aujourd'hui?",
        time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      },
    ]);

    await loadConversations(); // Recharge la liste des conversations
  } catch (error) {
    console.error("Erreur lors de la création de la conversation:", error);
  }
};


  const loadConversation = async (conversationId) => {
  if (!user?.iduser) {
    console.error("Utilisateur non connecté");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/conversation/${conversationId}/messages?userId=${user.iduser}`);
    const data = await response.json();
    console.log("[v0] Messages chargés:", data.messages);

    const formattedMessages = data.messages.map((msg, index) => ({
      id: index + 1,
      type: msg.role,
      text: msg.content,
      time: new Date(msg.timestamp).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    }));

    setMessages(formattedMessages);
    setCurrentConversationId(conversationId); // Mettez à jour l'ID de la conversation

    // Ferme le modal d'historique
    setShowHistoryModal(false); 
  } catch (error) {
    console.error("Erreur lors du chargement de la conversation:", error);
  }
};


  const deleteConversation = async (conversationId, e) => {
  e.stopPropagation(); // Empêche la propagation de l'événement pour ne pas déclencher la sélection de la conversation

  if (!user?.iduser) {
    console.error("Utilisateur non connecté");
    return;
  }

  try {
    await fetch(`${API_BASE_URL}/conversation/${conversationId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: user.iduser }),
    });
    console.log("[v0] Conversation supprimée:", conversationId);

    // Recharge les conversations après la suppression
    await loadConversations();
  } catch (error) {
    console.error("Erreur lors de la suppression de la conversation:", error);
  }
};


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    
    scrollToBottom()
  }, [messages])

  const sendMessage = async (questionText = input) => {
    if (!questionText.trim() || isLoading) return

    if (!user?.iduser) {
      console.error("Utilisateur non connecté")
      return
    }

    const userMessage = {
      id: messages.length + 1,
      type: "user",
      text: questionText,
      time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.iduser,
          question: questionText,
          conversationId: currentConversationId,
        }),
      })

      const data = await response.json()
      console.log("[v0] Réponse reçue:", data)

      const botMessage = {
        id: messages.length + 2,
        type: "bot",
        text: data.answer || "Désolé, je n'ai pas pu traiter votre demande.",
        time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      }

      setMessages((prev) => [...prev, botMessage])

      if (!currentConversationId && data.conversationId) {
        setCurrentConversationId(data.conversationId)
        await loadConversations()
      }
    } catch (error) {
      console.error("Erreur:", error)
      const errorMessage = {
        id: messages.length + 2,
        type: "bot",
        text: "Désolé, une erreur s'est produite. Veuillez réessayer.",
        time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleQuickQuestion = (question) => {
    if (isLoading) return
    sendMessage(question)
  }

  const copyMessage = (text) => {
    const cleanText = text
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/\*(.+?)\*/g, "$1")
      .replace(/\[(.+?)\]$$(.+?)$$/g, "$1 ($2)")

    navigator.clipboard.writeText(cleanText)
    setShowCopyNotification(true)
    setTimeout(() => setShowCopyNotification(false), 2000)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Aujourd'hui"
    if (diffDays === 1) return "Hier"
    if (diffDays < 7) return `Il y a ${diffDays} jours`
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
  }

  return (
  <div style={styles.container}>
    <style>{`
      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-0.5rem); }
      }
      .dot:nth-child(2) { animation-delay: 0.1s; }
      .dot:nth-child(3) { animation-delay: 0.2s; }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      @keyframes slideIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes slideInRight {
        from { opacity: 0; transform: translateX(100%); }
        to { opacity: 1; transform: translateX(0); }
      }
    `}</style>

    <div style={styles.backgroundPattern} />

    {showCopyNotification && (
      <div style={styles.copyNotification}>
        <Check size={20} />
        <span>Message copié avec succès!</span>
      </div>
    )}

    {/* Afficher l'icône uniquement si isChatbotInterface est faux */}
    {!isChatbotInterface && (
  <button style={styles.toggleSidebarBtn}>
    <MessageCircle size={32} color="#0040D0" /> {/* Icône du chatbot */}
  </button>
)}

    <button
      style={styles.toggleSidebarBtn}
      onClick={() => setSidebarOpen(!sidebarOpen)}
      onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
      onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
     {sidebarOpen ? <X size={20} color="#0040D0" /> : <Menu size={20} color="#0040D0" />}
    </button>

    <div style={{ ...styles.mainContent, ...(sidebarOpen ? {} : styles.mainContentExpanded) }}>
<div style={{ ...styles.header, ...(sidebarOpen ? styles.headerOpen : styles.headerClosed) }}>        <div style={{ ...styles.headerContent, transition: "all 0.3s ease" }}>
  <div style={styles.logo}>
  <div>
    <h1 style={styles.title}>DocentraBot</h1>
    <div style={styles.statusContainer}>
      <div style={styles.statusDot} />
      <p style={styles.status}>En ligne</p>
    </div>
  </div>
</div>
  <div style={styles.historyIcon} onClick={toggleHistoryModal}>
    <div style={styles.historyIconInside}>
      <FileText size={38} color="#FFFFFF" /> {/* Ancienne icône d'historique */}
    </div>
  </div>
</div>

      </div>
      <div style={styles.messagesContainer}>
        <div>
          {messages.map((message) => (
            <div
              key={message.id}
              style={{
                ...styles.messageWrapper,
                ...(message.type === "user" ? styles.messageWrapperUser : styles.messageWrapperBot),
              }}
            >
              {message.type === "bot" && (
                <div style={styles.avatarWrapper}>
                  <div style={styles.botAvatar}>
                    <Bot color="white" size={20} />
                  </div>
                </div>
              )}

              <div>
                <div
                  style={{
                    ...styles.messageBubble,
                    ...(message.type === "user" ? styles.messageBubbleUser : styles.messageBubbleBot),
                  }}
                >
                  <div style={styles.messageText}>
                    {message.type === "bot" ? <RichContent content={message.text} /> : message.text}
                  </div>
                  <div style={styles.messageFooter}>
                    <span
                      style={{
                        ...styles.messageTime,
                        ...(message.type === "user" ? styles.messageTimeUser : styles.messageTimeBot),
                      }}
                    >
                      <Clock size={12} />
                      {message.time}
                    </span>
 {message.type === "bot" && (
  <div style={styles.actionButtons}>
    <button
      style={styles.actionBtn}
      onClick={() => copyMessage(message.text)}
      onMouseOver={(e) => {
        e.currentTarget.style.backgroundColor = "rgba(0, 64, 208, 0.15)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.backgroundColor = "rgba(0, 64, 208, 0.08)";
      }}
      title="Copier le message"
    >
      <Copy style={{ width: "1rem", height: "1rem", color: "#0040D0" }} />
    </button>
    <button
      style={styles.actionBtn}
      onMouseOver={(e) => {
        e.currentTarget.style.backgroundColor = "rgba(0, 64, 208, 0.15)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.backgroundColor = "rgba(0, 64, 208, 0.08)";
      }}
      title="Utile"
    >
      <ThumbsUp style={{ width: "1rem", height: "1rem", color: "#0040D0" }} />
    </button>
    <button
      style={styles.actionBtn}
      onMouseOver={(e) => {
        e.currentTarget.style.backgroundColor = "rgba(0, 64, 208, 0.15)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.backgroundColor = "rgba(0, 64, 208, 0.08)";
      }}
      title="Pas utile"
    >
      <ThumbsDown style={{ width: "1rem", height: "1rem", color: "#0040D0" }} />
    </button>
  </div>
)}
                  </div>
                </div>
              </div>

              {message.type === "user" && (
                <div style={styles.userAvatar}>
                  <User color="#E7A33E" size={20} />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div style={styles.messageWrapper}>
              <div style={styles.avatarWrapper}>
                <div style={styles.botAvatar}>
                  <Bot color="white" size={20} />
                </div>
              </div>
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
      

      {showHistoryModal && (
        <div style={styles.historyModal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Historique des Conversations</h3>
              <button onClick={toggleHistoryModal} style={styles.closeModalBtn}>
                <X size={20} color="#0040D0" />
              </button>
            </div>
            <div style={styles.conversationsList}>
              {conversations.map((conv) => (
                <div key={conv.idConvChat} style={styles.conversationItem}>
                  <div style={styles.conversationInfo} onClick={() => loadConversation(conv.idConvChat)}>
                    <div style={styles.conversationTitle}>{conv.titre}</div>
                    <div style={styles.conversationDate}>{formatDate(conv.updatedAt)}</div>
                  </div>
                  <button
                    style={styles.deleteBtn}
                    onClick={(e) => {
                      e.stopPropagation(); // Empêche la propagation pour éviter de charger la conversation
                      deleteConversation(conv.idConvChat, e); // Appel de la fonction pour supprimer la conversation
                    }}
                  >
                    <Trash2 size={18} color="#E7A33E" />
                  </button>
                </div>
              ))}
            </div>
            <button
  onClick={createNewConversation}
  style={{
    width: "100%",
    padding: "1.1rem",
    background: "linear-gradient(90deg, #0040D0, #E7A33E)",
    color: "#fff",
    border: "none",
    borderRadius: "20px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(0,0,0,0.25)"
  }}
>
  ➕ Nouvelle conversation
</button>

          </div>
        </div>
      )}

      <div style={styles.inputArea}>
        <div style={styles.inputContent}>
          <div style={styles.quickButtons}>
            <button
              style={styles.quickBtn}
              onClick={() => handleQuickQuestion("Qu'est-ce que l'ENSA Tanger?")}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "linear-gradient(90deg, #E7A33E, #FF9F1C)";
               e.currentTarget.style.color = "#ffffff";
               e.currentTarget.style.borderColor = "#E7A33E";
}}

       onMouseOut={(e) => {
        e.currentTarget.style.background = "rgba(0, 64, 208, 0.06)";
        e.currentTarget.style.color = "#0040D0";
         e.currentTarget.style.borderColor = "rgba(0, 64, 208, 0.18)";
}}
              disabled={isLoading}
            >
              <Sparkles size={14} />
              Qu'est-ce que l'ENSA?
            </button>
            <button
              style={styles.quickBtn}
              onClick={() => handleQuickQuestion("Quelles sont les filières disponibles à l'ENSA Tanger?")}
                     onMouseOver={(e) => {
              e.currentTarget.style.background = "linear-gradient(90deg, #E7A33E, #FF9F1C)";
               e.currentTarget.style.color = "#ffffff";
               e.currentTarget.style.borderColor = "#E7A33E";
}}

       onMouseOut={(e) => {
        e.currentTarget.style.background = "rgba(0, 64, 208, 0.06)";
        e.currentTarget.style.color = "#0040D0";
         e.currentTarget.style.borderColor = "rgba(0, 64, 208, 0.18)";
}}
              disabled={isLoading}
            >
              <MessageCircle size={14} />
              Filières disponibles
            </button>
          </div>
          <div
            style={styles.inputWrapper}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#0040D0")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(227, 52, 254, 0.12)")}
          >
            <input
              style={styles.input}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Écrivez votre message..."
              disabled={isLoading}
            />
            <button
              style={{
                ...styles.sendBtn,
                ...((!input.trim() || isLoading) && styles.sendBtnDisabled),
              }}
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              onMouseOver={(e) => {
                if (input.trim() && !isLoading) {
                  e.currentTarget.style.transform = "scale(1.05)";
                }
              }}
              onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

}
