const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const Curriculum = require("../models/Curriculum");
const LevelAttempt = require("../models/LevelAttempt");
const ActivityLog = require("../models/ActivityLog");
const User = require("../models/User");
const Report = require("../models/Report");
const MistakeReview = require("../models/MistakeReview");
const { calculateLevelXp } = require("../config/xpRules");
const { recordUserActivity, recomputeUserStreakAndXp } = require("./progress.service");

const CATALOG_DIR = path.join(__dirname, "../content/catalog");
const SYLLABUS_DIR = path.join(__dirname, "../content/syllabus");

/**
 * Load static catalog configuration
 */
function getCatalogData() {
  try {
    const boardsFile = path.join(CATALOG_DIR, "boards.json");
    const catalogFile = path.join(CATALOG_DIR, "catalog.json");

    const boards = fs.existsSync(boardsFile)
      ? JSON.parse(fs.readFileSync(boardsFile, "utf-8"))
      : [];

    const catalog = fs.existsSync(catalogFile)
      ? JSON.parse(fs.readFileSync(catalogFile, "utf-8"))
      : {};

    return { boards, catalog };
  } catch (err) {
    console.error("Error reading catalog data:", err);
    return { boards: [], catalog: {} };
  }
}

/**
 * Shuffles an array deterministically or randomly
 */
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Get catalog filtered by optional board and class
 */
async function getCatalog(boardQuery, classQuery) {
  const { boards, catalog } = getCatalogData();

  if (boardQuery && classQuery) {
    const boardKey = boardQuery.toUpperCase() === "ICSE" ? "ICSE" : boardQuery.toUpperCase() === "CBSE" ? "CBSE" : "State";
    const subjects = catalog[boardKey]?.[classQuery] || [];
    return {
      board: boardKey,
      classLevel: classQuery,
      subjects,
    };
  }

  return {
    boards,
    catalog,
  };
}

/**
 * Get subject roadmap with personalized unlock and star status
 */
async function getSubjectRoadmap(board, classLevel, subject, userId) {
  const normBoard = (board || "ICSE").toUpperCase();
  const normClass = String(classLevel || "9");
  const normSubject = (subject || "mathematics").toLowerCase();

  // 1. Fetch curriculum from DB (if connected), fallback to syllabus file
  let doc = null;
  if (mongoose.connection.readyState === 1) {
    doc = await Curriculum.findOne({
      board: normBoard,
      classLevel: normClass,
      subject: normSubject,
    }).lean();
  }

  if (!doc) {
    // Check local syllabus JSON file
    const filePath = path.join(SYLLABUS_DIR, normBoard, normClass, `${normSubject}.json`);
    if (fs.existsSync(filePath)) {
      const fileData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      // Flatten chapters for legacy compatibility
      const flatChapters = [];
      (fileData.units || []).forEach((u) => {
        (u.chapters || []).forEach((ch) => flatChapters.push(ch));
      });
      fileData.chapters = flatChapters;

      if (mongoose.connection.readyState === 1) {
        doc = await Curriculum.findOneAndUpdate(
          { board: normBoard, classLevel: normClass, subject: normSubject },
          fileData,
          { upsert: true, new: true, setDefaultsOnInsert: true }
        ).lean();
      } else {
        doc = fileData;
      }
    }
  }

  if (!doc) {
    return {
      board: normBoard,
      classLevel: normClass,
      subject: normSubject,
      subjectName: normSubject.charAt(0).toUpperCase() + normSubject.slice(1),
      units: [],
      chapters: [],
      progressPercent: 0,
      completedCount: 0,
      totalLevels: 0,
      isUnderPreparation: true,
    };
  }

  // 2. Fetch user attempts if authenticated and DB connected
  const userAttempts = (userId && mongoose.connection.readyState === 1)
    ? await LevelAttempt.find({ user: userId }).lean()
    : [];

  const passedMap = new Map();
  userAttempts.forEach((att) => {
    if (att.score >= 70) {
      const prev = passedMap.get(att.levelId) || { stars: 0, bestScore: 0 };
      passedMap.set(att.levelId, {
        stars: Math.max(prev.stars, att.stars || 0),
        bestScore: Math.max(prev.bestScore, att.score || 0),
      });
    }
  });

  // 3. Process units and chapters with sequential unlock logic
  let totalLevelsCount = 0;
  let completedLevelsCount = 0;
  let previousLevelPassed = true; // First level of the subject is always unlocked

  const units = (doc.units && doc.units.length > 0 ? doc.units : [{ unitNumber: 1, title: doc.subjectName || "Core Topics", chapters: doc.chapters || [] }]).map((unit) => {
    const chapters = (unit.chapters || []).map((chapter) => {
      const levels = (chapter.levels || []).map((lvl) => {
        totalLevelsCount++;
        const record = passedMap.get(lvl.id);
        const isCompleted = !!record;
        if (isCompleted) completedLevelsCount++;

        const isLocked = !previousLevelPassed;
        // Strictly require at least 8 questions to be considered playable/published
        const hasPublishedContent = Array.isArray(lvl.questions) && lvl.questions.length >= 8;

        // Next level unlocks only if this level is passed
        previousLevelPassed = isCompleted;

        return {
          id: lvl.id,
          levelNumber: lvl.levelNumber,
          title: lvl.title,
          description: lvl.description,
          subtopics: lvl.subtopics || [],
          isReviewLevel: !!lvl.isReviewLevel,
          isLocked,
          isCompleted,
          stars: record ? record.stars : 0,
          bestScore: record ? record.bestScore : 0,
          hasPublishedContent,
          questionCount: Array.isArray(lvl.questions) ? lvl.questions.length : 0,
        };
      });

      return {
        id: chapter.id,
        chapterNumber: chapter.chapterNumber,
        title: chapter.title,
        description: chapter.description,
        levels,
      };
    });

    return {
      unitNumber: unit.unitNumber,
      title: unit.title,
      chapters,
    };
  });

  const progressPercent = totalLevelsCount > 0
    ? Math.round((completedLevelsCount / totalLevelsCount) * 100)
    : 0;

  return {
    board: doc.board,
    classLevel: doc.classLevel,
    subject: doc.subject,
    subjectName: doc.subjectName || doc.subject,
    officialSource: doc.officialSource || "Official Board Curriculum",
    units,
    chapters: doc.chapters || [],
    progressPercent,
    completedCount: completedLevelsCount,
    totalLevels: totalLevelsCount,
    isUnderPreparation: totalLevelsCount === 0,
  };
}

