const mongoose = require("mongoose");

const LevelSchema = new mongoose.Schema({
  levelNumber: Number,
  title: String,
  isLocked: Boolean,
});

const ChapterSchema = new mongoose.Schema({
  chapterNumber: Number,
  title: String,
  levels: [LevelSchema],
});

const CurriculumSchema = new mongoose.Schema({
  subject: String,
  chapters: [ChapterSchema],
});

module.exports = mongoose.model("Curriculum", CurriculumSchema);
