import { describe, it, expect } from "vitest";
const {
  calculateStreakFromDates,
  getOffsetDateString,
  getKolkataDateString,
} = require("../services/progress.service");
const XP_RULES = require("../config/xpRules");

describe("Progress Service - Streak Engine (Timezone & Grace Period)", () => {
  const TODAY = "2026-10-10";
  const YESTERDAY = "2026-10-09";
  const TWO_DAYS_AGO = "2026-10-08";
  const THREE_DAYS_AGO = "2026-10-07";

  it("should return streak 0 if no activities exist", () => {
    const result = calculateStreakFromDates([], TODAY);
    expect(result.streak).toBe(0);
    expect(result.activeToday).toBe(false);
  });

  it("should return streak 1 if active today only", () => {
    const result = calculateStreakFromDates([TODAY], TODAY);
    expect(result.streak).toBe(1);
    expect(result.activeToday).toBe(true);
  });

  it("should maintain streak if active yesterday (grace period for today)", () => {
    const result = calculateStreakFromDates([YESTERDAY, TWO_DAYS_AGO], TODAY);
    expect(result.streak).toBe(2);
    expect(result.activeToday).toBe(false);
  });

  it("should calculate consecutive streak across multiple days including today", () => {
    const result = calculateStreakFromDates(
      [TODAY, YESTERDAY, TWO_DAYS_AGO, THREE_DAYS_AGO],
      TODAY
    );
    expect(result.streak).toBe(4);
    expect(result.activeToday).toBe(true);
  });

  it("should reset streak to 0 if gap is greater than 1 day", () => {
    // Last active 2 days ago (missed yesterday and today)
    const result = calculateStreakFromDates([TWO_DAYS_AGO, THREE_DAYS_AGO], TODAY);
    expect(result.streak).toBe(0);
    expect(result.activeToday).toBe(false);
  });

  it("should handle duplicate activity entries on the same day cleanly", () => {
    const result = calculateStreakFromDates(
      [TODAY, TODAY, TODAY, YESTERDAY, YESTERDAY],
      TODAY
    );
    expect(result.streak).toBe(2);
    expect(result.activeToday).toBe(true);
  });

  it("should correctly offset date strings across month boundaries", () => {
    expect(getOffsetDateString("2026-03-01", -1)).toBe("2026-02-28");
    expect(getOffsetDateString("2026-12-31", 1)).toBe("2027-01-01");
  });
});

describe("XP Rules & Grading", () => {
  it("should award 0 XP and 0 stars when score is below pass threshold (70)", () => {
    expect(XP_RULES.calculateStars(65)).toBe(0);
    expect(
      XP_RULES.calculateLevelXp({
        score: 65,
        isFirstCompletion: true,
      })
    ).toBe(0);
  });

  it("should award full XP (60 XP = 40 base + 20 star bonus) on first completion with score >= 95", () => {
    expect(XP_RULES.calculateStars(100)).toBe(3);
    const xp = XP_RULES.calculateLevelXp({
      score: 100,
      isFirstCompletion: true,
      previousBestStars: 0,
    });
    expect(xp).toBe(60);
  });

  it("should award reduced practice XP (5 XP) on replay if stars did not improve", () => {
    const xp = XP_RULES.calculateLevelXp({
      score: 85,
      isFirstCompletion: false,
      previousBestStars: 2,
    });
    expect(xp).toBe(5);
  });

  it("should award star upgrade bonus if replay improves stars", () => {
    const xp = XP_RULES.calculateLevelXp({
      score: 98, // 3 stars
      isFirstCompletion: false,
      previousBestStars: 1, // was 1 star
    });
    // (3 - 1) * 10 = 20 XP
    expect(xp).toBe(20);
  });
});
