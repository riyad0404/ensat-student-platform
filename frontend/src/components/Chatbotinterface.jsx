"use client"

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
} from "lucide-react"

const API_BASE_URL = "http://localhost:5000/api/chat"

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
    position: "relative",
    overflow: "hidden",
  },
  backgroundPattern: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage:
      "radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 135, 255, 0.3) 0%, transparent 50%)",
    pointerEvents: "none",
  },
  sidebar: {
    position: "fixed",
    left: 0,
    top: 0,
    bottom: 0,
    width: "320px",
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(20px)",
    boxShadow: "4px 0 24px rgba(0, 0, 0, 0.1)",
    zIndex: 20,
    transition: "transform 0.3s ease",
    display: "flex",
    flexDirection: "column",
  },
  sidebarHidden: {
    transform: "translateX(-100%)",
  },
  sidebarHeader: {
    padding: "1.5rem 1rem",
    borderBottom: "1px solid rgba(102, 126, 234, 0.2)",
    background: "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
  },
  sidebarTitle: {
    fontSize: "1.25rem",
    fontWeight: "bold",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    marginBottom: "1rem",
  },
  newConvBtn: {
    width: "100%",
    padding: "0.875rem 1rem",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "0.75rem",
    cursor: "pointer",
    fontSize: "0.9375rem",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
    transition: "all 0.3s",
  },
  conversationsList: {
    flex: 1,
    overflowY: "auto",
    padding: "1rem",
  },
  conversationItem: {
    padding: "1rem",
    marginBottom: "0.5rem",
    background: "rgba(102, 126, 234, 0.05)",
    borderRadius: "0.75rem",
    cursor: "pointer",
    transition: "all 0.3s",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "0.75rem",
  },
  conversationItemActive: {
    background: "linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)",
    borderLeft: "4px solid #667eea",
  },
  conversationInfo: {
    flex: 1,
    overflow: "hidden",
  },
  conversationTitle: {
    fontSize: "0.9375rem",
    fontWeight: "500",
    color: "#1f2937",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  conversationDate: {
    fontSize: "0.75rem",
    color: "#9ca3af",
    marginTop: "0.25rem",
  },
  deleteBtn: {
    padding: "0.5rem",
    background: "rgba(239, 68, 68, 0.1)",
    border: "none",
    borderRadius: "0.5rem",
    cursor: "pointer",
    color: "#ef4444",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s",
  },
  toggleSidebarBtn: {
    position: "fixed",
    left: "1rem",
    top: "1rem",
    width: "2.5rem",
    height: "2.5rem",
    borderRadius: "0.75rem",
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(102, 126, 234, 0.2)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    zIndex: 30,
    transition: "all 0.3s",
  },
  mainContent: {
    marginLeft: "320px",
    transition: "margin-left 0.3s ease",
    display: "flex",
    flexDirection: "column",
    height: "100vh",
  },
  mainContentExpanded: {
    marginLeft: 0,
  },
  header: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(20px)",
    color: "#1f2937",
    padding: "1.5rem 1rem",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
    position: "relative",
    zIndex: 10,
  },
  headerContent: {
    maxWidth: "56rem",
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  logoCircle: {
    width: "3.5rem",
    height: "3.5rem",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    borderRadius: "1rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 16px rgba(102, 126, 234, 0.4)",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    margin: 0,
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  statusContainer: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  statusDot: {
    width: "8px",
    height: "8px",
    backgroundColor: "#10b981",
    borderRadius: "50%",
    animation: "pulse 2s infinite",
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
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    borderRadius: "0.75rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
  },
  userAvatar: {
    width: "2.5rem",
    height: "2.5rem",
    background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    borderRadius: "0.75rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 12px rgba(240, 147, 251, 0.4)",
    marginLeft: "0.75rem",
  },
  messageBubble: {
    borderRadius: "1.25rem",
    padding: "1.25rem",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
    maxWidth: "40rem",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
  },
  messageBubbleUser: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
  },
  messageBubbleBot: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    color: "#1f2937",
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
    color: "rgba(255, 255, 255, 0.8)",
  },
  messageTimeBot: {
    color: "#9ca3af",
  },
  actionButtons: {
    display: "flex",
    gap: "0.5rem",
  },
  actionBtn: {
    padding: "0.5rem",
    backgroundColor: "rgba(102, 126, 234, 0.1)",
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
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    borderRadius: "50%",
    animation: "bounce 1s infinite",
  },
  inputArea: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(20px)",
    borderTop: "1px solid rgba(255, 255, 255, 0.2)",
    padding: "1.5rem 1rem",
    boxShadow: "0 -8px 32px rgba(0, 0, 0, 0.1)",
    zIndex: 10,
  },
  inputContent: {
    maxWidth: "56rem",
    margin: "0 auto",
  },
  quickButtons: {
    display: "flex",
    gap: "0.75rem",
    marginBottom: "1rem",
    flexWrap: "wrap",
  },
  quickBtn: {
    fontSize: "0.875rem",
    color: "#667eea",
    background: "rgba(102, 126, 234, 0.1)",
    border: "1px solid rgba(102, 126, 234, 0.2)",
    cursor: "pointer",
    fontWeight: "500",
    padding: "0.625rem 1rem",
    borderRadius: "9999px",
    transition: "all 0.3s",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  inputWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    backgroundColor: "white",
    borderRadius: "1.25rem",
    padding: "0.75rem 1rem",
    border: "2px solid rgba(102, 126, 234, 0.2)",
    transition: "all 0.3s",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.05)",
  },
  input: {
    flex: 1,
    backgroundColor: "transparent",
    padding: "0.5rem",
    outline: "none",
    border: "none",
    color: "#1f2937",
    fontSize: "0.9375rem",
  },
  sendBtn: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    borderRadius: "0.875rem",
    padding: "0.875rem",
    border: "none",
    cursor: "pointer",
    transition: "all 0.3s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
  },
  sendBtnDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  copyNotification: {
    position: "fixed",
    top: "6rem",
    right: "1.5rem",
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "white",
    padding: "1rem 1.5rem",
    borderRadius: "0.875rem",
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    boxShadow: "0 8px 24px rgba(16, 185, 129, 0.4)",
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
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
    background: "rgba(102, 126, 234, 0.05)",
    borderRadius: "0.75rem",
    borderLeft: "3px solid #667eea",
    transition: "all 0.2s",
  },
  bulletPoint: {
    width: "0.5rem",
    height: "0.5rem",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    marginRight: "0.75rem",
    marginTop: "0.5rem",
    flexShrink: 0,
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
      '<a href="$2" style="color: #667eea; text-decoration: underline; font-weight: 500;" target="_blank" rel="noopener noreferrer">$1 ↗</a>',
    )

    processed = processed.replace(
      /`(.+?)`/g,
      '<code style="background-color: rgba(102, 126, 234, 0.1); padding: 0.125rem 0.5rem; border-radius: 0.375rem; font-family: monospace; color: #667eea;">$1</code>',
    )

    return <span dangerouslySetInnerHTML={{ __html: processed }} />
  }

  return renderContent(content)
}

