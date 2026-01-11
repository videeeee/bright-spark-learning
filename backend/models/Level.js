const mongoose = require("mongoose");

const LevelSchema = new mongoose.Schema({
  chapter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chapter",
    required: true,
  },
  levelNumber: {
    type: Number,
    required: true, // 1, 2, 3...
  },
  title: {
    type: String,
    required: true, // "Solving Linear Equations"
  },
  xpReward: {
    type: Number,
    default: 10,
  },
  isLockedByDefault: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

module.exports = mongoose.model("Level", LevelSchema);
