const fs = require("fs");
const path = require("path");

const SYLLABUS_DIR = path.resolve(__dirname, "../content/syllabus");

function evaluateFraction(str) {
  // Try to parse simple fraction or number like "1/2", "3/4", "-5/6", "4", "0.5"
  const trimmed = str.replace(/[$\s]/g, "");
  const fracMatch = trimmed.match(/^\\?frac\{(-?\d+)\}\{(-?\d+)\}$/) || trimmed.match(/^(-?\d+)\/(-?\d+)$/);
  if (fracMatch) {
    const num = Number(fracMatch[1]);
    const den = Number(fracMatch[2]);
    if (den !== 0) return num / den;
  }
  const num = Number(trimmed);
  if (!isNaN(num) && trimmed !== "") return num;
  return null;
}

function scan() {
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

  const results = [];

  for (const rel of files) {
    const fullPath = path.join(SYLLABUS_DIR, rel);
    if (!fs.existsSync(fullPath)) continue;

    const data = JSON.parse(fs.readFileSync(fullPath, "utf-8"));
    const subject = (data.subject || "").toLowerCase();
    const isMathOrScience = subject.includes("math") || subject.includes("sci") || subject.includes("phys") || subject.includes("chem");

    const fileReport = {
      file: rel,
      subject,
      levels: [],
    };

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
        const badQuestions = [];

        for (let i = 0; i < questions.length; i++) {
          const q = questions[i];
          const qErrors = [];
          const serialized = JSON.stringify(q);

          // 1. Control characters
          if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(serialized)) {
            qErrors.push("Contains unescaped control characters");
          }

          // 2. "rac", "imes", "ext", "qrt" corruptions
          if (/\brac\d+|\bimes\b|\bqrt\b|\bext\{/.test(serialized)) {
            qErrors.push("Contains corrupted LaTeX token (rac/imes/qrt/ext)");
          }

          // 3. LaTeX in non-maths/science
          if (!isMathOrScience) {
            if (/\$[^$]+\$|\\frac|\\sqrt|\\times|\\div/.test(serialized)) {
              qErrors.push("LaTeX used in non-math/science subject");
            }
          }

          // 4. Fractions / wrong kind of options in grammar / literature / history / etc.
          if (!isMathOrScience && Array.isArray(q.options)) {
            const hasMathFractions = q.options.some((opt) => /rac\d+|\\frac|\d+\/\d+/.test(String(opt)));
            if (hasMathFractions && (subject.includes("english") || subject.includes("hindi") || subject.includes("social"))) {
              qErrors.push("Mathematical fraction options in language/social studies question");
            }
          }

          // 5. Correct answer not in options
          if (Array.isArray(q.options) && q.correctAnswer !== undefined) {
            const match = q.options.some((opt) => String(opt).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase());
            if (!match) {
              qErrors.push(`correctAnswer "${q.correctAnswer}" not in options`);
            }
          }

          // 6. Duplicate or equivalent options
          if (Array.isArray(q.options)) {
            const seenStrings = new Set();
            let hasDup = false;
            for (const opt of q.options) {
              const str = String(opt).trim().toLowerCase();
              if (seenStrings.has(str)) {
                hasDup = true;
                break;
              }
              seenStrings.add(str);
            }
            if (hasDup) {
              qErrors.push("Duplicate options in option array");
            }

            // Check mathematical equivalence for math options
            if (isMathOrScience) {
              const numericVals = q.options.map(evaluateFraction).filter((v) => v !== null);
              if (numericVals.length === q.options.length) {
                const uniqueVals = new Set(numericVals.map((v) => v.toFixed(6)));
                if (uniqueVals.size < numericVals.length) {
                  qErrors.push("Mathematically equivalent options found");
                }
              }
            }
          }

          if (qErrors.length > 0) {
            badQuestions.push({
              index: i,
              id: q.id,
              prompt: q.prompt,
              errors: qErrors,
            });
          }
        }

        const validCount = questions.length - badQuestions.length;
        fileReport.levels.push({
          levelId: lvl.id,
          levelTitle: lvl.title,
          totalQuestions: questions.length,
          badCount: badQuestions.length,
          validCount,
          status: lvl.status || (questions.length >= 8 ? "published" : "draft"),
          badQuestions,
        });
      }
    }

    results.push(fileReport);
  }

  return results;
}

const res = scan();
fs.writeFileSync(path.resolve(__dirname, "../../detailed_scan_results.json"), JSON.stringify(res, null, 2), "utf-8");

console.log("=== SCAN REPORT SUMMARY ===");
let totalLevelsWithIssues = 0;
for (const f of res) {
  const badLevels = f.levels.filter((l) => l.badCount > 0);
  console.log(`\nFile: ${f.file} (${f.subject})`);
  console.log(`  Total levels: ${f.levels.length}, Levels with issues: ${badLevels.length}`);
  for (const bl of badLevels) {
    totalLevelsWithIssues++;
    console.log(`  - Level ${bl.levelId} ("${bl.levelTitle}"): ${bl.badCount}/${bl.totalQuestions} bad questions (Valid remaining: ${bl.validCount})`);
    for (const bq of bl.badQuestions) {
      console.log(`      * [${bq.id}] ${bq.errors.join(" | ")}`);
    }
  }
}
console.log(`\nTotal levels across all files with issues: ${totalLevelsWithIssues}`);
