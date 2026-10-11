/**
 * Batch Generator for ICSE Class 9 Subjects
 * Generates verified educational lessons, worked examples, and at least 8-12 questions per level.
 * Order: Mathematics -> Science -> Computer Applications -> English -> Hindi -> Social Studies.
 * Saves immediately after each level and seeds to learnquest_staging.
 */

const fs = require("fs");
const path = require("path");
const { generateLevelDraft, verifyAndRefineLevel } = require("./generate-content");

const SUBJECTS_CONFIG = [
  { file: "mathematics.json", name: "Mathematics", subjectKey: "mathematics" },
  { file: "science.json", name: "Science", subjectKey: "science" },
  { file: "computer-applications.json", name: "Computer Applications", subjectKey: "computer-applications" },
  { file: "english.json", name: "English", subjectKey: "english" },
  { file: "hindi.json", name: "Hindi", subjectKey: "hindi" },
  { file: "social-studies.json", name: "Social Studies", subjectKey: "social-studies" }
];

const SYLLABUS_BASE = path.resolve(__dirname, "../content/syllabus/ICSE/9");

async function runBatch() {
  console.log("🚀 Starting ICSE Class 9 Content Generation Pipeline...\n");

  for (const item of SUBJECTS_CONFIG) {
    const filePath = path.join(SYLLABUS_BASE, item.file);
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ Syllabus file not found: ${filePath}`);
      continue;
    }

    const syllabus = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    console.log(`\n==================================================`);
    console.log(`📚 Processing Subject: ${item.name} (${item.file})`);
    console.log(`==================================================`);

    // We target filling the first chapter of each subject (or unfinished levels) to make them fully playable
    // First chapter of each subject must have verified, playable levels (at least 8 questions)
    let levelsProcessedForSubject = 0;

    for (const unit of syllabus.units || []) {
      for (const chapter of unit.chapters || []) {
        for (let lIdx = 0; lIdx < chapter.levels.length; lIdx++) {
          const level = chapter.levels[lIdx];
          const currentQs = Array.isArray(level.questions) ? level.questions.length : 0;

          // If the level already has >= 8 verified questions, count and skip
          if (currentQs >= 8) {
            console.log(`⏩ Level ${level.id} (${level.title}) already has ${currentQs} verified questions. Skipping.`);
            levelsProcessedForSubject++;
            if (levelsProcessedForSubject >= 2) break;
            continue;
          }

          // We generate content for Level 1 of each chapter or until target is met
          console.log(`\n⚙️ Generating content for: [${chapter.title}] -> [${level.title}] (ID: ${level.id})`);

          let attempts = 3;
          let success = false;

          while (attempts > 0 && !success) {
            try {
              console.log(`   Calling multi-provider LLM (Attempt ${4 - attempts})...`);
              const draft = await generateLevelDraft("ICSE", "9", item.name, chapter.title, level);
              
              const verification = await verifyAndRefineLevel(draft, level);
              console.log(`   Generated: ${verification.totalGenerated} candidates | Passed validator: ${verification.passedCount} | Dropped: ${verification.droppedCount}`);

              if (verification.passedCount >= 8) {
                // Attach refined lesson, examples, questions and mark published
                chapter.levels[lIdx] = {
                  ...level,
                  status: "published",
                  lesson: verification.refinedLevel.lesson,
                  examples: verification.refinedLevel.examples,
                  questions: verification.refinedLevel.questions
                };

                // Save to file immediately
                fs.writeFileSync(filePath, JSON.stringify(syllabus, null, 2), "utf-8");
                console.log(`   ✅ Saved level ${level.id} with ${verification.passedCount} verified questions!`);
                success = true;
                levelsProcessedForSubject++;
              } else {
                console.warn(`   ⚠️ Only ${verification.passedCount} questions passed (need >= 8). Retrying...`);
                attempts--;
                await new Promise((r) => setTimeout(r, 4000));
              }
            } catch (err) {
              console.error(`   ❌ Generation error for ${level.id}: ${err.message}`);
              attempts--;
              if (attempts > 0) {
                console.log(`   Pacing 5s before retry...`);
                await new Promise((r) => setTimeout(r, 5000));
              }
            }
          }

          if (!success) {
            console.warn(`   ⚠️ Could not reach 8 verified questions for ${level.id} in this pass. Keeping existing status.`);
          }

          // Short pacing pause between levels to avoid provider bursts
          await new Promise((r) => setTimeout(r, 3000));

          // For initial go-live, ensure at least the first 2 levels of Chapter 1 of each subject are playable
          if (levelsProcessedForSubject >= 2) {
            break;
          }
        }
        if (levelsProcessedForSubject >= 2) {
          break;
        }
      }
      if (levelsProcessedForSubject >= 2) {
        break;
      }
    }
  }

  console.log("\n==================================================");
  console.log("🏁 Batch generation run finished!");
  console.log("==================================================");
}

runBatch().catch((err) => {
  console.error("Fatal error in batch generator:", err);
  process.exit(1);
});
