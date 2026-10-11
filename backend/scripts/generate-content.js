const fs = require("fs");
const path = require("path");
const axios = require("axios");
const dotenv = require("dotenv");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { validateQuestion, validateLevel } = require("../services/content-validator");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Provider Configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Multi-provider LLM caller with rotation
async function callLLM(prompt, systemInstruction = "You are an expert ICSE and CBSE school curriculum educator and question bank author. Output valid JSON only.") {
  const providers = [];

  // Groq gpt-oss-120b and gpt-oss-20b run in 2-3s with high token limits and JSON mode
  if (GROQ_API_KEY) providers.push("groq");
  if (OPENROUTER_API_KEY) providers.push("openrouter");
  if (GEMINI_API_KEY) providers.push("gemini");

  if (providers.length === 0) {
    throw new Error("No LLM API keys configured in .env");
  }

  let lastError = null;

  for (const provider of providers) {
    try {
      if (provider === "groq") {
        const groqModels = ["openai/gpt-oss-120b", "openai/gpt-oss-20b"];
        for (const model of groqModels) {
          try {
            const response = await axios.post(
              "https://api.groq.com/openai/v1/chat/completions",
              {
                model,
                messages: [
                  { role: "system", content: systemInstruction },
                  { role: "user", content: prompt },
                ],
                temperature: 0.3,
                max_tokens: 4096,
                response_format: { type: "json_object" },
              },
              {
                headers: {
                  Authorization: `Bearer ${GROQ_API_KEY}`,
                  "Content-Type": "application/json",
                },
                signal: AbortSignal.timeout(30000),
              }
            );
            return response.data.choices[0].message.content;
          } catch (groqErr) {
            if (groqErr.response?.status === 429) {
              console.log(`⏳ Groq ${model} rate limit hit (429). Trying fallback...`);
            } else {
              console.warn(`Groq ${model} failed: ${groqErr.message}`);
            }
          }
        }
      }

      if (provider === "openrouter") {
        const response = await axios.post(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            model: "qwen/qwen-2.5-72b-instruct",
            messages: [
              { role: "system", content: systemInstruction },
              { role: "user", content: prompt },
            ],
            temperature: 0.3,
            response_format: { type: "json_object" },
          },
          {
            headers: {
              Authorization: `Bearer ${OPENROUTER_API_KEY}`,
              "Content-Type": "application/json",
              "HTTP-Referer": "https://learnquest.app",
              "X-Title": "LearnQuest",
            },
            signal: AbortSignal.timeout(35000),
          }
        );
        return response.data.choices[0].message.content;
      }

      if (provider === "gemini") {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-3.8-flash" });
        const callPromise = model.generateContent(`${systemInstruction}\n\n${prompt}`);
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Gemini timeout (15s)")), 15000)
        );
        const result = await Promise.race([callPromise, timeoutPromise]);
        const text = result.response.text();
        return text;
      }
    } catch (err) {
      console.warn(`⚠️ Provider ${provider} failed: ${err.message}. Trying next provider...`);
      lastError = err;
    }
  }

  throw new Error(`All LLM providers failed. Last error: ${lastError?.message}`);
}

function cleanJsonResponse(rawText) {
  let cleaned = rawText.trim();
  const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
    cleaned = codeBlockMatch[1].trim();
  } else {
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1).trim();
    }
  }

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    // If invalid escape character in JSON (common when LLMs output LaTeX \frac without double backslash \\frac), fix unescaped backslashes
    const fixed = cleaned.replace(/(?<!\\)\\(?!["\\/bfnrtu])/g, "\\\\");
    return JSON.parse(fixed);
  }
}

/**
 * Pass 1: Generate Level Lesson walkthrough, worked examples, and candidate questions
 */
async function generateLevelDraft(board, classLevel, subject, chapterTitle, level) {
  const prompt = `
Generate complete educational content for:
Board: ${board}
Class: ${classLevel}
Subject: ${subject}
Chapter: ${chapterTitle}
Level Number: ${level.levelNumber}
Level Title: ${level.title}
Level Description: ${level.description}
Subtopics: ${JSON.stringify(level.subtopics)}

CRITICAL CONSTRAINTS:
1. Formulas and math MUST use standard LaTeX syntax: inline with $...$ (e.g. $\\frac{a}{b}$, $\\sqrt{x}$, $x^2$) and display with $$...$$. NEVER output plain-text fractions like 14/11 or square roots like sqrt(20).
2. Generate a lesson object:
   - title: String
   - intro: String (thorough pedagogical overview)
   - keyConcepts: Array of 3 objects with { title: String, explanation: String (with LaTeX) }
   - tips: Array of 3 teacher tips
3. Generate 2 worked examples:
   - problem: String (with LaTeX)
   - solution: String (step-by-step with LaTeX)
   - explanation: String
4. Generate exactly 12 distinct multiple-choice questions (MCQs) in the "questions" array (minimum 10 required):
   - id: "${level.id}-q" + index
   - type: "mcq"
   - prompt: String (with LaTeX)
   - options: Array of 4 distinct strings (all in LaTeX format like "$\\frac{1}{2}$").
     CRITICAL: NO TWO OPTIONS MAY HAVE THE SAME MATHEMATICAL VALUE! For example, do NOT include both $\\frac{14}{11}$ and $\\frac{126}{99}$, or $\\frac{4}{10}$ and $\\frac{2}{5}$. Every option must represent a distinct mathematical value.
   - correctAnswer: String (MUST be an EXACT string match of one of the 4 options)
   - explanation: String (clear step-by-step mathematical reasoning in LaTeX)
   - hint: String
   - difficulty: "easy" | "medium" | "hard"
   - topicTag: String

Respond with JSON strictly conforming to this schema:
{
  "lesson": { "title": "...", "intro": "...", "keyConcepts": [...], "tips": [...] },
  "examples": [ { "problem": "...", "solution": "...", "explanation": "..." } ],
  "questions": [ { "id": "...", "type": "mcq", "prompt": "...", "options": [...], "correctAnswer": "...", "explanation": "...", "hint": "...", "difficulty": "...", "topicTag": "..." } ]
}
`;

  const raw = await callLLM(prompt);
  return cleanJsonResponse(raw);
}

/**
 * Pass 2: Independent Verification and Quality Gate Pass
 */
async function verifyAndRefineLevel(draft, level) {
  const verifiedQuestions = [];
  let droppedCount = 0;

  for (const q of draft.questions || []) {
    const valRes = validateQuestion(q);
    if (valRes.valid) {
      verifiedQuestions.push(q);
    } else {
      console.warn(`❌ Dropped candidate question ${q.id}: ${valRes.errors.join("; ")}`);
      droppedCount++;
    }
  }

  const refinedLevel = {
    ...level,
    lesson: draft.lesson,
    examples: draft.examples,
    questions: verifiedQuestions,
  };

  const levelVal = validateLevel(refinedLevel, 8);

  return {
    refinedLevel,
    totalGenerated: (draft.questions || []).length,
    passedCount: verifiedQuestions.length,
    droppedCount,
    valid: levelVal.valid,
    errors: levelVal.errors,
  };
}

module.exports = {
  callLLM,
  generateLevelDraft,
  verifyAndRefineLevel,
};
