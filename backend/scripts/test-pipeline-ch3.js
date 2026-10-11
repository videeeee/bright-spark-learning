const fs = require("fs");
const path = require("path");
const { generateLevelDraft, verifyAndRefineLevel } = require("./generate-content");

async function runPipelineOnChapter3() {
  console.log("🚀 Starting Pilot Content Pipeline on ICSE Class 9 Mathematics Chapter 3 (Expansions & Factorisation)...");

  const syllabusPath = path.resolve(__dirname, "../content/syllabus/ICSE/9/mathematics.json");
  const syllabus = JSON.parse(fs.readFileSync(syllabusPath, "utf-8"));

  const ch3 = syllabus.units
    .flatMap((u) => u.chapters)
    .find((c) => c.id === "icse-9-math-ch3");

  if (!ch3) {
    console.error("❌ Chapter 3 not found in syllabus");
    process.exit(1);
  }

  console.log(`Found Chapter: ${ch3.title} (${ch3.levels.length} levels)`);

  let totalQuestionsGenerated = 0;
  let totalQuestionsPassed = 0;
  let totalQuestionsDropped = 0;

  for (const level of ch3.levels) {
    console.log(`\n--------------------------------------------------`);
    console.log(`Generating Level ${level.levelNumber}: ${level.title}...`);

    try {
      // Pass 1: Generate Draft
      const draft = await generateLevelDraft("ICSE", "9", "mathematics", ch3.title, level);
      console.log(`- Pass 1 Draft completed: ${(draft.questions || []).length} candidate questions generated.`);

      // Pass 2: Independent Verification and Quality Gate
      const result = await verifyAndRefineLevel(draft, level);
      console.log(`- Pass 2 Quality Gate: ${result.passedCount} passed, ${result.droppedCount} dropped.`);

      totalQuestionsGenerated += result.totalGenerated;
      totalQuestionsPassed += result.passedCount;
      totalQuestionsDropped += result.droppedCount;

      if (!result.valid) {
        console.warn(`⚠️ Quality Gate warning for Level ${level.id}:`, result.errors.join("; "));
      } else {
        console.log(`✅ Level ${level.id} passed quality gate with ${result.passedCount} verified questions!`);
      }

      // Update level in memory
      level.lesson = result.refinedLevel.lesson;
      level.examples = result.refinedLevel.examples;
      level.questions = result.refinedLevel.questions;
    } catch (err) {
      console.error(`❌ Error processing Level ${level.id}:`, err.message);
    }
  }

  // Save back to syllabus file
  fs.writeFileSync(syllabusPath, JSON.stringify(syllabus, null, 2), "utf-8");
  console.log(`\n💾 Saved updated syllabus with Chapter 3 to ${syllabusPath}`);

  // Summary Metrics
  const passRate = totalQuestionsGenerated > 0 ? ((totalQuestionsPassed / totalQuestionsGenerated) * 100).toFixed(1) : "0.0";
  const dropRate = totalQuestionsGenerated > 0 ? ((totalQuestionsDropped / totalQuestionsGenerated) * 100).toFixed(1) : "0.0";

  console.log("\n==================================================");
  console.log("📊 PIPELINE EXECUTION SUMMARY (Chapter 3)");
  console.log(`Total Questions Generated: ${totalQuestionsGenerated}`);
  console.log(`Total Questions Passed:    ${totalQuestionsPassed}`);
  console.log(`Total Questions Dropped:   ${totalQuestionsDropped}`);
  console.log(`Pass Rate:                 ${passRate}%`);
  console.log(`Drop Rate:                 ${dropRate}%`);
  console.log("==================================================");
}

runPipelineOnChapter3().catch((err) => {
  console.error("Fatal pipeline error:", err);
  process.exit(1);
});
