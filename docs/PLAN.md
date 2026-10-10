# Dynamic Curriculum & Full Coverage Architecture Plan

1. Discovery: User profile stores `curriculum` (board string), `classLevel` (class string), and `subjects` (string array) in MongoDB User collection.
2. Architecture: Transition from hardcoded frontend arrays to dynamic `/api/curriculum/catalog` providing Boards -> Classes -> Subjects with status flags ("live", "partial", "coming-soon").
3. Backward Compatibility: Existing user records (e.g. ICSE Class 9) keep intact subject assignments, progress, and activity logs.
4. Data Models: Introduce Curriculum, Unit, Chapter, and Topic models referencing official syllabi, decoupled from static hardcoding.
5. Syllabus Ingestion: Structured JSON schemas per Board/Class/Subject in `backend/content/syllabus/` capturing real units, chapters, and subtopics.
6. Learning Engine: Server-side quiz generation with randomized question sets, server-only grading, anti-cheat, stars, and deterministic XP.
7. Frontend Roadmap: Dynamic Subject Roadmap displaying verified syllabus chapters, difficulty badges, and clean "lessons being prepared" states.
8. Safety Guardrails: All dev and test traffic operates strictly against `learnquest_staging`; production Atlas `test` remains untouched until Stage 1 GO LIVE.
9. Resumable Generator: Multi-provider LLM pipeline (Gemini, Groq, OpenRouter) with Zod validation, rate-limiting, and independent dual-pass verification.
10. Execution Order: Complete Track 1 (Catalog, Syllabus Ingestion, Learning Engine, Frontend, Tests, Verification) -> Stage 1 GO LIVE -> Track 2 Content Pipeline.
