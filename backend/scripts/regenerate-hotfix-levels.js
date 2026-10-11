const fs = require("fs");
const path = require("path");
const {
  generateLevelDraft,
  verifyAndRefineLevel,
} = require("./generate-content");

const SYLLABUS_DIR = path.resolve(__dirname, "../content/syllabus");

const TARGETS = [
  {
    file: "ICSE/9/hindi.json",
    board: "ICSE",
    classLevel: "9",
    subject: "hindi",
    unitIndex: 0,
    chapterIndex: 0,
    levelIndex: 0,
  },
];

async function run() {
  for (const t of TARGETS) {
    const fullPath = path.join(SYLLABUS_DIR, t.file);
    const data = JSON.parse(fs.readFileSync(fullPath, "utf-8"));
    const unit = data.units[t.unitIndex];
    const chapter = unit.chapters[t.chapterIndex];
    const level = chapter.levels[t.levelIndex];

    console.log(`\n======================================================`);
    console.log(`🚀 Regenerating ${t.board} Class ${t.classLevel} ${t.subject}`);
    console.log(`Level: ${level.id} ("${level.title}")`);
    console.log(`======================================================`);

    try {
      // Pass 1: Generate Draft
      console.log(`Generating Pass 1 draft...`);
      const { draft, generatorProvider, generatorModel } = await generateLevelDraft(
        t.board,
        t.classLevel,
        t.subject,
        chapter.title,
        level
      );
      console.log(`Pass 1 completed via ${generatorProvider} (${generatorModel}). Questions generated: ${(draft.questions || []).length}`);

      // Pass 2: Independent verification & quality gate
      console.log(`Running Pass 2 quality gate & cross-verification...`);
      const result = await verifyAndRefineLevel(draft, level, t.subject, generatorProvider);

      console.log(`Verification summary for ${level.id}:`);
      console.log(`- Total candidate questions: ${result.totalGenerated}`);
      console.log(`- Rule & gate passed: ${result.passedCount}`);
      console.log(`- Cross-verified: ${result.crossVerifiedCount}`);
      console.log(`- Dropped: ${result.droppedCount}`);
      console.log(`- Status: ${result.refinedLevel.status}`);

      if (result.passedCount >= 8) {
        result.refinedLevel.status = "published";
        chapter.levels[t.levelIndex] = result.refinedLevel;
        fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), "utf-8");
        console.log(`✅ Successfully saved and published ${level.id} into ${t.file}`);
      } else {
        console.warn(`❌ Failed to reach 8 valid questions (${result.passedCount}/8). Level kept in draft.`);
      }
    } catch (err) {
      console.error(`💥 Error regenerating ${level.id}:`, err.message);
    }
  }
}

run();
