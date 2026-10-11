import { describe, it, expect, beforeAll, afterAll } from "vitest";
const dns = require("dns");
if (process.env.ENABLE_CUSTOM_DNS === "true") {
  try { dns.setServers(["8.8.8.8", "1.1.1.1"]); } catch {}
}

const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const env = require("../config/env");
const User = require("../models/User");
const Progress = require("../models/Progress");
const LevelAttempt = require("../models/LevelAttempt");
const ActivityLog = require("../models/ActivityLog");
const Curriculum = require("../models/Curriculum");

describe("Automated End-to-End Grading & Progress Engine", () => {
  let createdUserIds = [];
  let testServer = null;
  let BASE_URL = "";

  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    const { app } = require("../server");
    while (mongoose.connection.readyState !== 1) {
      await new Promise((r) => setTimeout(r, 200));
    }
    await new Promise((resolve) => {
      testServer = app.listen(0, () => {
        const port = testServer.address().port;
        BASE_URL = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    for (const uid of createdUserIds) {
      try {
        await User.findByIdAndDelete(uid);
        await Progress.deleteMany({ user: uid });
        await LevelAttempt.deleteMany({ user: uid });
        await ActivityLog.deleteMany({ user: uid });
      } catch (_) {}
    }
    if (testServer) {
      await new Promise((resolve) => testServer.close(resolve));
    }
    await mongoose.disconnect();
  });

  it("Full E2E flow: Signup -> Fetch Level Quiz -> Grade Level -> Verify XP & Streak Update", async () => {
    const uniqueEmail = `e2e_student_${Date.now()}@learnquest.test`;
    
    // 1. Sign up new learner
    const signupRes = await axios.post(`${BASE_URL}/api/auth/signup`, {
      name: "Aarav Sharma",
      email: uniqueEmail,
      password: "password123",
      classLevel: "9",
      curriculum: "ICSE",
      companion: "solin",
    });

    expect(signupRes.status).toBe(201);
    expect(signupRes.data.success).toBe(true);
    expect(signupRes.data.token).toBeDefined();
    const token = signupRes.data.token;
    const userId = signupRes.data.user.id;
    createdUserIds.push(userId);

    const headers = { Authorization: `Bearer ${token}` };

    // 2. Fetch level content for quiz
    const quizRes = await axios.get(`${BASE_URL}/api/curriculum/level/icse-9-sci-ch1-l1`, { headers });
    expect(quizRes.status).toBe(200);
    expect(quizRes.data.level).toBeDefined();
    expect(quizRes.data.questions).toBeDefined();
    expect(Array.isArray(quizRes.data.questions)).toBe(true);
    expect(quizRes.data.questions.length).toBeGreaterThanOrEqual(8);

    // Verify correct answers are NOT exposed to the client
    quizRes.data.questions.forEach((q) => {
      expect(q.correctAnswer).toBeUndefined();
    });

    // 3. Prepare answers and grade
    const targetDoc = await Curriculum.findOne({ "units.chapters.levels.id": "icse-9-sci-ch1-l1" }).lean();
    let questionsWithKey = [];
    for (const u of targetDoc.units || []) {
      for (const ch of u.chapters || []) {
        for (const lvl of ch.levels || []) {
          if (lvl.id === "icse-9-sci-ch1-l1") {
            questionsWithKey = lvl.questions;
          }
        }
      }
    }

    const answers = {};
    questionsWithKey.forEach((q) => {
      answers[q.id] = q.correctAnswer;
    });

    const gradeRes = await axios.post(
      `${BASE_URL}/api/curriculum/level/icse-9-sci-ch1-l1/grade`,
      { answers, timeSpentSeconds: 65 },
      { headers }
    );

    expect(gradeRes.status).toBe(200);
    expect(gradeRes.data.success).toBe(true);
    expect(gradeRes.data.passed).toBe(true);
    expect(gradeRes.data.score).toBe(100);
    expect(gradeRes.data.stars).toBe(3);
    expect(gradeRes.data.xpAwarded).toBeGreaterThanOrEqual(40);

    // 4. Verify progress summary
    const summaryRes = await axios.get(`${BASE_URL}/api/progress/summary`, { headers });
    expect(summaryRes.status).toBe(200);
    expect(summaryRes.data.success).toBe(true);
    expect(summaryRes.data.xp.totalXp).toBeGreaterThanOrEqual(40);
    expect(summaryRes.data.streak.currentStreak).toBeGreaterThanOrEqual(1);
    expect(summaryRes.data.stats.levelsCompleted).toBeGreaterThanOrEqual(1);
  });

  it("Old-Style User Compatibility: grade attempt with legacy document & legacy progress", async () => {
    // 1. Create raw old-style user document (missing companion, settings, totalXp, currentStreak, lastActiveDate)
    const legacyEmail = `legacy_user_${Date.now()}@learnquest.test`;
    const insertRes = await mongoose.connection.collection("users").insertOne({
      name: "Rohan V.",
      email: legacyEmail,
      password: "$2a$10$oldhashedpassword1234567890123456",
      classLevel: "9",
      curriculum: "ICSE",
      createdAt: new Date("2026-08-15T00:00:00Z"),
      updatedAt: new Date("2026-08-15T00:00:00Z"),
    });

    const legacyUserId = insertRes.insertedId.toString();
    createdUserIds.push(legacyUserId);

    // 2. Insert a legacy Progress record
    await mongoose.connection.collection("progresses").insertOne({
      user: insertRes.insertedId,
      subject: "science",
      chapterNumber: 1,
      levelNumber: 1,
      isCompleted: true,
      xpEarned: 50,
      createdAt: new Date("2026-08-15T00:00:00Z"),
      updatedAt: new Date("2026-08-15T00:00:00Z"),
    });

    // 3. Generate token
    const token = jwt.sign({ id: legacyUserId, email: legacyEmail }, env.JWT_SECRET, { expiresIn: "1d" });
    const headers = { Authorization: `Bearer ${token}` };

    // 4. Fetch quiz
    const quizRes = await axios.get(`${BASE_URL}/api/curriculum/level/icse-9-sci-ch1-l1`, { headers });
    expect(quizRes.status).toBe(200);

    // 5. Submit grade
    const targetDoc = await Curriculum.findOne({ "units.chapters.levels.id": "icse-9-sci-ch1-l1" }).lean();
    let questionsWithKey = [];
    for (const u of targetDoc.units || []) {
      for (const ch of u.chapters || []) {
        for (const lvl of ch.levels || []) {
          if (lvl.id === "icse-9-sci-ch1-l1") {
            questionsWithKey = lvl.questions;
          }
        }
      }
    }

    const answers = {};
    questionsWithKey.forEach((q) => {
      answers[q.id] = q.correctAnswer;
    });

    const gradeRes = await axios.post(
      `${BASE_URL}/api/curriculum/level/icse-9-sci-ch1-l1/grade`,
      { answers, timeSpentSeconds: 90 },
      { headers }
    );

    // Must return HTTP 200 without throwing 500
    expect(gradeRes.status).toBe(200);
    expect(gradeRes.data.success).toBe(true);
    expect(gradeRes.data.passed).toBe(true);

    // 6. Verify user document cached fields updated
    const updatedUser = await User.findById(legacyUserId);
    expect(updatedUser.totalXp).toBeGreaterThan(0);
    expect(updatedUser.currentStreak).toBeGreaterThanOrEqual(1);

    // 7. Verify progress summary endpoint works for old-style user
    const summaryRes = await axios.get(`${BASE_URL}/api/progress/summary`, { headers });
    expect(summaryRes.status).toBe(200);
    expect(summaryRes.data.xp.totalXp).toBeGreaterThan(0);
    expect(summaryRes.data.streak.currentStreak).toBeGreaterThanOrEqual(1);
  });
});
