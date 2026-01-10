const express = require("express");
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid"); // ✅ REQUIRED
const AudioNote = require("../models/AudioNote");
const auth = require("../middleware/auth");

const router = express.Router();

// ensure uploads dir exists
const AUDIO_DIR = path.join(__dirname, "../uploads/audio");
if (!fs.existsSync(AUDIO_DIR)) fs.mkdirSync(AUDIO_DIR, { recursive: true });

/* =======================
   GET MY AUDIO NOTES
======================= */
router.get("/mine", auth, async (req, res) => {
  try {
    const notes = await AudioNote.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.json(notes);
  } catch (err) {
    console.error(err);
    res.json([]);
  }
});

/* =======================
   GENERATE VOICE
======================= */

router.post("/", auth, async (req, res) => {
  try {
    const { text, style } = req.body;
    if (!text) return res.status(400).json({ msg: "No text" });

    const voice =
      style === "naruto"
        ? "alloy"
        : style === "shinchan"
        ? "verse"
        : "nova";

    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini-tts",
        voice,
        input: text,
      }),
    });

    const buffer = Buffer.from(await response.arrayBuffer());

    // 🔹 Save audio file
    const fileName = `${uuidv4()}.mp3`;
    const audioDir = path.join(__dirname, "../uploads/audio");

    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }

    const filePath = path.join(audioDir, fileName);
    fs.writeFileSync(filePath, buffer);

    const audioUrl = `http://localhost:5000/uploads/audio/${fileName}`;

    return res.json({ audioUrl });

  } catch (err) {
    console.error("Voice error:", err);
    res.status(500).json({ msg: "Voice failed" });
  }
});

module.exports = router;
