const router = require("express").Router();
const auth = require("../middleware/auth");
const { giveFreely } = require("../controllers/ai.controller");

router.get("/", auth, giveFreely);

module.exports = router;
