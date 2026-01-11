exports.giveFreely = async (req, res) => {
  res.json({
    text: "AI response working successfully"
  });
};

const fetch = require("node-fetch");

/* ---------------- DUMMY TEST ---------------- */
exports.giveFreely = async (req, res) => {
  res.json({ text: "AI response working successfully" });
};

/* ---------------- GROQ AI ---------------- */

const GROQ_API_KEY = process.env.GROQ_API_KEY;

exports.generateWithAI = async (prompt) => {
  try {
    if (!GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY missing");
    }

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.6
        })
      }
    );

    const data = await response.json();

    const text = data?.choices?.[0]?.message?.content;

    if (!text) {
      throw new Error("Empty Groq response");
    }

    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("Groq did not return JSON");
    }

    return JSON.parse(match[0]);

  } catch (error) {
    console.error("❌ GROQ AI ERROR:", error.message);
    throw error;
  }
};