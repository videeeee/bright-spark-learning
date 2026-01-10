const User = require("../models/User");

exports.getLeaderboard = async (req, res) => {
  const users = await User.find()
    .sort({ xp: -1 })
    .limit(10)
    .select("username xp");

  res.json(users);
};
