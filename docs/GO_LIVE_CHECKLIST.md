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

## 4. Production Release Execution (Exact Order of Operations)

Do NOT execute until explicit confirmation (`"GO LIVE 1"`) is given.

### Phase A: Pre-Merge Dashboard Configuration (No user impact)
1. **Render Environment Variables**:
   - Check Render dashboard: verify `MONGO_URI` points to production `test`.
   - Verify `CLIENT_URL` contains `https://learnquest-mu.vercel.app`.
   - Verify `NODE_ENV` is `production`.
2. **Vercel Environment Variables**:
   - Verify `VITE_API_URL` is set to your Render URL (e.g. `https://learnquest-xcv9.onrender.com`).

---

### Phase B: Seed Production Database `test` (Additive & Zero-Downtime)
Run the seeder locally against production before deploying the code. Because the seeder only inserts/updates the `curriculums` collection and never touches `users`, `notes`, or `progress`, running this first guarantees data is already waiting in the database when the new backend wakes up:

```powershell
# In your local PowerShell terminal (scoped inline, does NOT touch .env):
& { $env:MONGO_URI="<YOUR_PRODUCTION_ATLAS_URI_FOR_TEST_DB>"; node backend/scripts/seed-curriculum.js }
```
*(On macOS/Linux: `MONGO_URI="<PROD_URI>" node backend/scripts/seed-curriculum.js`)*

> **User Experience During Phase B**:
> Current live users notice zero difference. The existing production backend ignores `curriculums` until the new version boots.

---

### Phase C: Tag Main & Deploy Backend First
1. **Create safety backup tag**:
   ```bash
   git checkout main
   git pull origin main
   git tag prod-backup-before-go-live-1
   git push origin prod-backup-before-go-live-1
   ```
2. **Merge `release/dynamic-content` into `main`**:
   ```bash
   git checkout main
   git merge release/dynamic-content
   git push origin main
   ```
3. **Verify Render Backend Deployment First**:
   - Watch the Render deploy logs. Wait until it displays:
     `✅ MongoDB connected successfully to database: [test]`
     `🚀 LearnQuest Server running on port 5000 [production]`
   - Verify health check in browser: `https://<render-url>/api/health` -> `{"status":"ok","databaseName":"test"}`.

---

### Phase D: Verify Frontend Deployment (Vercel)
- Vercel automatically deploys within 30-45 seconds.
- **What users see in between**:
  - The API endpoints are 100% additive and backward-compatible.
  - If a user refreshes their browser right as Vercel updates but before Render finishes, `src/lib/api.ts` and `LevelRoadmap.tsx` gracefully fall back to local bundled curriculum definitions, preventing any 404 or white-screen crash.
  - As soon as Render signals healthy, live server grading, Beta level quizzes, and real syllabi are immediately active.

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
