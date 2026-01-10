const openai = require("../config/openai");
const Notes = require("../models/Notes");

exports.generateNotes = async (req, res) => {
  try {
    const { topic } = req.body;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a creative school teacher who writes clear, structured notes for students."
        },
        {
          role: "user",
          content: `
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

Use 4–6 sections. Make them detailed and easy to understand.
DO NOT include anything outside this JSON.
`
        }
      ],
    });

    const raw = completion.choices[0].message.content;

    const data = JSON.parse(raw);

    await Notes.create({
      userId: req.userId,
      topic,
      content: data,
    });

    res.json(data);
  } catch (err) {
    console.error("AI NOTES ERROR:", err);
    res.status(500).json({ msg: "AI failed to generate notes" });
  }
};