export default function ChatbotInterface() {
  const { user } = useAuth()

  const [conversations, setConversations] = useState([])
  const [currentConversationId, setCurrentConversationId] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

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
      console.error("Utilisateur non connecté")
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/conversation/new`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.iduser }),
      })
      const data = await response.json()
      console.log("[v0] Nouvelle conversation créée:", data)

      setCurrentConversationId(data.conversationId)
      setMessages([
        {
          id: 1,
          type: "bot",
          text: "Bienvenue! Je suis l'assistant virtuel de l'ENSA Tanger. Comment puis-je vous aider aujourd'hui?",
          time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
        },
      ])

      await loadConversations()
    } catch (error) {
      console.error("Erreur lors de la création de la conversation:", error)
    }
  }

  const loadConversation = async (conversationId) => {
    if (!user?.iduser) {
      console.error("Utilisateur non connecté")
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/conversation/${conversationId}/messages?userId=${user.iduser}`)
      const data = await response.json()
      console.log("[v0] Messages chargés:", data.messages)

      const formattedMessages = data.messages.map((msg, index) => ({
        id: index + 1,
        type: msg.role,
        text: msg.content,
        time: new Date(msg.timestamp).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      }))

      setMessages(formattedMessages)
      setCurrentConversationId(conversationId)
    } catch (error) {
      console.error("Erreur lors du chargement de la conversation:", error)
    }
  }

  const deleteConversation = async (conversationId, e) => {
    e.stopPropagation()

    if (!user?.iduser) {
      console.error("Utilisateur non connecté")
      return
    }

    try {
      await fetch(`${API_BASE_URL}/conversation/${conversationId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.iduser }),
      })
      console.log("[v0] Conversation supprimée:", conversationId)

      if (currentConversationId === conversationId) {
        setCurrentConversationId(null)
        setMessages([
          {
            id: 1,
            type: "bot",
            text: "Bienvenue! Je suis l'assistant virtuel de l'ENSA Tanger. Comment puis-je vous aider aujourd'hui?",
            time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
          },
        ])
      }

      await loadConversations()
    } catch (error) {
      console.error("Erreur lors de la suppression de la conversation:", error)
    }
  }

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

      <button
        style={styles.toggleSidebarBtn}
        onClick={() => setSidebarOpen(!sidebarOpen)}
        onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
        onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        {sidebarOpen ? <X size={20} color="#667eea" /> : <Menu size={20} color="#667eea" />}
      </button>

      <div style={{ ...styles.sidebar, ...(sidebarOpen ? {} : styles.sidebarHidden) }}>
        <div style={styles.sidebarHeader}>
          <h2 style={styles.sidebarTitle}>Conversations</h2>
          <button
            style={styles.newConvBtn}
            onClick={createNewConversation}
            onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
            onMouseOut={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            <Plus size={20} />
            Nouvelle conversation
          </button>
        </div>

        <div style={styles.conversationsList}>
          {conversations.length === 0 ? (
            <p style={{ textAlign: "center", color: "#9ca3af", fontSize: "0.875rem", marginTop: "2rem" }}>
              Aucune conversation
            </p>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.idConvChat}
                style={{
                  ...styles.conversationItem,
                  ...(currentConversationId === conv.idConvChat ? styles.conversationItemActive : {}),
                }}
                onClick={() => loadConversation(conv.idConvChat)}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "rgba(102, 126, 234, 0.1)")}
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    currentConversationId === conv.idConvChat
                      ? "rgba(102, 126, 234, 0.2)"
                      : "rgba(102, 126, 234, 0.05)")
                }
              >
                <div style={styles.conversationInfo}>
                  <div style={styles.conversationTitle}>{conv.titre}</div>
                  <div style={styles.conversationDate}>{formatDate(conv.updatedAt)}</div>
                </div>
                <button
                  style={styles.deleteBtn}
                  onClick={(e) => deleteConversation(conv.idConvChat, e)}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.2)")}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.1)")}
                  title="Supprimer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div style={{ ...styles.mainContent, ...(sidebarOpen ? {} : styles.mainContentExpanded) }}>
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <div style={styles.logo}>
              <div style={styles.logoCircle}>
                <Sparkles color="white" size={24} />
              </div>
              <div>
                <h1 style={styles.title}>DocentraBot</h1>
                <div style={styles.statusContainer}>
                  <div style={styles.statusDot} />
                  <p style={styles.status}>En ligne</p>
                </div>
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
                            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "rgba(102, 126, 234, 0.2)")}
                            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "rgba(102, 126, 234, 0.1)")}
                            title="Copier le message"
                          >
                            <Copy style={{ width: "1rem", height: "1rem", color: "#667eea" }} />
                          </button>
                          <button
                            style={styles.actionBtn}
                            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "rgba(102, 126, 234, 0.2)")}
                            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "rgba(102, 126, 234, 0.1)")}
                            title="Utile"
                          >
                            <ThumbsUp style={{ width: "1rem", height: "1rem", color: "#667eea" }} />
                          </button>
                          <button
                            style={styles.actionBtn}
                            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "rgba(102, 126, 234, 0.2)")}
                            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "rgba(102, 126, 234, 0.1)")}
                            title="Pas utile"
                          >
                            <ThumbsDown style={{ width: "1rem", height: "1rem", color: "#667eea" }} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {message.type === "user" && (
                  <div style={styles.userAvatar}>
                    <User color="white" size={20} />
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

        <div style={styles.inputArea}>
          <div style={styles.inputContent}>
            <div style={styles.quickButtons}>
              <button
                style={styles.quickBtn}
                onClick={() => handleQuickQuestion("Qu'est-ce que l'ENSA Tanger?")}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  e.currentTarget.style.color = "white"
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "rgba(102, 126, 234, 0.1)"
                  e.currentTarget.style.color = "#667eea"
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
                  e.currentTarget.style.background = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  e.currentTarget.style.color = "white"
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "rgba(102, 126, 234, 0.1)"
                  e.currentTarget.style.color = "#667eea"
                }}
                disabled={isLoading}
              >
                <MessageCircle size={14} />
                Filières disponibles
              </button>
            </div>
            <div
              style={styles.inputWrapper}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#667eea")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(102, 126, 234, 0.2)")}
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
                    e.currentTarget.style.transform = "scale(1.05)"
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
  )
}