/**
 * Get level content for active quiz session
 * IMPORTANT: Strips correct answers to prevent client cheating
 */
async function getLevelForQuiz(levelId, userId) {
  const doc = await Curriculum.findOne({
    $or: [
      { "units.chapters.levels.id": levelId },
      { "chapters.levels.id": levelId },
    ],
  }).lean();

  if (!doc) {
    return null;
  }

  let targetLevel = null;
  let targetChapter = null;

  for (const unit of doc.units || []) {
    for (const ch of unit.chapters || []) {
      for (const lvl of ch.levels || []) {
        if (lvl.id === levelId) {
          targetLevel = lvl;
          targetChapter = ch;
          break;
        }
      }
      if (targetLevel) break;
    }
    if (targetLevel) break;
  }

  if (!targetLevel) {
    for (const ch of doc.chapters || []) {
      for (const lvl of ch.levels || []) {
        if (lvl.id === levelId) {
          targetLevel = lvl;
          targetChapter = ch;
          break;
        }
      }
      if (targetLevel) break;
    }
  }

  if (!targetLevel) return null;

  // Sanitize questions: NEVER send correctAnswer to client!
  const rawQuestions = targetLevel.questions || [];
  const sanitizedQuestions = shuffleArray(rawQuestions).map((q) => {
    const isOptionType = q.type === "mcq" || q.type === "ordering";
    const options = isOptionType && Array.isArray(q.options)
      ? shuffleArray(q.options)
      : q.options;

    return {
      id: q.id,
      type: q.type || "mcq",
      prompt: q.prompt,
      options: options || [],
      hint: q.hint || "",
      difficulty: q.difficulty || "medium",
      topicTag: q.topicTag || "",
    };
  });

  return {
    level: {
      id: targetLevel.id,
      levelNumber: targetLevel.levelNumber,
      title: targetLevel.title,
      description: targetLevel.description,
      chapterTitle: targetChapter?.title || "",
      subjectName: doc.subjectName || doc.subject,
      subject: doc.subject,
      board: doc.board,
      classLevel: doc.classLevel,
      lesson: targetLevel.lesson || null,
      examples: targetLevel.examples || [],
      isReviewLevel: !!targetLevel.isReviewLevel,
    },
    questions: sanitizedQuestions,
    totalQuestions: sanitizedQuestions.length,
  };
}

/**
 * Server-side grading of student answers
 */
