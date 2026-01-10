const express = require("express");
const fetch = require("node-fetch");
const router = express.Router();

router.post("/", async (req, res) => {
  const { text } = req.body;

  try {
    const geminiRes = await fetch(
      "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=" +
        process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Convert this into spoken student-friendly voice:\n\n${text}`,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await geminiRes.json();

    const speechText = data.candidates[0].content.parts[0].text;

    res.json({ speech: speechText });
  } catch (err) {
    res.status(500).json({ msg: "TTS failed" });
  }
});

module.exports = router;