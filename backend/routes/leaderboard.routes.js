const router = require("express").Router();
const auth = require("../middleware/auth");
const { getLeaderboard } = require("../controllers/leaderboard.controller");

router.get("/", auth, getLeaderboard);

module.exports = router;
