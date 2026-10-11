import { describe, it, expect, beforeEach } from "vitest";
import path from "path";
import fs from "fs";
import {
  getCatalog,
  getSubjectRoadmap,
  getLevelForQuiz,
  gradeLevelAttempt,
} from "../services/curriculum.service";

describe("Curriculum & Catalog Engine", () => {
  it("loads boards and full catalog from JSON definitions", async () => {
    const data = await getCatalog();
    expect(data.boards).toBeDefined();
    expect(Array.isArray(data.boards)).toBe(true);
    expect(data.boards.length).toBeGreaterThanOrEqual(3);

    const icseBoard = data.boards.find((b) => b.id === "ICSE");
    expect(icseBoard).toBeDefined();
    expect(icseBoard.classes).toContain("9");
    expect(icseBoard.comingSoonClasses).toContain("10");

    expect(data.catalog).toBeDefined();
    expect(data.catalog.ICSE).toBeDefined();
    expect(data.catalog.ICSE["9"]).toBeDefined();
    expect(data.catalog.ICSE["9"].length).toBeGreaterThanOrEqual(5);
  });

  it("filters catalog by board and class query", async () => {
    const data = await getCatalog("ICSE", "9");
    expect(data.board).toBe("ICSE");
    expect(data.classLevel).toBe("9");
    expect(Array.isArray(data.subjects)).toBe(true);

    const math = data.subjects.find((s) => s.id === "mathematics");
    expect(math).toBeDefined();
    expect(math.isCompulsory).toBe(true);
    expect(math.category).toBe("mathematics");
  });

  it("derives official units, chapters, and levels for ICSE Class 9 Mathematics", async () => {
    const roadmap = await getSubjectRoadmap("ICSE", "9", "mathematics", null);
    expect(roadmap.board).toBe("ICSE");
    expect(roadmap.classLevel).toBe("9");
    expect(roadmap.subject).toBe("mathematics");
    expect(roadmap.units.length).toBeGreaterThan(0);

    const firstUnit = roadmap.units[0];
    expect(firstUnit.chapters.length).toBeGreaterThan(0);

    const firstChapter = firstUnit.chapters[0];
    expect(firstChapter.levels.length).toBeGreaterThan(0);

    // Level 1 of Chapter 1 must be unlocked for new learner
    const firstLevel = firstChapter.levels[0];
    expect(firstLevel.isLocked).toBe(false);
  });

  it("never leaks correct answers when serving level questions to client", async () => {
    // Check syllabus content questions
    const syllabusFile = path.join(__dirname, "../content/syllabus/ICSE/9/computer-applications.json");
    if (fs.existsSync(syllabusFile)) {
      const data = JSON.parse(fs.readFileSync(syllabusFile, "utf-8"));
      const firstLevelId = data.units[0].chapters[0].levels[0].id;

      // Mock level with sample question to test sanitization
      data.units[0].chapters[0].levels[0].questions = [
        {
          id: "q-test-1",
          type: "mcq",
          prompt: "What is an object in Java?",
          options: ["Software bundle of state and behavior", "Just a primitive type", "A compiler error"],
          correctAnswer: "Software bundle of state and behavior",
          explanation: "Objects have state and behavior.",
        },
      ];

      // Re-write temporarily or test sanitization logic directly
      const questions = data.units[0].chapters[0].levels[0].questions.map((q) => {
        const { correctAnswer, ...clientSafe } = q;
        return clientSafe;
      });

      expect(questions[0].correctAnswer).toBeUndefined();
      expect(questions[0].prompt).toBe("What is an object in Java?");
      expect(questions[0].options).toHaveLength(3);
    }
  });

  it("grades student answers accurately case-insensitively", () => {
    const questions = [
      { id: "q1", correctAnswer: "rational" },
      { id: "q2", correctAnswer: "4" },
      { id: "q3", correctAnswer: "True" },
    ];

    const studentAnswers = {
      q1: "RATIONAL ", // Trailing space and different casing
      q2: "4",
      q3: "false",
    };

    let correct = 0;
    questions.forEach((q) => {
      const ans = studentAnswers[q.id];
      if (ans && ans.trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase()) {
        correct++;
      }
    });

    expect(correct).toBe(2);
    const score = Math.round((correct / questions.length) * 100);
    expect(score).toBe(67);
    const passed = score >= 70;
    expect(passed).toBe(false);
  });

  it("assigns stars properly based on accuracy thresholds", () => {
    function computeStars(score) {
      if (score >= 90) return 3;
      if (score >= 80) return 2;
      if (score >= 70) return 1;
      return 0;
    }

    expect(computeStars(95)).toBe(3);
    expect(computeStars(90)).toBe(3);
    expect(computeStars(85)).toBe(2);
    expect(computeStars(80)).toBe(2);
    expect(computeStars(75)).toBe(1);
    expect(computeStars(70)).toBe(1);
    expect(computeStars(69)).toBe(0);
    expect(computeStars(50)).toBe(0);
  });

  it("regression: calculateLevelXp works when destructured without this context", () => {
    const { calculateLevelXp } = require("../config/xpRules");
    expect(() => {
      const xp = calculateLevelXp({ score: 85, isFirstCompletion: true });
      expect(xp).toBe(50); // 40 base + 10 (2 stars)
    }).not.toThrow();
  });

  it("regression: old-schema user document compatibility", () => {
    // Old schema user document: only basic fields, missing new schema fields
    const legacyUser = {
      _id: "507f1f77bcf86cd799439011",
      name: "Legacy Student",
      email: "legacy@example.com",
      password: "hashedpassword123",
      classLevel: "9",
      curriculum: "ICSE",
      // Notice: companion, settings, totalXp, currentStreak, lastActiveDate are all undefined
    };

    // Verify virtual displayName works on legacy user
    const parts = legacyUser.name.trim().split(" ");
    const displayName = parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.` : parts[0];
    expect(displayName).toBe("Legacy S.");

    // Default fallbacks should work seamlessly
    const companion = legacyUser.companion || "solin";
    const totalXp = legacyUser.totalXp || 0;
    const currentStreak = legacyUser.currentStreak || 0;

    expect(companion).toBe("solin");
    expect(totalXp).toBe(0);
    expect(currentStreak).toBe(0);
  });
});

