const fs = require("fs");
const path = require("path");
const dns = require("dns");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Fix DNS SRV lookup on Windows
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
  // Ignore fallback error
}

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI is not set in backend/.env");
  process.exit(1);
}

const Curriculum = require("../models/Curriculum");
const SYLLABUS_DIR = path.resolve(__dirname, "../content/syllabus");

async function seedCurriculums() {
  console.log("🌱 Starting Curriculum Seeder...");
  
  await mongoose.connect(MONGO_URI);
  console.log(`Connected to database: ${mongoose.connection.name}`);

  if (!fs.existsSync(SYLLABUS_DIR)) {
    console.error(`❌ Syllabus directory not found: ${SYLLABUS_DIR}`);
    process.exit(1);
  }

  const boards = fs.readdirSync(SYLLABUS_DIR).filter((f) => fs.statSync(path.join(SYLLABUS_DIR, f)).isDirectory());

  let totalUpserted = 0;

  for (const board of boards) {
    const boardDir = path.join(SYLLABUS_DIR, board);
    const classes = fs.readdirSync(boardDir).filter((f) => fs.statSync(path.join(boardDir, f)).isDirectory());

    for (const classLevel of classes) {
      const classDir = path.join(boardDir, classLevel);
      const subjectFiles = fs.readdirSync(classDir).filter((f) => f.endsWith(".json"));

      for (const subjectFile of subjectFiles) {
        const filePath = path.join(classDir, subjectFile);
        try {
          const raw = fs.readFileSync(filePath, "utf-8");
          const data = JSON.parse(raw);

          if (!data.board || !data.classLevel || !data.subject || !data.units) {
            console.warn(`⚠️ Skipping invalid file structure: ${filePath}`);
            continue;
          }

          // Idempotent upsert matching board, classLevel, subject
          const result = await Curriculum.findOneAndUpdate(
            {
              board: new RegExp(`^${data.board}$`, "i"),
              classLevel: String(data.classLevel),
              subject: new RegExp(`^${data.subject}$`, "i")
            },
            {
              $set: {
                board: data.board.toUpperCase(),
                classLevel: String(data.classLevel),
                subject: data.subject,
                officialSyllabusCode: data.officialSyllabusCode || "",
                year: data.year || "2024-2025",
                units: data.units
              }
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );

          totalUpserted++;
          console.log(`✅ Upserted curriculum: ${result.board} Class ${result.classLevel} - ${result.subject} (${result.units.length} units)`);
        } catch (err) {
          console.error(`❌ Failed processing ${filePath}:`, err.message);
        }
      }
    }
  }

  console.log(`\n🎉 Curriculum Seeding Complete! Total records upserted: ${totalUpserted}`);
  await mongoose.disconnect();
}

seedCurriculums().catch((err) => {
  console.error("Seeding error:", err);
  process.exit(1);
});
