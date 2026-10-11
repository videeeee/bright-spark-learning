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

// Call specific provider
async function callSpecificProvider(provider, prompt, systemInstruction = "You are an expert ICSE and CBSE educator. Output valid JSON only.") {
  if (provider === "groq") {
    if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY not configured");
    const models = ["openai/gpt-oss-120b", "openai/gpt-oss-20b", "qwen/qwen3.8-27b"];
    for (const model of models) {
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
        return { content: response.data.choices[0].message.content, provider: "groq", model };
      } catch (err) {
        if (err.response?.status === 429) {
          console.warn(`⏳ Groq ${model} 429 rate limit. Trying next model...`);
        } else {
          console.warn(`Groq ${model} error: ${err.message}`);
        }
      }
    }
    throw new Error("All Groq models failed");
  }

  if (provider === "gemini") {
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-3.8-flash" });
    const callPromise = model.generateContent(`${systemInstruction}\n\n${prompt}`);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Gemini timeout (20s)")), 20000)
    );
    const result = await Promise.race([callPromise, timeoutPromise]);
    const text = result.response.text();
    return { content: text, provider: "gemini", model: "gemini-3.8-flash" };
  }

  throw new Error(`Unsupported provider: ${provider}`);
}

// Fallback caller across providers
async function callLLM(prompt, systemInstruction) {
  const preferred = [];
  if (GROQ_API_KEY) preferred.push("groq");
  if (GEMINI_API_KEY) preferred.push("gemini");

  let lastError = null;
  for (const prov of preferred) {
    try {
      const res = await callSpecificProvider(prov, prompt, systemInstruction);
      return res;
    } catch (err) {
      console.warn(`⚠️ Provider ${prov} failed: ${err.message}. Trying next...`);
      lastError = err;
    }
  }

  throw new Error(`All providers failed: ${lastError?.message}`);
}

/**
 * Robust JSON Parser that cleans control characters, repairs unescaped LaTeX backslashes,
 * and ensures valid JSON without corruption.
 */
