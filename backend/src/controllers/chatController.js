import { askGroq } from '../models/chatModel.js';

export async function chat(req, res) {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question manquante' });
    }

    const answer = await askGroq(question);
    res.json({ answer });
  } catch (error) {
    console.error('Erreur dans le controller:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}