async function gradeLevelAttempt(levelId, userId, answers = {}, timeSpentSeconds = 60) {
  const doc = await Curriculum.findOne({
    $or: [
      { "units.chapters.levels.id": levelId },
      { "chapters.levels.id": levelId },
    ],
  }).lean();

  if (!doc) {
    throw new Error("Level not found");
  }

  let targetLevel = null;
  for (const unit of doc.units || []) {
    for (const ch of unit.chapters || []) {
      for (const lvl of ch.levels || []) {
        if (lvl.id === levelId) {
          targetLevel = lvl;
          break;
        }
      }
      if (targetLevel) break;
    }
    if (targetLevel) break;
  }

  if (!targetLevel) {
    for (const ch of doc.chapters || []) {
      for (const lvl of ch.levels || []) {
        if (lvl.id === levelId) {
          targetLevel = lvl;
          break;
        }
      }
      if (targetLevel) break;
    }
  }

  if (!targetLevel || !targetLevel.questions || targetLevel.questions.length === 0) {
    throw new Error("No questions available for grading in this level");
  }

  const questionsMap = new Map();
  targetLevel.questions.forEach((q) => questionsMap.set(q.id, q));

  let correctCount = 0;
  const totalQuestions = targetLevel.questions.length;
  const questionResults = [];
  const mistakesToTrack = [];

  for (const q of targetLevel.questions) {
    const userAns = answers[q.id];
    let isCorrect = false;

    if (userAns !== undefined && userAns !== null) {
      if (typeof q.correctAnswer === "string" && typeof userAns === "string") {
        isCorrect = q.correctAnswer.trim().toLowerCase() === userAns.trim().toLowerCase();
      } else if (Array.isArray(q.correctAnswer) && Array.isArray(userAns)) {
        isCorrect = JSON.stringify(q.correctAnswer) === JSON.stringify(userAns);
      } else {
        isCorrect = String(q.correctAnswer) === String(userAns);
      }
    }

    if (isCorrect) {
      correctCount++;
    } else {
      mistakesToTrack.push(q);
    }

    questionResults.push({
      questionId: q.id,
      prompt: q.prompt,
      userChoice: userAns ?? null,
      correctAnswer: q.correctAnswer,
      isCorrect,
      explanation: q.explanation || "Correct answer shown above.",
      hint: q.hint || "",
    });
  }

  const score = Math.round((correctCount / totalQuestions) * 100);
  const passed = score >= 70;

  let stars = 0;
  if (score >= 90) stars = 3;
  else if (score >= 80) stars = 2;
  else if (score >= 70) stars = 1;

  // Check previous best attempt for XP calculation
  const priorBest = await LevelAttempt.findOne({
    user: userId,
    levelId,
    passed: true,
  }).sort({ stars: -1, score: -1 });

  const isFirstCompletion = !priorBest && passed;
  const previousStars = priorBest ? priorBest.stars : 0;

  const xpAwarded = calculateLevelXp({
    score,
    stars,
    isFirstCompletion,
    previousStars,
  });

  // Save attempt
  const attempt = await LevelAttempt.create({
    user: userId,
    levelId,
    subject: doc.subject,
    score,
    stars,
    passed,
    isFirstCompletion,
    xpEarned: xpAwarded,
  });

  // Update ActivityLog & streak
  await recordUserActivity(userId, "lesson_complete", {
    xpEarned: xpAwarded,
    levelId,
  });

  // Update cached user streak & total XP
  await recomputeUserStreakAndXp(userId);

  // Manage Spaced Repetition for mistakes
  if (mistakesToTrack.length > 0) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    for (const m of mistakesToTrack) {
      await MistakeReview.findOneAndUpdate(
        { userId, questionId: m.id },
        {
          userId,
          questionId: m.id,
          levelId,
          subject: doc.subject,
          questionData: {
            prompt: m.prompt,
            type: m.type,
            options: m.options,
            explanation: m.explanation,
            hint: m.hint,
            topicTag: m.topicTag,
          },
          stage: 1,
          nextReviewDate: tomorrow,
          isMastered: false,
        },
        { upsert: true }
      );
    }
  }

  return {
    attemptId: attempt._id,
    levelId,
    score,
    passed,
    stars,
    xpAwarded,
    isFirstCompletion,
    correctCount,
    totalQuestions,
    timeSpentSeconds,
    results: questionResults,
  };
}

/**
 * Report a question issue
 */
async function reportQuestion(userId, questionId, levelId, reason, details) {
  return await Report.create({
    userId,
    questionId,
    levelId,
    reason,
    details,
  });
}

/**
 * Get mistakes due for spaced repetition review
 */
async function getDueMistakes(userId, subject) {
  const query = {
    userId,
    isMastered: false,
    nextReviewDate: { $lte: new Date() },
  };
  if (subject) query.subject = subject.toLowerCase();

  return await MistakeReview.find(query).limit(15).lean();
}

module.exports = {
  getCatalog,
  getSubjectRoadmap,
  getLevelForQuiz,
  gradeLevelAttempt,
  reportQuestion,
  getDueMistakes,
};
