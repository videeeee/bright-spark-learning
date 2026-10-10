const ActivityLog = require("../models/ActivityLog");
const LevelAttempt = require("../models/LevelAttempt");
const LeaderboardSnapshot = require("../models/LeaderboardSnapshot");
const User = require("../models/User");
const Notes = require("../models/Notes");
const XP_RULES = require("../config/xpRules");

const TIMEZONE = "Asia/Kolkata";

/**
 * Format a Date to YYYY-MM-DD in Asia/Kolkata
 */
function getKolkataDateString(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(date); // YYYY-MM-DD
}

/**
 * Get date shifted by N days
 */
function getOffsetDateString(baseDateString, dayOffset) {
  const [year, month, day] = baseDateString.split("-").map(Number);
  const d = new Date(Date.UTC(year, month - 1, day));
  d.setUTCDate(d.getUTCDate() + dayOffset);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dt = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${dt}`;
}

/**
 * Pure function: calculate consecutive active days from an array of YYYY-MM-DD strings
 * Timezone-aware with 1-day grace period for today
 */
function calculateStreakFromDates(dateStrings, todayDateString = getKolkataDateString()) {
  if (!dateStrings || dateStrings.length === 0) {
    return { streak: 0, activeToday: false, lastActiveDate: null };
  }

  const uniqueDates = Array.from(new Set(dateStrings)).sort().reverse();
  const mostRecent = uniqueDates[0];
  const activeToday = mostRecent === todayDateString;

  const yesterdayString = getOffsetDateString(todayDateString, -1);
  const activeYesterday = uniqueDates.includes(yesterdayString);

  // If not active today and not active yesterday, the streak is broken
  if (!activeToday && !activeYesterday) {
    return { streak: 0, activeToday: false, lastActiveDate: mostRecent };
  }

  // Count consecutive days backwards
  let streak = 0;
  let checkDate = activeToday ? todayDateString : yesterdayString;

  for (const date of uniqueDates) {
    if (date === checkDate) {
      streak++;
      checkDate = getOffsetDateString(checkDate, -1);
    } else if (date < checkDate) {
      // Gap in streak
      break;
    }
  }

  return {
    streak,
    activeToday,
    lastActiveDate: mostRecent,
  };
}

/**
 * Get start of current week (Monday 00:00:00 IST)
 */
function getWeekStartKolkata(date = new Date()) {
  // Get date in IST
  const todayStr = getKolkataDateString(date);
  const [year, month, day] = todayStr.split("-").map(Number);
  // Create Date object representing noon on that day in UTC to avoid daylight/local shifts
  const d = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  const dayOfWeek = d.getUTCDay(); // 0 is Sunday, 1 is Monday...
  const distanceToMonday = (dayOfWeek + 6) % 7; // Monday = 0, Tuesday = 1... Sunday = 6
  d.setUTCDate(d.getUTCDate() - distanceToMonday);

  // Return start of that Monday (00:00:00 IST = prev day 18:30:00 UTC)
  const mondayStr = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
  // 00:00 IST is 18:30 UTC of previous day
  return new Date(`${mondayStr}T00:00:00+05:30`);
}

/**
 * ISO Week ID, e.g. "2026-W41"
 */
function getWeekId(date = new Date()) {
  const monday = getWeekStartKolkata(date);
  const year = monday.getFullYear();
  // Approximate week number for consistent snapshot keys
  const startOfYear = new Date(year, 0, 1);
  const weekNo = Math.ceil(((monday - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
  return `${year}-W${String(weekNo).padStart(2, "0")}`;
}

/**
 * Log user activity into ActivityLog and update lastActiveDate
 */
async function logActivity(userId, type, metadata = {}) {
  const dateString = getKolkataDateString();

  const log = await ActivityLog.create({
    user: userId,
    type,
    dateString,
    metadata,
  });

  return log;
}

/**
 * Compute server-side streak for a user
 */
async function calculateStreak(userId) {
  const logs = await ActivityLog.find({ user: userId }).select("dateString");
  const dates = logs.map((l) => l.dateString);
  return calculateStreakFromDates(dates);
}

/**
 * Recompute and synchronize cached stats on User document
 */
async function recomputeUserStats(userId) {
  // 1. Calculate XP from all completed LevelAttempts
  const attempts = await LevelAttempt.find({ user: userId, passed: true }).select("xpEarned");
  const totalLevelXp = attempts.reduce((acc, curr) => acc + (curr.xpEarned || 0), 0);

  // 2. XP from note generation activities
  const noteActivities = await ActivityLog.countDocuments({ user: userId, type: "note_create" });
  const totalNoteXp = noteActivities * XP_RULES.NOTE_CREATION_XP;

  // 3. XP from listen activities
  const listenActivities = await ActivityLog.countDocuments({ user: userId, type: "listen" });
  const totalListenXp = listenActivities * XP_RULES.LISTEN_SESSION_XP;

  const totalXp = totalLevelXp + totalNoteXp + totalListenXp;

  // 4. Calculate streak
  const { streak, lastActiveDate } = await calculateStreak(userId);

  // 5. Update cached fields on User
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      totalXp,
      currentStreak: streak,
      lastActiveDate: lastActiveDate ? new Date(lastActiveDate) : null,
    },
    { new: true }
  ).select("-password");

  return {
    totalXp,
    currentStreak: streak,
    lastActiveDate,
    user: updatedUser,
  };
}

/**
 * Get Weekly XP from LevelAttempts for a user
 */
async function getWeeklyXp(userId, weekStart = getWeekStartKolkata()) {
  const attempts = await LevelAttempt.find({
    user: userId,
    passed: true,
    completedAt: { $gte: weekStart },
  }).select("xpEarned");

  return attempts.reduce((sum, att) => sum + (att.xpEarned || 0), 0);
}

/**
 * Complete level: Server-side grading, XP calculation, attempt logging, and cache recomputation
 */
async function recordLevelCompletion({ userId, subject, chapterNumber, levelNumber, score }) {
  const stars = XP_RULES.calculateStars(score);
  const passed = score >= XP_RULES.PASS_THRESHOLD;

  // Check if user already passed this level previously
  const previousAttempt = await LevelAttempt.findOne({
    user: userId,
    subject,
    chapterNumber,
    levelNumber,
    passed: true,
  }).sort({ score: -1 });

  const isFirstCompletion = !previousAttempt && passed;
  const previousBestStars = previousAttempt ? previousAttempt.stars : 0;

  const xpEarned = passed
    ? XP_RULES.calculateLevelXp({ score, isFirstCompletion, previousBestStars })
    : 0;

  // Record LevelAttempt
  const attempt = await LevelAttempt.create({
    user: userId,
    subject,
    chapterNumber,
    levelNumber,
    score,
    stars,
    xpEarned,
    isFirstCompletion,
    passed,
  });

  // Log activity
  if (passed) {
    await logActivity(userId, "level_complete", {
      subject,
      chapterNumber,
      levelNumber,
      stars,
      xpEarned,
    });
  }

  // Recompute user stats
  const { totalXp, currentStreak } = await recomputeUserStats(userId);

  return {
    passed,
    score,
    stars,
    xpEarned,
    isFirstCompletion,
    totalXp,
    currentStreak,
    attemptId: attempt._id,
  };
}

/**
 * Leaderboard service: Weekly XP ranking with snapshot comparison and privacy display names
 */
async function getLeaderboardData(currentUserId, limit = 10) {
  const weekStart = getWeekStartKolkata();
  const prevWeekMonday = new Date(weekStart);
  prevWeekMonday.setDate(prevWeekMonday.getDate() - 7);
  const prevWeekId = getWeekId(prevWeekMonday);

  // 1. Get weekly XP aggregated per user from LevelAttempt
  const weeklyAgg = await LevelAttempt.aggregate([
    {
      $match: {
        passed: true,
        completedAt: { $gte: weekStart },
      },
    },
    {
      $group: {
        _id: "$user",
        weeklyXp: { $sum: "$xpEarned" },
        levelsCompleted: { $sum: 1 },
      },
    },
  ]);

  const weeklyXpMap = new Map();
  weeklyAgg.forEach((entry) => {
    weeklyXpMap.set(entry._id.toString(), {
      weeklyXp: entry.weeklyXp,
      levelsCompleted: entry.levelsCompleted,
    });
  });

  // 2. Fetch users scoped to same board and class level (with cohort fallback)
  let cohortFilter = {};
  let cohortBoard = "All Boards";
  let cohortClass = "All Classes";

  if (currentUserId) {
    const currentUserDoc = await User.findById(currentUserId).select("curriculum classLevel");
    if (currentUserDoc?.curriculum && currentUserDoc?.classLevel) {
      cohortFilter = {
        curriculum: currentUserDoc.curriculum,
        classLevel: currentUserDoc.classLevel,
      };
      cohortBoard = currentUserDoc.curriculum;
      cohortClass = currentUserDoc.classLevel;
    }
  }

  let users = await User.find(cohortFilter).select("name companion totalXp currentStreak curriculum classLevel");
  // If fewer than 2 users in specific cohort, fallback to all users for healthy competition display
  if (users.length < 2) {
    users = await User.find().select("name companion totalXp currentStreak curriculum classLevel");
    cohortBoard = "All Boards";
    cohortClass = "All Classes";
  }

  // 3. Build ranking list
  const rankedList = users.map((u) => {
    const weeklyData = weeklyXpMap.get(u._id.toString()) || { weeklyXp: 0, levelsCompleted: 0 };
    return {
      userId: u._id.toString(),
      name: u.displayName || u.name,
      weeklyXp: weeklyData.weeklyXp,
      totalXp: u.totalXp || 0,
      streak: u.currentStreak || 0,
      levelsCompleted: weeklyData.levelsCompleted,
      companion: u.companion || "solin",
      curriculum: u.curriculum || "ICSE",
      classLevel: u.classLevel || "9",
      isCurrentUser: u._id.toString() === currentUserId?.toString(),
    };
  });

  // Sort by weeklyXp desc, then totalXp desc, then streak desc
  rankedList.sort((a, b) => {
    if (b.weeklyXp !== a.weeklyXp) return b.weeklyXp - a.weeklyXp;
    if (b.totalXp !== a.totalXp) return b.totalXp - a.totalXp;
    return b.streak - a.streak;
  });

  // Assign ranks
  rankedList.forEach((entry, idx) => {
    entry.rank = idx + 1;
  });

  // 4. Fetch previous week's snapshot for rank change
  const prevSnapshot = await LeaderboardSnapshot.findOne({ weekId: prevWeekId });
  const prevRankMap = new Map();
  if (prevSnapshot && prevSnapshot.rankings) {
    prevSnapshot.rankings.forEach((r) => {
      prevRankMap.set(r.user.toString(), r.rank);
    });
  }

  // Calculate rank change
  rankedList.forEach((entry) => {
    const prevRank = prevRankMap.get(entry.userId);
    if (prevRank) {
      entry.rankChange = prevRank - entry.rank; // Positive means moved up
    } else {
      entry.rankChange = 0; // New or unranked last week
    }
  });

  const currentUserEntry = rankedList.find((e) => e.isCurrentUser) || null;
  const topList = rankedList.slice(0, limit);

  return {
    weekStartDate: weekStart.toISOString(),
    cohortBoard,
    cohortClass,
    totalLearners: rankedList.length,
    leaderboard: topList,
    currentUser: currentUserEntry,
  };
}

/**
 * Get comprehensive single-source-of-truth summary for user
 */
async function getUserSummary(userId) {
  const user = await User.findById(userId).select("-password");
  if (!user) return null;

  const { streak, activeToday, lastActiveDate } = await calculateStreak(userId);
  const weeklyXp = await getWeeklyXp(userId);

  // Notes counts
  const totalNotes = await Notes.countDocuments({ userId });
  const weekStart = getWeekStartKolkata();
  const notesThisWeek = await Notes.countDocuments({ userId, createdAt: { $gte: weekStart } });

  // Levels completed count
  const completedAttempts = await LevelAttempt.find({ user: userId, passed: true }).select(
    "subject chapterNumber levelNumber score stars"
  );

  // Subject-wise progress map
  const subjectProgress = {};
  completedAttempts.forEach((att) => {
    if (!subjectProgress[att.subject]) {
      subjectProgress[att.subject] = new Set();
    }
    subjectProgress[att.subject].add(`${att.chapterNumber}.${att.levelNumber}`);
  });

  const subjectProgressCounts = {};
  Object.keys(subjectProgress).forEach((sub) => {
    subjectProgressCounts[sub] = subjectProgress[sub].size;
  });

  return {
    user: {
      id: user._id,
      name: user.name,
      displayName: user.displayName,
      email: user.email,
      companion: user.companion,
      classLevel: user.classLevel,
      curriculum: user.curriculum,
      subjects: user.subjects,
      settings: user.settings,
    },
    streak: {
      currentStreak: streak,
      activeToday,
      lastActiveDate,
    },
    xp: {
      totalXp: user.totalXp || 0,
      weeklyXp,
    },
    stats: {
      totalNotes,
      notesThisWeek,
      levelsCompleted: completedAttempts.length,
      uniqueLevelsCompleted: Object.values(subjectProgressCounts).reduce((a, b) => a + b, 0),
      subjectProgress: subjectProgressCounts,
    },
  };
}

module.exports = {
  getKolkataDateString,
  getOffsetDateString,
  calculateStreakFromDates,
  getWeekStartKolkata,
  getWeekId,
  logActivity,
  calculateStreak,
  recomputeUserStats,
  getWeeklyXp,
  recordLevelCompletion,
  getLeaderboardData,
  getUserSummary,
};
