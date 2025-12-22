import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

// 🔧 équivalent de __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Config Groq
const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

// Charger la knowledge base
const knowledgePath = path.join(__dirname, '..', 'data', 'ensa-knowledge.txt');

let knowledge = '';
try {
  knowledge = fs.readFileSync(knowledgePath, 'utf8');
  console.log('📘 Knowledge chargé.');
} catch (error) {
  console.error('Erreur lecture knowledge:', error);
}

// Fonction de requête Groq
export async function askGroq(question) {
  const result = await openai.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `Assistant ENSA Tanger.\n${knowledge}`,
      },
      {
        role: 'user',
        content: question,
      },
    ],
    temperature: 0.6,
    max_tokens: 400,
  });

  return result.choices[0].message.content;
}
