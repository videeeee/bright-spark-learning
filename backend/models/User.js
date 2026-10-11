const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    classLevel: {
      type: String,
      default: null,
    },
    curriculum: {
      type: String,
      default: null,
    },
    subjects: {
      type: [String],
      default: [],
    },
    companion: {
      type: String,
      enum: ["solin", "pyro", "aqua", "lumi", "verdi"],
      default: "solin",
    },
    settings: {
      dailyReminders: { type: Boolean, default: true },
      streakAlerts: { type: Boolean, default: true },
      newContent: { type: Boolean, default: false },
      weeklyReport: { type: Boolean, default: true },
    },
    // Cached derived values for fast reads (recomputed from ActivityLog/LevelAttempt)
    totalXp: {
      type: Number,
      default: 0,
    },
    currentStreak: {
      type: Number,
      default: 0,
    },
    lastActiveDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    autoIndex: false,
  }
);

// Virtual for display name (First Name + Last Initial or First Name)
userSchema.virtual("displayName").get(function () {
  if (!this.name) return "Learner";
  const parts = this.name.trim().split(" ");
  if (parts.length > 1) {
    return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
  }
  return parts[0];
});

userSchema.set("toJSON", { virtuals: true });
userSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("User", userSchema);