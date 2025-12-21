import { askGroq } from '../models/chatModel.js';
import { ConversationChat, MessageChat } from '../models/associations.js';
import { Op } from 'sequelize';

// Générer un titre automatique basé sur le 1er message
function generateTitle(firstMessage) {
  const maxLength = 50;
  let title = firstMessage.trim();

  if (title.length > maxLength) {
    title = title.substring(0, maxLength) + '...';
  }

  return title || 'Nouvelle conversation';
}

// Nettoyage auto des conversations > 15 jours
async function cleanOldConversations() {
  try {
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

    const deleted = await ConversationChat.destroy({
      where: {
        createdAt: {
          [Op.lt]: fifteenDaysAgo
        }
      }
    });

    if (deleted > 0) {
      console.log(`🗑️ ${deleted} conversations supprimées (> 15 jours)`);
    }
  } catch (error) {
    console.error('Erreur nettoyage:', error);
  }
}

// Lancer le nettoyage toutes les 24h
setInterval(cleanOldConversations, 24 * 60 * 60 * 1000);

// Endpoint principal de chat
export async function chat(req, res) {
  try {
    const { userId, question, conversationId } = req.body;

    if (!question || !userId) {
      return res.status(400).json({ error: "Question ou userId manquant" });
    }

    let conversation;

    // Si conversationId fourni, on utilise cette conversation
    if (conversationId) {
      conversation = await ConversationChat.findOne({
        where: { idConvChat: conversationId, userId }
      });

      if (!conversation) {
        return res.status(404).json({ error: "Conversation introuvable" });
      }
    } else {
      // Créer nouvelle conversation
      conversation = await ConversationChat.create({
        userId,
        titre: generateTitle(question),
        isActive: true
      });
    }

    // Sauvegarder message utilisateur
    await MessageChat.create({
      idConvChat: conversation.idConvChat,
      role: 'user',
      content: question,
      timestamp: new Date()
    });

    // 🔹 Récupérer l'historique complet de la conversation
    const messagesHistory = await MessageChat.findAll({
      where: { idConvChat: conversation.idConvChat },
      order: [['timestamp', 'ASC']]
    });

    // 🔹 Construire le contexte pour le bot
    let context = '';
    messagesHistory.forEach(msg => {
      if (msg.role === 'user') context += `Utilisateur: ${msg.content}\n`;
      else if (msg.role === 'bot') context += `Assistant: ${msg.content}\n`;
    });
    // Ajouter la nouvelle question à la fin
    context += `Utilisateur: ${question}\n`;

    // 🔹 Obtenir réponse du bot
    const answer = await askGroq(context);

    // Sauvegarder réponse du bot
    await MessageChat.create({
      idConvChat: conversation.idConvChat,
      role: 'bot',
      content: answer,
      timestamp: new Date()
    });

    res.json({
      answer,
      conversationId: conversation.idConvChat,
      conversationTitle: conversation.titre
    });

  } catch (error) {
    console.error("Erreur dans le controller:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

// Récupérer toutes les conversations d'un utilisateur
export async function getConversations(req, res) {
  try {
    const { userId } = req.params;

    const conversations = await ConversationChat.findAll({
      where: { userId },
      order: [['updatedAt', 'DESC']],
      attributes: ['idConvChat', 'titre', 'createdAt', 'updatedAt'],
      limit: 50
    });

    res.json({ conversations });
  } catch (error) {
    console.error("Erreur récupération conversations:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

// Récupérer les messages d'une conversation
export async function getMessages(req, res) {
  try {
    const { conversationId } = req.params;
    const { userId } = req.query;

    const conversation = await ConversationChat.findOne({
      where: { idConvChat: conversationId, userId }
    });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation introuvable" });
    }

    const messages = await MessageChat.findAll({
      where: { idConvChat: conversationId },
      order: [['timestamp', 'ASC']],
      attributes: ['idMsgChat', 'role', 'content', 'timestamp']
    });

    res.json({
      messages,
      conversationTitle: conversation.titre
    });
  } catch (error) {
    console.error("Erreur récupération messages:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

// Supprimer une conversation
export async function deleteConversation(req, res) {
  try {
    const { conversationId } = req.params;
    const { userId } = req.body;

    const deleted = await ConversationChat.destroy({
      where: { idConvChat: conversationId, userId }
    });

    if (deleted === 0) {
      return res.status(404).json({ error: "Conversation introuvable" });
    }

    res.json({ message: "Conversation supprimée avec succès" });
  } catch (error) {
    console.error("Erreur suppression conversation:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

// Créer une nouvelle conversation vide
export async function createNewConversation(req, res) {
  try {
    const { userId } = req.body;

    const conversation = await ConversationChat.create({
      userId,
      titre: 'Nouvelle conversation',
      isActive: true
    });

    res.json({
      conversationId: conversation.idConvChat,
      titre: conversation.titre
    });
  } catch (error) {
    console.error("Erreur création conversation:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
}
