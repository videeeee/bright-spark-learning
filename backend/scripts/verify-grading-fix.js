const dns = require("dns");
if (process.env.ENABLE_CUSTOM_DNS === "true") {
  try {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
  } catch {}
}

const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const mongoose = require("mongoose");
const User = require("../models/User");
const Progress = require("../models/Progress");
const LevelAttempt = require("../models/LevelAttempt");
const ActivityLog = require("../models/ActivityLog");
const { gradeLevelAttempt } = require("../services/curriculum.service");

async function testGrading() {
  console.log("Connecting to staging DB...");
  await mongoose.connect(process.env.MONGO_URI);
  console.log(`Connected to: ${mongoose.connection.name}`);

  // 1. Create a legacy test user document (simulating pre-migration production account)
  const testEmail = `legacy_tester_${Date.now()}@example.com`;
  
  // Use raw collection insert to bypass Mongoose schema defaults, ensuring old-schema structure
  const rawUser = {
    name: "Old Account Tester",
    email: testEmail,
    password: "$2a$10$hashedpasswordplaceholder1234567890",
    classLevel: "9",
    curriculum: "ICSE",
    createdAt: new Date("2026-09-01T00:00:00Z"),
    updatedAt: new Date("2026-09-01T00:00:00Z"),
    // companion, settings, totalXp, currentStreak, lastActiveDate are all completely omitted
  };

  const insertRes = await mongoose.connection.collection("users").insertOne(rawUser);
  const userId = insertRes.insertedId;
  console.log(`Created legacy user: ${userId}`);

  // 2. Insert a legacy Progress record
  await mongoose.connection.collection("progresses").insertOne({
    user: userId,
    subject: "mathematics",
    chapterNumber: 1,
    levelNumber: 1,
    isCompleted: true,
    xpEarned: 50,
    createdAt: new Date("2026-09-01T00:00:00Z"),
    updatedAt: new Date("2026-09-01T00:00:00Z"),
  });
  console.log("Created legacy Progress record for user");

  // 3. Test grading on icse-9-math-ch1-l1
  console.log("Testing gradeLevelAttempt for level icse-9-math-ch1-l1...");
  const answers = {
    "icse-9-math-q1-1": "$\\frac{4}{9}$",
    "icse-9-math-q1-2": "$\\frac{17}{125}$",
    "icse-9-math-q1-3": "$\\frac{1}{6}$",
    "icse-9-math-q1-4": "$\\sqrt{20}$",
    "icse-9-math-q1-5": "$\\frac{14}{11}$",
    "icse-9-math-q1-6": "$\\frac{58}{99}$",
    "icse-9-math-q1-7": "The product of a non-zero rational number and an irrational number is always irrational",
    "icse-9-math-q1-8": "$\\frac{233}{990}$",
  };

  try {
    const result = await gradeLevelAttempt("icse-9-math-ch1-l1", userId, answers, 75);
    console.log("✅ gradeLevelAttempt completed successfully!");
    console.log("- Score:", result.score);
    console.log("- Passed:", result.passed);
    console.log("- Stars:", result.stars);
    console.log("- XP Awarded:", result.xpAwarded);
    console.log("- Correct Count:", result.correctCount, "/", result.totalQuestions);

    // 4. Verify user record update
    const updatedUser = await User.findById(userId);
    console.log("\nVerified Updated User:");
    console.log("- Total XP:", updatedUser.totalXp);
    console.log("- Current Streak:", updatedUser.currentStreak);
    console.log("- Last Active Date:", updatedUser.lastActiveDate);

    // 5. Verify LevelAttempt
    const attempt = await LevelAttempt.findById(result.attemptId);
    console.log("\nVerified LevelAttempt:");
    console.log("- Chapter Number:", attempt.chapterNumber);
    console.log("- Level Number:", attempt.levelNumber);
    console.log("- Score:", attempt.score);

    // 6. Verify ActivityLog
    const act = await ActivityLog.findOne({ user: userId });
    console.log("\nVerified ActivityLog:");
    console.log("- Type:", act?.type);
    console.log("- DateString:", act?.dateString);

    // 7. Clean up
    await User.findByIdAndDelete(userId);
    await Progress.deleteMany({ user: userId });
    await LevelAttempt.deleteMany({ user: userId });
    await ActivityLog.deleteMany({ user: userId });
    console.log("\n🧹 Test user cleaned up successfully.");
  } catch (err) {
    console.error("❌ Grading test FAILED:", err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

testGrading();
