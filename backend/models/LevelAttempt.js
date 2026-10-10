const mongoose = require("mongoose");

const levelAttemptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    subject: {
      type: String,
      required: true,
    },
    chapterNumber: {
      type: Number,
      required: true,
    },
    levelNumber: {
      type: Number,
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    stars: {
      type: Number,
      default: 0,
      min: 0,
      max: 3,
    },
    xpEarned: {
      type: Number,
      default: 0,
    },
    isFirstCompletion: {
      type: Boolean,
      default: false,
    },
    passed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for finding user progress on specific levels
levelAttemptSchema.index({ user: 1, subject: 1, chapterNumber: 1, levelNumber: 1 });
levelAttemptSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("LevelAttempt", levelAttemptSchema);
