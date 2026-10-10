const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["level_complete", "note_create", "listen", "login"],
      required: true,
    },
    // YYYY-MM-DD string in Asia/Kolkata timezone representing calendar day boundary
    dateString: {
      type: String,
      required: true,
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to quickly find user activity by calendar date
activityLogSchema.index({ user: 1, dateString: 1 });

module.exports = mongoose.model("ActivityLog", activityLogSchema);
