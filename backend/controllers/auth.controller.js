const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.autoLogin = async (req, res) => {
  let user = await User.findOne({ email: "demo@hackathon.com" });

  if (!user) {
    user = await User.create({
      username: "Demo User",
      email: "demo@hackathon.com",
      password: "demo"
    });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

  res.json({
    payload: {
      token,
      user: {
        username: user.username,
        email: user.email,
        xp: user.xp,
        streak: user.streak
      }
    }
  });
};
