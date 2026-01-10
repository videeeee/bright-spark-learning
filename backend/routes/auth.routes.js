const router = require("express").Router();
const { autoLogin } = require("../controllers/auth.controller");

router.get("/auto", autoLogin);

module.exports = router;

