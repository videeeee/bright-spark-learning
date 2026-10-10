# Stage 1 Pre-Launch & Go-Live Checklist

## 1. Summary of Changes in Track 1 (`release/dynamic-content`)
- **Dynamic Academic Profiles**: Users can select educational Board (ICSE, CBSE, State), Class (6-12), and compulsory/elective subjects via `/api/curriculum/catalog` and `/setup`.
- **Server-Side Grading & Anti-Cheat**: Quiz correct answers are completely stripped from frontend responses. Answer grading, stars, streak updates, mistake logging, and XP calculations occur entirely server-side (`POST /api/curriculum/level/:levelId/grade`).
- **Real Syllabus Roadmaps**: Dynamic curriculum units, chapters, concept lessons, worked examples, and multi-tier questions for:
  - **ICSE Class 9**: Mathematics, Science (Physics, Chemistry, Biology), Computer Applications (Java OOP), English Language, Hindi (Vyakaran & Sahitya Sagar), Social Studies (Civics, History, Geography).
  - **CBSE Class 9**: Mathematics, Science.
- **Resilient Offline Architecture**: Vitest suite and development run smoothly without database lockups; local JSON fallbacks ensure high availability.
- **Cohort Leaderboards**: Leaderboard queries prioritize matching cohort (`curriculum` + `classLevel`), falling back to general cohort if less than 2 learners are enrolled.

---

## 2. Automated Test & Build Verification
| Verification Step | Command | Status | Result |
| :--- | :--- | :--- | :--- |
| **Backend Vitest Suite** | `npm run test` (in `backend/`) | **PASS** | 17 passed across 2 test files (curriculum & progress) |
| **Frontend ESLint** | `npm run lint` | **PASS** | 0 errors |
| **Frontend Production Build** | `npm run build` | **PASS** | Vite production bundle built in 10s |
| **Staging DB Seeding** | `node backend/scripts/seed-curriculum.js` | **PASS** | 8 syllabi upserted into `learnquest_staging` |

---

## 3. Environment Variables Audit
### Backend (Render)
Ensure the following variables are set on Render:
- `MONGO_URI`: The MongoDB Atlas connection string (pointing to `test` in production).
- `JWT_SECRET`: Secure JWT encryption key.
- `PORT`: `5000` (or dynamic default provided by Render).
- `CLIENT_URL`: `https://learnquest-mu.vercel.app,http://localhost:5173,http://localhost:3000` *(Plus any branch preview URLs you wish to test, comma-separated)*.
- `NODE_ENV`: `production`

### Frontend (Vercel)
Ensure the following variables are set on Vercel:
- `VITE_API_URL`: Your live Render backend URL (e.g. `https://bright-spark-learning.onrender.com` without trailing slash).

---

## 4. Production Release & Merge Steps (For User Execution when Ready)
1. **Tag current main branch** (instant rollback safety):
   ```bash
   git checkout main
   git pull origin main
   git tag v-before-dynamic-content
   git push origin v-before-dynamic-content
   ```
2. **Merge `release/dynamic-content` into `main`**:
   ```bash
   git merge release/dynamic-content
   git push origin main
   ```
3. **Seed Production DB Idempotently**:
   Run the seeder with the production MongoDB connection string:
   ```bash
   node backend/scripts/seed-curriculum.js
   ```
   *(This uses `findOneAndUpdate` with `{ upsert: true }`, ensuring existing users, progress, and collections are never deleted or corrupted).*

---

## 5. Instant Rollback Procedure
If any unexpected issue occurs in production:
1. Revert to the tagged commit:
   ```bash
   git checkout main
   git reset --hard v-before-dynamic-content
   git push origin main --force
   ```
2. Vercel and Render will automatically rebuild and deploy the prior stable release.
