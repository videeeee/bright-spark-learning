const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Notes = require("../models/Notes");

router.get("/", auth, async (req, res) => {
  const totalNotes = await Notes.countDocuments({ userId: req.user.id });

  const recentNotes = await Notes.find({ userId: req.user.id })
    .sort({ createdAt: -1 })
    .limit(5);

  res.json({
    totalNotes,
    recentNotes,
  });
});

module.exports = router;