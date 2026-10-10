const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Notes = require("../models/Notes");
const { getUserSummary } = require("../services/progress.service");

router.get("/", auth, async (req, res, next) => {
  try {
    const summary = await getUserSummary(req.user.id);
    const recentNotes = await Notes.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      totalNotes: summary?.stats?.totalNotes || 0,
      notesThisWeek: summary?.stats?.notesThisWeek || 0,
      recentNotes,
      currentStreak: summary?.streak?.currentStreak || 0,
      activeToday: summary?.streak?.activeToday || false,
      totalXp: summary?.xp?.totalXp || 0,
      weeklyXp: summary?.xp?.weeklyXp || 0,
      levelsCompleted: summary?.stats?.levelsCompleted || 0,
      subjectProgress: summary?.stats?.subjectProgress || {},
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;