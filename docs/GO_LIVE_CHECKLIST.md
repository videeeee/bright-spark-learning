# LearnQuest — GO LIVE 1 Deployment & Release Checklist

This document details the exact, tested operational steps to promote the `release/dynamic-content` branch to production.

---

## 1. Safety Audit & Hygiene Confirmations

Before any release, verify all safety guardrails are intact:

| Hygiene Check | Verification Result | Details |
| :--- | :--- | :--- |
| **Branch Isolation** | Verified | All work performed strictly on `release/dynamic-content`. Zero unapproved pushes to `main`. |
| **No Committed Secrets** | Verified | No API keys (Gemini, Groq, OpenRouter, Atlas) exist in committed source code. |
| **No Committed `.env`** | Verified | `.env` files in both root and `backend/` are strictly excluded by `.gitignore` and untracked. |
| **DNS Resolver Isolation** | Verified | `backend/config/db.js` only sets custom DNS when `$env:ENABLE_CUSTOM_DNS="true"` is explicitly passed in Windows development; defaults to standard Node.js OS resolver for Render/Linux production. |
| **Reverse Proxy Hygiene** | Verified | `app.set("trust proxy", 1)` is enabled in `backend/server.js` for accurate rate limiting and secure headers behind Render. |
| **CORS Strict Whitelist** | Verified | Exact origins allowed in `CLIENT_URL` (no wildcards `*`), with local dev origins supported. |
| **Frontend API Safety** | Verified | `src/lib/api.ts` validates `VITE_API_URL`; halts with explicit user-facing error if missing or `"undefined"` rather than constructing broken requests. |
| **Backward Compatibility** | Verified | Additive schema changes only. Existing users, notes, progress, and activity logs remain 100% intact. |

---

## 2. Environment Variables Configuration

### A. Render (Backend Production Service)
In the **Render Dashboard** -> Your Web Service -> **Environment**:

| Key | Example / Exact Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production mode and optimizations. |
| `PORT` | `5000` | Port for Express server (or dynamic port assigned by Render). |
| `MONGO_URI` | `mongodb+srv://...` | Connection URI pointing to the **`test`** production database. |
| `JWT_SECRET` | *(Existing production secret)* | Secure secret for JWT token signing. |
| `CLIENT_URL` | `https://learnquest-mu.vercel.app,http://localhost:5173,http://localhost:3000` | Comma-separated list of allowed frontend origins (no wildcards). |

### B. Vercel (Frontend Production Project)
In the **Vercel Dashboard** -> Project Settings -> **Environment Variables**:

| Key | Value | Description |
| :--- | :--- | :--- |
| `VITE_API_URL` | `https://learnquest-xcv9.onrender.com` *(or your actual Render backend service URL)* | Must NOT contain a trailing slash. Must NEVER be undefined. |

---

## 3. Pre-Flight Quality Gate (Local Staging)

Every check has passed before release:
1. **Backend Test Suite**:
   ```bash
   cd backend && npm run test
   ```
   *Result*: **17 / 17 tests passed** (Curriculum catalog & levels, server-side grading, anti-cheat, progress calculations).
2. **Frontend Linter**:
   ```bash
   npm run lint
   ```
   *Result*: **0 errors**.
3. **Frontend Production Build**:
   ```bash
   npm run build
   ```
   *Result*: **Passed in ~12s**. KaTeX mathematical formula rendering assets bundled correctly.
4. **Staging Database Verification**:
   All 8 syllabi seeded into `learnquest_staging` with verified, playable content across ICSE Class 9 subjects (Mathematics, Science, Computer Applications, English, Hindi, Social Studies).

---

## 4. Production Release Execution (Order of Operations)

Do NOT execute until explicit confirmation (`"GO LIVE 1"`) is given.

### Step 1: Create a Safety Rollback Tag on Production Main
```bash
git checkout main
git pull origin main
git tag prod-backup-before-go-live-1
git push origin prod-backup-before-go-live-1
```

### Step 2: Merge `release/dynamic-content` into `main`
```bash
git checkout main
git merge release/dynamic-content
git push origin main
```
*Vercel and Render will automatically detect the push to `main` and trigger production builds.*

### Step 3: Run Additive & Idempotent Production Seeder
Once the Render backend deployment succeeds, run the seeder pointing to the production database **`test`**:

```bash
# In your local PowerShell terminal with MONGO_URI set to production "test":
$env:MONGO_URI="<YOUR_PRODUCTION_ATLAS_URI_FOR_TEST_DB>"
node backend/scripts/seed-curriculum.js
```

> **Safety Guarantee**:
> `seed-curriculum.js` uses Mongoose `findOneAndUpdate` with `{ upsert: true }` keyed strictly on `{ board, classLevel, subject }`.
> - **Only** touches the `curriculums` collection.
> - **Never** drops or alters `users`, `notes`, `progresses`, `userstats`, `activitylogs`, `levelattempts`, or `leaderboardsnapshots`.
> - Safe to re-run at any time.

---

## 5. Live Production Smoke Test Checklist

Once deployed to production (`https://learnquest-mu.vercel.app`):
1. **Health Check**: Open `https://<render-url>/api/health` -> verify returns `{"status":"ok"}`.
2. **Catalog API**: Open `https://<render-url>/api/curriculum/catalog` -> verify returns 200 with CBSE & ICSE subjects.
3. **Login / Retain Data**: Log into an existing account (e.g. ICSE Class 9 learner) -> confirm streak, XP, and profile intact.
4. **Learn Roadmap**:
   - Navigate to `/learn`.
   - Verify playable levels show **"Beta"** badge.
   - Verify unpopulated levels show **"Coming Soon"** badge with real chapter outlines.
5. **Interactive Quiz & Anti-Cheat**:
   - Launch Level 1 of Mathematics, Science, or Computer Applications.
   - Review lesson notes and worked examples.
   - Take the 12-question quiz -> verify answers are evaluated server-side.
   - Confirm completion awards stars and XP seamlessly.
6. **Cross-Tab Consistency**:
   - Confirm streak and XP update identically on Home (`/`), Sidebar, Stats (`/stats`), and Leaders (`/leaderboard`).

---

## 6. Instant Rollback Procedure

If any unexpected regression occurs on the live deployment:
1. **Revert `main` to the safety rollback tag**:
   ```bash
   git checkout main
   git reset --hard prod-backup-before-go-live-1
   git push origin main --force
   ```
2. Render and Vercel will immediately redeploy the prior stable commit.
3. Because production database writes were additive only (updating `curriculums`), no user data rollback is needed.
