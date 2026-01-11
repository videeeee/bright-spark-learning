const openai = require("../config/openai");
const Notes = require("../models/Notes");
const fetch = require("node-fetch");

/* ================= GEMINI CONFIG ================= */
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

/* ================= JSON SAFE PARSER ================= */
const extractJSON = (text) => {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("Invalid JSON from AI");
  }
  return JSON.parse(text.slice(start, end + 1));
};

/* ================= MAIN CONTROLLER ================= */
exports.generateNotes = async (req, res) => {
  const { topic } = req.body;

  const prompt = `
Create notes for "${topic}" in this EXACT JSON format:

{
  "title": "Creative student friendly title",
  "sections": [
    {
      "heading": "Section heading",
      "content": "Explain in 3–5 sentences."
    }
  ]
}

Use 4–6 sections.
DO NOT include anything outside this JSON.
`;

  /* ========== 1️⃣ TRY OPENAI FIRST ========== */
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a creative school teacher who writes clear, structured notes for students."
        },
        { role: "user", content: prompt }
      ]
    });

    const raw = completion.choices[0].message.content;
    const data = extractJSON(raw);

    await Notes.create({
      userId: req.userId,
      topic,
      content: data
    });

    return res.json({ source: "openai", ...data });

  } catch (openaiError) {
    console.warn("⚠️ OpenAI failed, switching to Gemini...");
  }

  /* ========== 2️⃣ FALLBACK TO GEMINI ========== */
  try {
    const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      })
    });

    const result = await response.json();

    const raw =
      result.candidates?.[0]?.content?.parts?.[0]?.text || "";

    const data = extractJSON(raw);

    await Notes.create({
      userId: req.userId,
      topic,
      content: data
    });

    return res.json({ source: "gemini", ...data });

  } catch (geminiError) {
    console.error("❌ GEMINI ALSO FAILED:", geminiError);
    return res.status(500).json({
      msg: "Both OpenAI and Gemini failed to generate notes"
    });
  }
};