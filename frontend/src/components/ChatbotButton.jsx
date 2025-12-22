"use client"

import { MessageCircle } from "lucide-react"
import { useState } from "react"

const styles = {
  floatingButton: {
    position: "fixed",
    bottom: "2rem",
    right: "2rem",
    width: "3.5rem",
    height: "3.5rem",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    border: "none",
    cursor: "pointer",
    boxShadow: "0 8px 24px rgba(102, 126, 234, 0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    transition: "all 0.3s ease",
  },
  notificationBadge: {
    position: "absolute",
    top: "-4px",
    right: "-4px",
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    background: "#ef4444",
    color: "white",
    fontSize: "0.75rem",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "2px solid white",
  },
  tooltip: {
    position: "absolute",
    right: "4rem",
    bottom: "0.5rem",
    background: "rgba(0, 0, 0, 0.8)",
    color: "white",
    padding: "0.5rem 1rem",
    borderRadius: "0.5rem",
    fontSize: "0.875rem",
    whiteSpace: "nowrap",
    opacity: 0,
    transition: "opacity 0.3s ease",
    pointerEvents: "none",
  },
  tooltipVisible: {
    opacity: 1,
  },
}

export default function ChatbotButton({ onClick }) {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div style={{ position: "relative" }}>
      <button
        style={styles.floatingButton}
        onClick={onClick}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.1)"
          e.currentTarget.style.boxShadow = "0 12px 32px rgba(102, 126, 234, 0.5)"
          setShowTooltip(true)
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)"
          e.currentTarget.style.boxShadow = "0 8px 24px rgba(102, 126, 234, 0.4)"
          setShowTooltip(false)
        }}
        aria-label="Ouvrir le chatbot"
      >
        <MessageCircle color="white" size={24} />
      </button>
      <div style={{ ...styles.tooltip, ...(showTooltip && styles.tooltipVisible) }}>
        Besoin d'aide? Discutez avec notre assistant
      </div>
    </div>
  )
}
