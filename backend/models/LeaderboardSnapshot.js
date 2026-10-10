const mongoose = require("mongoose");

const leaderboardSnapshotSchema = new mongoose.Schema(
  {
    // Week identifier, e.g. "2026-W41"
    weekId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    weekStartDate: {
      type: Date,
      required: true,
    },
    rankings: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        displayName: String,
        weeklyXp: Number,
        rank: Number,
        streak: Number,
        levelsCompleted: Number,
        companion: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("LeaderboardSnapshot", leaderboardSnapshotSchema);
