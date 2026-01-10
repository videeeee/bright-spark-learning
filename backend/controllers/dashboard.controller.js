const User = require("../models/User");

exports.getDashboard = async (req, res) => {
  let user = await User.findById(req.userId);

  // 🔥 AUTO-RECOVERY
  if (!user) {
    user = await User.findOne({ email: "demo@hackathon.com" });

    if (!user) {
      user = await User.create({
        username: "Demo User",
        email: "demo@hackathon.com",
        password: "demo"
      });
    }
  }

  res.json({
    username: user.username,
    xp: user.xp,
    streak: user.streak
  });
};
