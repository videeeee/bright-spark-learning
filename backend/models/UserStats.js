const mongoose = require("mongoose");

const UserStatsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    unique: true
  },

  totalXP: {
    type: Number,
    default: 0
  },

  streak: {
    type: Number,
    default: 0
  },

  completedLevels: {
    type: Number,
    default: 0
  },

  completedChapters: {
    type: Number,
    default: 0
  },

  subjectProgress: {
    type: Map,
    of: Number, // percentage
    default: {}
  },

  weakestSubject: String,
  strongestSubject: String
}, { timestamps: true });

module.exports = mongoose.model("UserStats", UserStatsSchema);
