const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: {
    type: String,
    enum: ["mcq", "true_false", "fill_blank", "match", "ordering"],
    default: "mcq",
  },
  prompt: { type: String, required: true },
  options: [{ type: String }],
  correctAnswer: { type: mongoose.Schema.Types.Mixed, required: true },
  explanation: { type: String, required: true },
  hint: { type: String },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "medium",
  },
  topicTag: { type: String },
  verified: { type: Boolean, default: true },
});

const ExampleSchema = new mongoose.Schema({
  problem: { type: String, required: true },
  solution: { type: String, required: true },
  explanation: { type: String },
});

const LessonSchema = new mongoose.Schema({
  title: { type: String },
  intro: { type: String },
  keyConcepts: [
    {
      title: String,
      explanation: String,
    },
  ],
  tips: [String],
});

const LevelSchema = new mongoose.Schema({
  id: { type: String, required: true },
  levelNumber: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String },
  subtopics: [{ type: String }],
  isReviewLevel: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ["published", "draft", "queued"],
    default: "published",
  },
  isLocked: { type: Boolean, default: false }, // Legacy fallback
  lesson: { type: LessonSchema },
  examples: [ExampleSchema],
  questions: [QuestionSchema],
});

const ChapterSchema = new mongoose.Schema({
  chapterNumber: { type: Number, required: true },
  id: { type: String },
  title: { type: String, required: true },
  description: { type: String },
  levels: [LevelSchema],
});

const UnitSchema = new mongoose.Schema({
  unitNumber: { type: Number, required: true },
  title: { type: String, required: true },
  chapters: [ChapterSchema],
});

const CurriculumSchema = new mongoose.Schema(
  {
    board: {
      type: String,
      required: true,
      index: true,
    },
    classLevel: {
      type: String,
      required: true,
      index: true,
    },
    subject: {
      type: String,
      required: true,
      index: true,
    },
    subjectName: {
      type: String,
    },
    officialSource: {
      type: String,
    },
    units: [UnitSchema],
    // Flat chapters array for backward compatibility with legacy queries
    chapters: [ChapterSchema],
  },
  { timestamps: true }
);

CurriculumSchema.index({ board: 1, classLevel: 1, subject: 1 }, { unique: true });

module.exports = mongoose.model("Curriculum", CurriculumSchema);
