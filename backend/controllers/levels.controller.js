const { generateWithAI } = require("./ai.controller");

/* =================== SYLLABUS (MATCHES FRONTEND EXACTLY) =================== */

const SYLLABUS = {
  Biology: {
    "Cell Structure": [
      "Introduction to Cells",
      "Cell Theory",
      "Prokaryotic Cells",
      "Eukaryotic Cells",
      "Cell Membrane",
      "Nucleus",
      "Mitochondria",
      "Ribosomes",
      "Plant Cell",
      "Animal Cell"
    ],
    "Life Processes": [
      "Nutrition",
      "Photosynthesis",
      "Respiration",
      "Transportation",
      "Excretion",
      "Digestive System",
      "Respiratory System",
      "Circulatory System",
      "Excretory System",
      "Revision"
    ]
  },

  Mathematics: {
    Algebra: [
      "What is Algebra",
      "Variables and Constants",
      "Algebraic Expressions",
      "Simple Equations",
      "Linear Equations",
      "Solving Equations",
      "Word Problems",
      "Factorization",
      "Identities",
      "Revision"
    ],
    Geometry: [
      "Introduction to Geometry",
      "Points and Lines",
      "Angles",
      "Triangles",
      "Quadrilaterals",
      "Circles",
      "Polygons",
      "Perimeter",
      "Area",
      "Revision"
    ]
  },

  History: {
    "Ancient Civilizations": [
      "What is Civilization",
      "Harappa Civilization",
      "Mesopotamian Civilization",
      "Egyptian Civilization",
      "Indus Valley Cities",
      "Social Life",
      "Religious Practices",
      "Economy and Trade",
      "Decline of Civilizations",
      "Revision"
    ],
    "Medieval Period": [
      "Early Medieval Period",
      "Feudalism",
      "Kings and Kingdoms",
      "Architecture",
      "Culture and Society",
      "Trade Routes",
      "Wars and Expansion",
      "Administration",
      "Daily Life",
      "Revision"
    ]
  },

  Science: {
    "States of Matter": [
      "What is Matter",
      "States of Matter",
      "Particle Theory",
      "Change of State",
      "Melting & Freezing",
      "Evaporation",
      "Condensation",
      "Sublimation",
      "Applications",
      "Revision"
    ],
    "Force and Motion": [
      "What is Force",
      "Balanced Forces",
      "Unbalanced Forces",
      "Newton First Law",
      "Newton Second Law",
      "Newton Third Law",
      "Inertia",
      "Momentum",
      "Applications",
      "Revision"
    ]
  },

  English: {
    "Grammar Basics": [
      "Nouns",
      "Pronouns",
      "Verbs",
      "Adjectives",
      "Adverbs",
      "Tenses",
      "Prepositions",
      "Conjunctions",
      "Articles",
      "Revision"
    ],
    "Reading Skills": [
      "Skimming",
      "Scanning",
      "Main Idea",
      "Vocabulary",
      "Inference",
      "Tone",
      "Theme",
      "Summary",
      "Practice Passage",
      "Revision"
    ]
  }
};

/* =================== CONTROLLER =================== */

exports.generateLevelContent = async (req, res) => {
  try {
    let { subject, chapter, level } = req.body;

    subject = subject?.trim();
    chapter = chapter?.trim();

    const topic = SYLLABUS?.[subject]?.[chapter]?.[level - 1];

    if (!topic) {
      return res.json({
        topic: "Coming Soon",
        explanation:
          "This lesson is being prepared. Please explore another level or chapter.",
        quiz: {
          question: "What should you do now?",
          options: [
            "Try another level",
            "Revise previous topic",
            "Switch subject",
            "Take a break 😄"
          ],
          correctAnswer: "Try another level"
        }
      });
    }

    const prompt = `
You are an Indian school teacher.

Subject: ${subject}
Chapter: ${chapter}
Topic: ${topic}

Generate:
1. Simple explanation (5–6 lines)
2. ONE MCQ with:
   - clear question
   - 4 options
   - correct answer

Return ONLY JSON:
{
  "topic": "${topic}",
  "explanation": "",
  "quiz": {
    "question": "",
    "options": ["", "", "", ""],
    "correctAnswer": ""
  }
}
`;

    const aiResponse = await generateWithAI(prompt);

    // 🔒 AI SAFETY PATCH
    if (!aiResponse.quiz?.question) {
      aiResponse.quiz.question = `Question about ${topic}`;
    }

    res.json({
      subject,
      chapter,
      level,
      ...aiResponse
    });
  } catch (err) {
    console.error("LEVEL AI ERROR:", err);
    res.status(500).json({
      error: "Failed to generate level content"
    });
  }
};