function cleanJsonResponse(rawText) {
  let cleaned = rawText.trim();
  const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
    cleaned = codeBlockMatch[1].trim();
  } else {
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1).trim();
    }
  }

  // Repair corrupted control characters caused by single-backslash escapes
  // \u000c (form feed) followed by "rac" was originally "\frac"
  cleaned = cleaned.replace(/\u000crac/g, "\\\\frac");
  // \u0008 (backspace) followed by "ar" was originally "\bar"
  cleaned = cleaned.replace(/\u0008ar/g, "\\\\bar");
  // Strip raw unescaped control characters
  cleaned = cleaned.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");

  // Protect common LaTeX backslashes in JSON strings
  const latexCommands = [
    "frac", "sqrt", "times", "div", "text", "pi", "alpha", "beta", "theta",
    "sigma", "lambda", "le", "ge", "pm", "neq", "approx", "sum", "int",
    "infty", "cdot", "overline", "bar", "binom", "left", "right"
  ];
  for (const cmd of latexCommands) {
    const re = new RegExp(`(?<!\\\\)\\\\${cmd}\\b`, "g");
    cleaned = cleaned.replace(re, `\\\\${cmd}`);
  }

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    // Second-pass repair: double-escape any solitary backslash
    const fixed = cleaned.replace(/(?<!\\)\\(?!["\\/bfnrtu])/g, "\\\\");
    return JSON.parse(fixed);
  }
}

/**
 * Builds subject-specific prompt templates to prevent LaTeX in humanities and enforce math rigor in STEM
 */
function buildSubjectPrompt(board, classLevel, subject, chapterTitle, level) {
  const sub = subject.toLowerCase();
  const isMath = sub.includes("math");
  const isSci = sub.includes("sci") || sub.includes("phys") || sub.includes("chem") || sub.includes("bio");
  const isComp = sub.includes("comp");
  const isEng = sub.includes("eng");
  const isHin = sub.includes("hin");
  const isSst = sub.includes("soc") || sub.includes("hist") || sub.includes("civ") || sub.includes("geo");

  let subjectRules = "";

  if (isMath) {
    subjectRules = `
SUBJECT FORMATTING RULES (MATHEMATICS):
1. Formulas and math MUST use standard LaTeX syntax: inline with $...$ (e.g. $\\frac{a}{b}$, $\\sqrt{x}$, $x^2$) and display with $$...$$. NEVER output plain-text fractions like 14/11 or square roots like sqrt(20). All backslashes in JSON MUST be double-escaped: \\\\frac, \\\\sqrt.
2. Every question must have 4 options, all in LaTeX format.
3. CRITICAL: NO TWO OPTIONS MAY HAVE THE SAME MATHEMATICAL VALUE!
   For example, do NOT include both $\\frac{14}{11}$ and $\\frac{126}{99}$, or $\\frac{4}{10}$ and $\\frac{2}{5}$, or $\\frac{29}{50}$ and $\\frac{58}{100}$.
   Every single option must evaluate to a distinct mathematical value.
`;
  } else if (isSci) {
    subjectRules = `
SUBJECT FORMATTING RULES (SCIENCE):
1. Use standard LaTeX syntax for scientific formulas, units, and chemical equations where needed (e.g. $F = ma$, $v^2 = u^2 + 2as$, $\\text{H}_2\\text{O}$). Double-escape all backslashes in JSON (\\\\text, \\\\frac).
2. Every question must have 4 options. All options must be conceptually and numerically distinct.
`;
  } else if (isComp) {
    subjectRules = `
SUBJECT FORMATTING RULES (COMPUTER APPLICATIONS - JAVA & OOP):
1. STRICTLY FORBID mathematical LaTeX markup like $\\frac{a}{b}$ or $\\pi$. This is a Computer Science subject.
2. Use standard backticks for code identifiers and snippets, e.g. \`int x = 10;\`, \`public static void main\`.
3. Questions must test ICSE Class 9 Java: OOP principles (encapsulation, abstraction, inheritance, polymorphism), classes, objects, data types, operators.
4. Options must be programming terms, outputs, or code keywords. NEVER use fractions or math expressions as options.
`;
  } else if (isEng) {
    subjectRules = `
SUBJECT FORMATTING RULES (ENGLISH LANGUAGE & LITERATURE):
1. STRICTLY FORBID LaTeX markup, dollar signs ($), and mathematical symbols. This is an English language subject.
2. Questions must test ICSE Class 9 English grammar (verb tenses, subject-verb agreement, active/passive voice, direct/indirect speech, prepositions) and vocabulary.
3. Every question must have 4 options, all in clear English words or phrases (e.g. ["had finished", "has finished", "finished", "was finishing"]).
4. NEVER use fractions, numbers, or mathematical symbols as options for grammar questions.
`;
  } else if (isHin) {
    subjectRules = `
SUBJECT FORMATTING RULES (HINDI - हिन्दी व्याकरण व साहित्य):
1. STRICTLY FORBID LaTeX markup, dollar signs ($), and mathematical symbols.
2. All questions, options, explanations, and lessons MUST be written in correct Devanagari Hindi script.
3. Questions must test ICSE Class 9 Hindi grammar: विलोम शब्द, पर्यायवाची शब्द, मुहावरे व लोकोक्तियाँ, वर्तनी-शुद्धिकरण, अनेक शब्दों के लिए एक शब्द।
4. Every question must have 4 options in Hindi. NEVER use English or numbers as grammar options.
`;
  } else if (isSst) {
    subjectRules = `
SUBJECT FORMATTING RULES (SOCIAL STUDIES - HISTORY & CIVICS / GEOGRAPHY):
1. STRICTLY FORBID LaTeX markup, dollar signs ($), and mathematical symbols.
2. Questions must test ICSE Class 9 History & Civics (Our Constitution, Fundamental Rights and Duties, Harappan Civilization, Vedic Period) and Geography.
3. Every question must have 4 options in clear English terms, dates, or constitutional articles.
`;
  } else {
    subjectRules = `
SUBJECT FORMATTING RULES:
1. Pure standard text only. No unwarranted LaTeX formulas.
2. Every question must have 4 distinct options.
`;
  }

  return `
Generate complete educational content for:
Board: ${board}
Class: ${classLevel}
Subject: ${subject}
Chapter: ${chapterTitle}
Level Number: ${level.levelNumber}
Level Title: ${level.title}
Level Description: ${level.description}
Subtopics: ${JSON.stringify(level.subtopics)}

${subjectRules}

GENERAL REQUIREMENTS:
1. Generate a lesson object:
   - title: String
   - intro: String (pedagogical overview suited for Class 9 students)
   - keyConcepts: Array of 3 objects with { title: String, explanation: String }
   - tips: Array of 3 practical exam/study tips
2. Generate 2 worked examples:
   - problem: String
   - solution: String (step-by-step)
   - explanation: String
3. Generate exactly 12 distinct multiple-choice questions (MCQs):
   - id: "${level.id}-q" + (index + 1)
   - type: "mcq"
   - prompt: String
   - options: Array of 4 distinct strings
   - correctAnswer: String (MUST be an EXACT string match of one of the 4 options)
   - explanation: String (clear step-by-step reasoning, at least 15 words)
   - hint: String
   - difficulty: "easy" | "medium" | "hard"
   - topicTag: String

Respond with JSON strictly conforming to this schema:
{
  "lesson": { "title": "...", "intro": "...", "keyConcepts": [...], "tips": [...] },
  "examples": [ { "problem": "...", "solution": "...", "explanation": "..." } ],
  "questions": [
    {
      "id": "...",
      "type": "mcq",
      "prompt": "...",
      "options": ["...", "...", "...", "..."],
      "correctAnswer": "...",
      "explanation": "...",
      "hint": "...",
      "difficulty": "medium",
      "topicTag": "..."
    }
  ]
}
`;
}

/**
 * Pass 1: Generate Level Lesson walkthrough, worked examples, and candidate questions
 */
async function generateLevelDraft(board, classLevel, subject, chapterTitle, level) {
  const prompt = buildSubjectPrompt(board, classLevel, subject, chapterTitle, level);
  const res = await callLLM(prompt);
  const parsed = cleanJsonResponse(res.content);
  return { draft: parsed, generatorProvider: res.provider, generatorModel: res.model };
}

/**
 * Pass 2: Independent verification pass using an alternative LLM
 * The verifier model receives ONLY the prompt and options (WITHOUT correctAnswer or explanation)
 */
async function solveQuestionIndependently(q, verifierProvider) {
  const prompt = `
You are an expert exam solver and validator.
Solve this multiple choice question independently. Choose the single best answer from the given options.

Question: ${q.prompt}
Options:
1. ${q.options[0]}
2. ${q.options[1]}
3. ${q.options[2]}
4. ${q.options[3]}

Respond with valid JSON containing ONLY the chosen option text:
{
  "selectedAnswer": "..."
}
`;

  try {
    const res = await callSpecificProvider(
      verifierProvider,
      prompt,
      "You are an expert curriculum validator. Return valid JSON only with key selectedAnswer matching one of the options verbatim."
    );
    const parsed = cleanJsonResponse(res.content);
    return parsed.selectedAnswer;
  } catch (err) {
    console.warn(`Verifier (${verifierProvider}) failed: ${err.message}`);
    return null;
  }
}

/**
 * Pass 2: Independent Verification and Quality Gate
 */
async function verifyAndRefineLevel(draft, level, subject, generatorProvider) {
  // Determine verifier provider (cross-verification with different provider)
  let verifierProvider = null;
  if (generatorProvider === "groq" && GEMINI_API_KEY) {
    verifierProvider = "gemini";
  } else if (generatorProvider === "gemini" && GROQ_API_KEY) {
    verifierProvider = "groq";
  }

  const verifiedQuestions = [];
  let droppedCount = 0;
  let crossVerifiedCount = 0;

  for (const q of draft.questions || []) {
    // 1. First run the deterministic rule validator
    const ruleRes = validateQuestion(q, { subject });
    if (!ruleRes.valid) {
      console.warn(`❌ Dropped candidate question ${q.id} (failed rule checks): ${ruleRes.errors.join("; ")}`);
      droppedCount++;
      continue;
    }

    // 2. Run independent second-pass verification if an alternate provider is available
    let isCrossVerified = false;
    if (verifierProvider) {
      try {
        const solvedAns = await solveQuestionIndependently(q, verifierProvider);
        if (solvedAns && String(solvedAns).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase()) {
          isCrossVerified = true;
          crossVerifiedCount++;
        } else if (solvedAns) {
          console.warn(`⚠️ Verifier mismatch on ${q.id}: Generator="${q.correctAnswer}" vs Verifier="${solvedAns}"`);
        }
      } catch (verErr) {
        console.warn(`Verifier error on question ${q.id}:`, verErr.message);
      }
    }

    q.verificationStatus = isCrossVerified ? "cross_verified" : "rule_checked";
    verifiedQuestions.push(q);
  }

  // Publish condition:
  // If verifier was available, prefer at least 8 cross_verified questions
  // Otherwise require at least 8 rule_checked questions
  const hasEnoughCrossVerified = crossVerifiedCount >= 8;
  const hasEnoughRuleChecked = verifiedQuestions.length >= 8;
  const shouldPublish = verifierProvider ? hasEnoughCrossVerified : hasEnoughRuleChecked;

  const refinedLevel = {
    ...level,
    lesson: draft.lesson,
    examples: draft.examples,
    questions: verifiedQuestions,
    status: shouldPublish ? "published" : "draft",
    verifiedWith: verifierProvider ? `${generatorProvider}+${verifierProvider}` : generatorProvider,
  };

  const levelVal = validateLevel(refinedLevel, { minQuestions: 8, subject });

  return {
    refinedLevel,
    totalGenerated: (draft.questions || []).length,
    passedCount: verifiedQuestions.length,
    crossVerifiedCount,
    droppedCount,
    valid: levelVal.valid,
    errors: levelVal.errors,
  };
}

module.exports = {
  callSpecificProvider,
  callLLM,
  cleanJsonResponse,
  buildSubjectPrompt,
  generateLevelDraft,
  solveQuestionIndependently,
  verifyAndRefineLevel,
};
