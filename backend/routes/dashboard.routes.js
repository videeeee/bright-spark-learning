const router = require("express").Router();
const auth = require("../middleware/auth");
const { getDashboard } = require("../controllers/dashboard.controller");

router.get("/", auth, getDashboard);

module.exports = router;
