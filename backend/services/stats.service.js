const Progress = require("../models/Progress");
const Curriculum = require("../models/Curriculum");
const UserStats = require("../models/UserStats");

async function recalculateStats(userId) {
  const progress = await Progress.find({
    user: userId,
    isCompleted: true,
  });

  let totalXP = 0;
  let subjectCount = {};
  let chapterSet = new Set();

  progress.forEach(p => {
    totalXP += p.xpEarned;
    chapterSet.add(`${p.subject}-${p.chapterNumber}`);

    if (!subjectCount[p.subject]) subjectCount[p.subject] = 0;
    subjectCount[p.subject]++;
  });

  // total chapters per subject
  const curriculum = await Curriculum.find({});
  let subjectProgress = {};

  curriculum.forEach(sub => {
    const totalChapters = sub.chapters.length;
    const completed = subjectCount[sub.subject] || 0;

    subjectProgress[sub.subject] = Math.round(
      (completed / totalChapters) * 100
    );
  });

  let weakest = null, strongest = null;
  let min = Infinity, max = -Infinity;

  Object.entries(subjectProgress).forEach(([sub, val]) => {
    if (val < min) { min = val; weakest = sub; }
    if (val > max) { max = val; strongest = sub; }
  });

  await UserStats.findOneAndUpdate(
    { user: userId },
    {
      totalXP,
      totalLevelsCompleted: progress.length,
      subjectProgress,
      weakestSubject: weakest,
      strongestSubject: strongest,
    },
    { upsert: true, new: true }
  );
}

module.exports = { recalculateStats };