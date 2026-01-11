const express = require("express");
const Curriculum = require("../models/Curriculum");
const auth = require("../middleware/auth");

const router = express.Router();

/**
 * GET FULL CURRICULUM
 * Used by:
 * - Learning page
 * - Quiz levels
 * - Stats engine
 */
router.get("/", auth, async (req, res) => {
  try {
    const curriculum = await Curriculum.find({});
    res.json(curriculum);
  } catch (err) {
    console.error("Curriculum fetch failed:", err);
    res.status(500).json({ msg: "Failed to load curriculum" });
  }
});

module.exports = router;