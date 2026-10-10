const express = require("express");
const { z } = require("zod");
const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const Progress = require("../models/Progress");
const LevelAttempt = require("../models/LevelAttempt");
const {
  getUserSummary,
  calculateStreak,
  recordLevelCompletion,
} = require("../services/progress.service");

const router = express.Router();

const completeLevelSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  chapterNumber: z.number().int().positive(),
  levelNumber: z.number().int().positive(),
  score: z.number().min(0).max(100),
});

/**
 * GET /api/progress/summary
 * Single source of truth for streak, XP, stats, and profile
 */
router.get("/summary", auth, async (req, res, next) => {
  try {
    const summary = await getUserSummary(req.user.id);
    if (!summary) {
      return res.status(404).json({ success: false, msg: "User summary not found" });
    }
    res.json({ success: true, ...summary });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/progress/streak
 * Single source of truth for streak calculation
 */
router.get("/streak", auth, async (req, res, next) => {
  try {
    const streakData = await calculateStreak(req.user.id);
    res.json({ success: true, ...streakData });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/progress/complete-level
 * Server-side validated completion, XP award, and attempt tracking
 */
router.post(
  "/complete-level",
  auth,
  validate({ body: completeLevelSchema }),
  async (req, res, next) => {
    try {
      const { subject, chapterNumber, levelNumber, score } = req.body;

      const result = await recordLevelCompletion({
        userId: req.user.id,
        subject,
        chapterNumber,
        levelNumber,
        score,
      });

      // Maintain backward-compatible upsert into legacy Progress model as well
      if (result.passed) {
        await Progress.findOneAndUpdate(
          {
            user: req.user.id,
            subject,
            chapterNumber,
            levelNumber,
          },
          {
            isCompleted: true,
            xpEarned: result.xpEarned,
          },
          { upsert: true }
        );
      }

      res.json({
        success: true,
        ...result,
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/progress/my-progress and GET /api/progress/mine
 * Return completed levels for the logged in user
 */
const handleMyProgress = async (req, res, next) => {
  try {
    // Check LevelAttempt first, fallback to Progress
    const attempts = await LevelAttempt.find({ user: req.user.id, passed: true })
      .select("subject chapterNumber levelNumber score stars xpEarned completedAt")
      .sort({ completedAt: 1 });

    if (attempts.length > 0) {
      return res.json(attempts);
    }

    // Legacy fallback
    const legacy = await Progress.find({ user: req.user.id, isCompleted: true });
    res.json(legacy);
  } catch (err) {
    next(err);
  }
};

router.get("/my-progress", auth, handleMyProgress);
router.get("/mine", auth, handleMyProgress);
router.get("/", auth, handleMyProgress);

module.exports = router;