import OpenAI from "openai";
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });
const gemini = new GoogleGenerativeAI(process.env.GEMINI_KEY);

async function openaiNotes(topic, style) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: `You are a ${style} anime teacher. Write beautiful school notes.` },
      { role: "user", content: `Explain ${topic} in sections with bullet points.` }
    ]
  });
  return completion.choices[0].message.content;
}

async function geminiNotes(topic, style) {
  const model = gemini.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(`Write ${style} style school notes about ${topic} in sections with bullet points`);
  return result.response.text();
}

async function openrouterNotes(topic, style) {
  const res = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model: "mistralai/mistral-7b-instruct",
      messages: [{ role: "user", content: `Write ${style} notes on ${topic}` }]
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_KEY}`,
        "Content-Type": "application/json"
      }
    }
  );
  return res.data.choices[0].message.content;
}

async function groqNotes(topic, style) {
  const res = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: "llama3-8b-8192",
      messages: [{ role: "user", content: `Write ${style} notes on ${topic}` }]
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_KEY}`,
        "Content-Type": "application/json"
      }
    }
  );
  return res.data.choices[0].message.content;
}

export async function generateNotes(topic, style) {
  try {
    return await openaiNotes(topic, style);
  } catch (e1) {
    console.log("OpenAI failed → Gemini");
    try {
      return await geminiNotes(topic, style);
    } catch (e2) {
      console.log("Gemini failed → OpenRouter");
      try {
        return await openrouterNotes(topic, style);
      } catch (e3) {
        console.log("OpenRouter failed → Groq");
        return await groqNotes(topic, style);
      }
    }
  }
}
