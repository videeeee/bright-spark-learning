const express = require("express");
const router = express.Router();

const {
  generateLevelContent
} = require("../controllers/levels.controller");

/* ---------- ROUTES ---------- */

router.post("/generate", generateLevelContent);

router.get("/test", (req, res) => {
  res.json({ message: "Levels route working ✅" });
});

module.exports = router;