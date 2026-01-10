const OpenAI = require("openai");
const fetch = require("node-fetch");

// ---------------- TEXT CLEANER ----------------
function cleanStudentText(text) {
    if (!text) return "";

    return text
        .replace(/\$/g, "")
        .replace(/\\times/g, "×")
        .replace(/\\div/g, "÷")
        .replace(/\\sqrt/g, "sqrt")
        .replace(/\\text\{([^}]*)\}/g, "$1")
        .replace(/\\+/g, "")
        .replace(/\s{2,}/g, " ")
        .trim();
}

// ---------------- OPENAI ----------------
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// ---------------- GEMINI ----------------
const GEMINI_URL =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=" +
    process.env.GEMINI_API_KEY;

// ---------------- NOTEBOOK-LM PROMPT ----------------
function buildNotebookLMPrompt(topic, style) {
    if (style === "shinchan") {
        return `
Explain "${topic}" in a complete Crayon Shin-chan classroom.

Rules:
Use Shin-chan, Kazama, Nene, Masao, and Bo-chan as characters.
Shin-chan should explain the topic in a funny, playful, but still accurate way.
Kazama should explain the formal definitions and technical terms.
Nene should break the concept step-by-step like exam-oriented teaching.
Masao should ask common doubts and confusions students usually have.
Bo-chan should give calm, simplified summaries and memory tricks.
Style:
Light, humorous, but conceptually correct.
Use short dialogues.
Maintain learning clarity while keeping the Shin-chan vibe.
End with:
A simple recap
3 exam-focused key points
1 easy memory trick

Return ONLY JSON:
{
 "title": "...",
 "sections":[
   {"heading":"...","content":"..."}
 ]
}
`;
    }

    if (style === "doraemon") {
        return `
Explain "${topic}" using Doraemon gadgets.

Rules:
Use Doraemon, Nobita, Shizuka, Gian, and Suneo as characters.
Doraemon should explain the main concepts using simple analogies,
gadgets, and logical reasoning.
Nobita should ask beginner-level doubts and express confusion.
Shizuka should explain concepts step-by-step in a clear,
exam-oriented manner.
Gian should state common misconceptions or overconfident wrong answers,
which Doraemon corrects.
Suneo should share shortcuts, tricks, or smart exam tips.

Style:
Friendly, educational, and fun.
Short dialogues.
Accurate technical explanations.
Easy to understand, even for beginners.

Structure:
1. Doraemon introduces the topic
2. Concept explanation through dialogue
3. Doubts and corrections
4. Simplified understanding
5. Exam-focused clarity

End with:
A clear recap
3 key exam points
1 easy memory trick

Return ONLY JSON:
{
 "title":"...",
 "sections":[{"heading":"...","content":"..."}]
}
`;
    }

    if (style === "ghibli") {
        return `
Explain "${topic}" as a peaceful Studio Ghibli story.

Setting:
A quiet countryside village from an old era
Slow life, wisdom, simplicity, nature
Learning happens through stories, daily problems, and conversations 
Characters:
A village elder who explains concepts using wisdom and analogies
A young learner who asks curious and basic questions
A craftsperson or farmer who explains real-life applications
A wandering scholar who provides structured, formal explanations
A gentle narrator who connects everything together

Rules:
Explain concepts through village problems and old-world scenarios
Use calm, poetic language
Keep explanations technically accurate and more focused to the topic.
Avoid modern references
Use dialogues and storytelling, not plain notes

Structure:
1. Introduction of the topic with reference to village and the problem
2. Explanation through conversation and daily life
3. Clarification of the core concept
4. Resolution of the problem using knowledge
5. Reflection and lesson learned
End with:
A gentle recap of the concept
3 key learning points
1 intuitive memory analogy

Return ONLY JSON:
{
 "title":"...",
 "sections":[{"heading":"...","content":"..."}]
}
`;
    }

    return `
Explain "${topic}" as an anime learning journey.

Rules:
The explanation should feel like an anime story, not plain notes.
Concepts should be represented as:
Powers / abilities
Systems / rules of the world
Conflicts or challenges
Characters should learn, train, and overcome confusion while explaining the
topic.

Style:
High-energy anime narration
Clear explanations hidden inside storytelling
Use dialogues, scenes, and short explanations
Keep all technical concepts accurate

Structure:
1. Introduction of the anime world and problem in short
2. Step-by-step explanation through training or battles if required
3. Key concept revelation moment in detail
4. Final summary like an anime episode ending

End with:
Clear concept summary
Exam-oriented points
One “anime-style” memory hook

Return ONLY JSON:
{
 "title":"...",
 "sections":[{"heading":"...","content":"..."}]
}
`;
}

// ---------------- NORMALIZER ----------------
function normalizeToFrontendFormat(raw) {
    try {
        const clean = raw.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(clean);

        const sections = [];

        for (const sec of parsed.sections || []) {
            sections.push({
                heading: sec.heading || "Topic",
                content: cleanStudentText(String(sec.content || ""))
            });
        }

        return {
            title: cleanStudentText(parsed.title || "AI Notes"),
            sections
        };
    } catch (e) {
        return {
            title: "AI Notes",
            sections: [
                { heading: "Generated Notes", content: cleanStudentText(raw) }
            ]
        };
    }
}

// ---------------- GENERATOR ----------------
async function generateNotes(topic, style) {
    const prompt = buildNotebookLMPrompt(topic, style);

    // 1️⃣ OpenAI
    try {
        console.log("🧠 Using OpenAI");

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
        });

        return normalizeToFrontendFormat(
            completion.choices[0].message.content
        );
    } catch (err) {
        console.warn("❌ OpenAI failed:", err.message);
    }

    // 2️⃣ Gemini
    try {
        console.log("🧠 Using Gemini");

        const res = await fetch(GEMINI_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
            }),
        });

        const data = await res.json();
        const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!raw) throw new Error("Gemini returned no text");

        const json = raw.match(/\{[\s\S]*\}/)?.[0] || raw;

        return normalizeToFrontendFormat(json);
    } catch (err) {
        console.warn("❌ Gemini failed:", err.message);
    }

    // 3️⃣ Groq
    try {
        console.log("🧠 Using Groq");

        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [{ role: "user", content: prompt }],
            }),
        });

        const data = await res.json();
        const raw = data?.choices?.[0]?.message?.content;

        if (!raw) throw new Error("Groq empty");

        const json = raw.match(/\{[\s\S]*\}/)?.[0] || raw;

        return normalizeToFrontendFormat(json);
    } catch (err) {
        console.warn("❌ Groq failed:", err.message);
    }

    throw new Error("All AI providers failed");
}

module.exports = { generateNotes };