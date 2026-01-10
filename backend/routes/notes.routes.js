const express = require("express");
const { generateNotes } = require("../services/ai.service");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { topic, style } = req.body;

    const normalized = await generateNotes(topic, style);

    // 🔥 Send EXACTLY what frontend expects
    res.json(normalized);
  } catch (err) {
    console.error("AI error:", err);
    res.status(500).json({ msg: "AI failed" });
  }
});

module.exports = router;
