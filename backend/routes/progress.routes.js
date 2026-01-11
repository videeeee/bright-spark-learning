const express = require("express");
const auth = require("../middleware/auth");
const Progress = require("../models/Progress");
const { recalculateStats } = require("../services/stats.service");

const router = express.Router();

router.post("/complete-level", auth, async (req, res) => {
  try {
    const { subject, chapterNumber, levelNumber, score } = req.body;

    if (!subject || !chapterNumber || !levelNumber || score === undefined) {
      return res.status(400).json({ msg: "Missing data" });
    }

    if (score < 80) {
      return res.json({ passed: false });
    }

    // ✅ UPSERT instead of CREATE
    await Progress.findOneAndUpdate(
      {
        user: req.user.id,
        subject,
        chapterNumber,
        levelNumber,
      },
      {
        isCompleted: true,
        xpEarned: 20,
      },
      { upsert: true, new: true }
    );

    // 🔥 Safe recalculation
    await recalculateStats(req.user.id);

    res.json({ passed: true });
  } catch (err) {
    console.error("COMPLETE LEVEL ERROR:", err);
    res.status(500).json({ msg: "Failed to complete level" });
  }
});

router.get("/", auth, async (req, res) => {
  const progress = await Progress.find({
    user: req.user.id,
    isCompleted: true,
  });

  res.json(progress);
});

/* ===========================
   GET USER PROGRESS
=========================== */
router.get("/my-progress", auth, async (req, res) => {
  try {
    const progress = await Progress.find({ user: req.user.id });
    res.json(progress);
  } catch (err) {
    console.error(err);
    res.status(500).json([]);
  }
});

module.exports = router;