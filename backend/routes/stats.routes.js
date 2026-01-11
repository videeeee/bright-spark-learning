const express = require("express");
const auth = require("../middleware/auth");
// const UserStats = require("../models/Userstats");
const UserStats = require("../models/UserStats");

const router = express.Router();

router.get("/", auth, async (req, res) => {
  const stats = await UserStats.findOne({ user: req.user.id });

  res.json(stats || {
    totalXP: 0,
    streak: 0,
    completedLevels: 0,
    completedChapters: 0,
    subjectProgress: {},
    weakestSubject: null,
    strongestSubject: null
  });
});

module.exports = router;