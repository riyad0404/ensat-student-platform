// src/models/chatModel.js
import OpenAI from "openai";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config();

const isTest = process.env.NODE_ENV === "test";

// ESM __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const knowledgePath = path.join(__dirname, "..", "data", "ensa-knowledge.txt");

// Lazy singletons (created only when needed)
let openaiClient = null;
let knowledgeCache = null;

function getOpenAI() {
  if (isTest) return null; // ✅ in tests: don't create network client
  if (openaiClient) return openaiClient;

  openaiClient = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
  });

  return openaiClient;
}

function getKnowledge() {
  if (isTest) return ""; // ✅ in tests: no file read, no logs
  if (knowledgeCache !== null) return knowledgeCache;

  try {
    knowledgeCache = fs.readFileSync(knowledgePath, "utf8");
    console.log("📘 Knowledge chargé.");
  } catch (error) {
    console.error("Erreur lecture knowledge:", error);
    knowledgeCache = "";
  }

  return knowledgeCache;
}

// Fonction de requête Groq
export async function askGroq(question) {
  if (isTest) {
    // ✅ predictable behavior in tests
    return "Groq disabled in test environment";
  }

  const openai = getOpenAI();
  const knowledge = getKnowledge();

  const result = await openai.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: `Assistant ENSA Tanger.\n${knowledge}` },
      { role: "user", content: question },
    ],
    temperature: 0.6,
    max_tokens: 400,
  });

  return result.choices[0].message.content;
}
