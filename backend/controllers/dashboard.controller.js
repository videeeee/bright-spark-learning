const User = require("../models/User");

exports.getDashboard = async (req, res) => {
  const userId = req.userId || req.user?.id;
  let user = await User.findById(userId);

  // 🔥 AUTO-RECOVERY
  if (!user) {
    user = await User.findOne({ email: "demo@hackathon.com" });

    if (!user) {
      user = await User.create({
        name: "Demo User",
        email: "demo@hackathon.com",
        password: "demo"
      });
    }
  }

  res.json({
    name: user.name,
    xp: user.xp,
    streak: user.streak
  });
};
