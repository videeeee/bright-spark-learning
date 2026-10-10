const mongoose = require("mongoose");

const mistakeReviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    questionId: {
      type: String,
      required: true,
    },
    levelId: {
      type: String,
      required: true,
      index: true,
    },
    subject: {
      type: String,
      required: true,
      index: true,
    },
    questionData: {
      prompt: String,
      type: String,
      options: [String],
      explanation: String,
      hint: String,
      topicTag: String,
    },
    stage: {
      type: Number, // 1 (1 day), 2 (3 days), 3 (7 days), 4 (mastered)
      default: 1,
    },
    nextReviewDate: {
      type: Date,
      required: true,
      index: true,
    },
    lastReviewedAt: {
      type: Date,
      default: null,
    },
    isMastered: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

mistakeReviewSchema.index({ userId: 1, questionId: 1 }, { unique: true });

module.exports = mongoose.model("MistakeReview", mistakeReviewSchema);
