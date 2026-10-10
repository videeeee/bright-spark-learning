const express = require("express");
const auth = require("../middleware/auth");
const optionalAuth = require("../middleware/optionalAuth");
const Curriculum = require("../models/Curriculum");
const curriculumService = require("../services/curriculum.service");

const router = express.Router();

/**
 * GET /api/curriculum/catalog
 * Public: returns boards, classes, and subjects metadata
 */
router.get("/catalog", async (req, res, next) => {
  try {
    const { board, classLevel } = req.query;
    const catalog = await curriculumService.getCatalog(board, classLevel);
    res.json(catalog);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/curriculum/roadmap
 * Protected: returns subject roadmap with units, chapters, and personalized unlock/star status
 */
router.get("/roadmap", auth, async (req, res, next) => {
  try {
    const subject = req.query.subject || "mathematics";
    const board = req.query.board || req.user.curriculum || "ICSE";
    const classLevel = req.query.classLevel || req.user.classLevel || "9";

    const roadmap = await curriculumService.getSubjectRoadmap(
      board,
      classLevel,
      subject,
      req.user.id
    );

    res.json(roadmap);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/curriculum/level/:levelId
 * Protected: returns quiz session content with answers stripped out
 */
router.get("/level/:levelId", auth, async (req, res, next) => {
  try {
    const { levelId } = req.params;
    const levelData = await curriculumService.getLevelForQuiz(levelId, req.user.id);

    if (!levelData) {
      return res.status(404).json({
        success: false,
        msg: "Level not found or has no published questions yet",
      });
    }

    res.json(levelData);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/curriculum/level/:levelId/grade
 * Protected: server-side grading of student quiz attempt
 */
router.post("/level/:levelId/grade", auth, async (req, res, next) => {
  try {
    const { levelId } = req.params;
    const { answers, timeSpentSeconds } = req.body;

    const gradingResult = await curriculumService.gradeLevelAttempt(
      levelId,
      req.user.id,
      answers || {},
      timeSpentSeconds || 60
    );

    res.json({
      success: true,
      ...gradingResult,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/curriculum/report
 * Protected: report an issue with a question
 */
router.post("/report", auth, async (req, res, next) => {
  try {
    const { questionId, levelId, reason, details } = req.body;

    if (!questionId || !levelId || !reason) {
      return res.status(400).json({
        success: false,
        msg: "Question ID, level ID, and reason are required",
      });
    }

    const report = await curriculumService.reportQuestion(
      req.user.id,
      questionId,
      levelId,
      reason,
      details
    );

    res.status(201).json({
      success: true,
      msg: "Report submitted successfully. Thank you for improving LearnQuest!",
      reportId: report._id,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/curriculum/review-mistakes
 * Protected: spaced repetition questions due for review
 */
router.get("/review-mistakes", auth, async (req, res, next) => {
  try {
    const { subject } = req.query;
    const dueQuestions = await curriculumService.getDueMistakes(req.user.id, subject);
    res.json(dueQuestions);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/curriculum
 * Legacy backward compatibility endpoint
 */
router.get("/", auth, async (req, res, next) => {
  try {
    const currs = await Curriculum.find({}).lean();
    res.json(currs);
  } catch (err) {
    next(err);
  }
});

module.exports = router;