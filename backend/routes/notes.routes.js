const express = require("express");
const Notes = require("../models/Notes");
const auth = require("../middleware/auth");
const fetch = require("node-fetch");

const router = express.Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL =
"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

// JSON extractor for AI responses
const extractJSON = (text) => {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("Invalid JSON from AI");
  }
  return JSON.parse(text.slice(start, end + 1));
};

// GET all notes for logged-in user (protected)
router.get("/", auth, async (req, res) => {
  try {
    const notes = await Notes.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    res.json(notes);
  } catch (err) {
    console.error("Fetch notes error:", err);
    res.status(500).json({ msg: "Failed to fetch notes" });
  }
});

// POST - Generate and save notes (protected)
router.post("/", auth, async (req, res) => {
  try {
    const { topic, style } = req.body;

    if (!topic) {
      return res.status(400).json({ msg: "Topic required" });
    }

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

Use 4–6 sections. Add the style preference: "${style || 'clear'}".
DO NOT include anything outside this JSON.
`;

    // Try Gemini
    let aiData = null;

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

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const result = await response.json();
      const raw = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
      aiData = extractJSON(raw);
    } catch (geminiError) {
      console.error("Gemini error:", geminiError);
      return res.status(500).json({ msg: "AI generation failed", error: geminiError.message });
    }

    // Save to database
    const note = await Notes.create({
      userId: req.user.id,
      topic,
      content: aiData.sections,
      title: aiData.title,
      style: style || "default"
    });

    res.json({
      ...aiData,
      _id: note._id,
      createdAt: note.createdAt
    });
  } catch (err) {
    console.error("Generate notes error:", err);
    res.status(500).json({ msg: "Failed to generate notes", error: err.message });
  }
});

// DELETE a note (protected)
router.delete("/:id", auth, async (req, res) => {
  try {
    const note = await Notes.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ msg: "Note not found" });
    }

    // Verify ownership
    if (note.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    await Notes.findByIdAndDelete(req.params.id);

    res.json({ msg: "Note deleted" });
  } catch (err) {
    console.error("Delete note error:", err);
    res.status(500).json({ msg: "Failed to delete note" });
  }
});

module.exports = router;
