const mongoose = require("mongoose");
const Curriculum = require("../models/Curriculum");
require("dotenv").config();

const curriculumData = [
  {
    subject: "Maths",
    chapters: [
      {
        chapterNumber: 1,
        title: "Algebra Basics",
        levels: [
          { levelNumber: 1, title: "Variables & Constants", isLocked: false },
          { levelNumber: 2, title: "Simple Equations", isLocked: true }
        ]
      },
      {
        chapterNumber: 2,
        title: "Geometry",
        levels: [
          { levelNumber: 1, title: "Lines & Angles", isLocked: true },
          { levelNumber: 2, title: "Triangles", isLocked: true }
        ]
      }
    ]
  },

  {
    subject: "Science",
    chapters: [
      {
        chapterNumber: 1,
        title: "Physics Basics",
        levels: [
          { levelNumber: 1, title: "Force & Motion", isLocked: false },
          { levelNumber: 2, title: "Energy", isLocked: true }
        ]
      },
      {
        chapterNumber: 2,
        title: "Chemistry Basics",
        levels: [
          { levelNumber: 1, title: "Atoms & Molecules", isLocked: true },
          { levelNumber: 2, title: "Chemical Reactions", isLocked: true }
        ]
      }
    ]
  },

  {
    subject: "Biology",
    chapters: [
      {
        chapterNumber: 1,
        title: "Living World",
        levels: [
          { levelNumber: 1, title: "Cells", isLocked: false },
          { levelNumber: 2, title: "Tissues", isLocked: true }
        ]
      },
      {
        chapterNumber: 2,
        title: "Human Body",
        levels: [
          { levelNumber: 1, title: "Digestive System", isLocked: true },
          { levelNumber: 2, title: "Respiratory System", isLocked: true }
        ]
      }
    ]
  },

  {
    subject: "History",
    chapters: [
      {
        chapterNumber: 1,
        title: "Ancient Civilizations",
        levels: [
          { levelNumber: 1, title: "Indus Valley", isLocked: false },
          { levelNumber: 2, title: "Egyptian Civilization", isLocked: true }
        ]
      },
      {
        chapterNumber: 2,
        title: "Medieval India",
        levels: [
          { levelNumber: 1, title: "Mughals", isLocked: true },
          { levelNumber: 2, title: "Marathas", isLocked: true }
        ]
      }
    ]
  },

  {
    subject: "English",
    chapters: [
      {
        chapterNumber: 1,
        title: "Grammar",
        levels: [
          { levelNumber: 1, title: "Nouns & Pronouns", isLocked: false },
          { levelNumber: 2, title: "Verbs & Tenses", isLocked: true }
        ]
      },
      {
        chapterNumber: 2,
        title: "Literature",
        levels: [
          { levelNumber: 1, title: "Poetry Basics", isLocked: true },
          { levelNumber: 2, title: "Short Stories", isLocked: true }
        ]
      }
    ]
  }
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  await Curriculum.deleteMany({});
  await Curriculum.insertMany(curriculumData);

  console.log("✅ Curriculum seeded successfully");
  process.exit();
}

seed();
