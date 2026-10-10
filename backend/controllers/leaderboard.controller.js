const { getLeaderboardData } = require("../services/progress.service");

exports.getLeaderboard = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.userId;
    const data = await getLeaderboardData(userId);

    // Return structured object with array property
    res.json({
      success: true,
      ...data,
    });
  } catch (err) {
    next(err);
  }
};
