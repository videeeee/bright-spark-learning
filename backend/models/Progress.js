const mongoose = require("mongoose");

const ProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  subject: {
    type: String,
    required: true
  },

  chapterNumber: Number,
  levelNumber: Number,

  isCompleted: {
    type: Boolean,
    default: false
  },

  xpEarned: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model("Progress", ProgressSchema);
