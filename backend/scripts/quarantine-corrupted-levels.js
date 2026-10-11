const fs = require("fs");
const path = require("path");
const { validateQuestion } = require("../services/content-validator");

const SYLLABUS_DIR = path.resolve(__dirname, "../content/syllabus");

const files = [
  "CBSE/9/mathematics.json",
  "CBSE/9/science.json",
  "ICSE/9/computer-applications.json",
  "ICSE/9/english.json",
  "ICSE/9/hindi.json",
  "ICSE/9/mathematics.json",
  "ICSE/9/science.json",
  "ICSE/9/social-studies.json",
];

let quarantinedCount = 0;

for (const rel of files) {
  const fullPath = path.join(SYLLABUS_DIR, rel);
  if (!fs.existsSync(fullPath)) continue;

  const data = JSON.parse(fs.readFileSync(fullPath, "utf-8"));
  const subject = data.subject || "";

  let modified = false;

  const chapters = [];
  if (Array.isArray(data.units)) {
    for (const u of data.units) {
      if (Array.isArray(u.chapters)) chapters.push(...u.chapters);
    }
  }
  if (Array.isArray(data.chapters)) {
    chapters.push(...data.chapters);
  }

  for (const ch of chapters) {
    for (const lvl of ch.levels || []) {
      const questions = lvl.questions || [];
      const validQuestions = [];

      for (const q of questions) {
        const res = validateQuestion(q, { subject });
        if (res.valid) {
          validQuestions.push(q);
        }
      }

      if (validQuestions.length < 8) {
        if (lvl.status !== "draft" || (lvl.questions && lvl.questions.length > 0)) {
          console.log(`[Quarantine] ${rel} -> Level ${lvl.id} ("${lvl.title}"): had ${questions.length} questions, only ${validQuestions.length} valid. Quarantining to "draft" (Coming soon)...`);
          lvl.status = "draft";
          lvl.questions = [];
          modified = true;
          quarantinedCount++;
        }
      } else {
        // Keep valid questions only
        if (validQuestions.length !== questions.length) {
          console.log(`[Cleaned] ${rel} -> Level ${lvl.id} ("${lvl.title}"): pruned ${questions.length - validQuestions.length} bad questions. Remaining valid: ${validQuestions.length}`);
          lvl.questions = validQuestions;
          lvl.status = "published";
          modified = true;
        }
      }
    }
  }

  if (modified) {
    fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), "utf-8");
    console.log(`Updated ${rel}`);
  }
}

console.log(`\nQuarantine complete. Total levels quarantined/reset: ${quarantinedCount}`);
