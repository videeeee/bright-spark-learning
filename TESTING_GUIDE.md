
# Testing Guide - Full-Stack Implementation

## 🧪 Local Testing Setup

### Prerequisites
1. Backend running: `npm run dev` (or `nodemon server.js`)
2. Frontend running: `npm run dev`
3. MongoDB connection working
4. Gemini API key set in `.env`

### Environment Variables

**Backend (.env)**
```
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/dbname
GEMINI_API_KEY=your-gemini-key
JWT_SECRET=your-secret-key-at-least-32-chars
PORT=5000
```

**Frontend (.env.local)**
```
VITE_API_URL=http://localhost:5000
```

---

## 🧪 Test Scenarios

### Test 1: Signup New Account
1. Navigate to `http://localhost:5173/signup`
2. Fill in:
   - Name: "Test User"
   - Email: "test@example.com"
   - Password: "password123"
   - Confirm: "password123"
3. Click "Sign Up"
4. **Expected**: 
   - ✅ Toast success message
   - ✅ Token stored in localStorage
   - ✅ Redirected to dashboard

**Verify in DevTools Console:**
```javascript
localStorage.getItem("token")  // Should return token string
```

---

### Test 2: Login with Existing Account
1. Navigate to `http://localhost:5173/login`
2. Fill in:
   - Email: "test@example.com"
   - Password: "password123"
3. Click "Login"
4. **Expected**:
   - ✅ Toast success message
   - ✅ Token stored in localStorage
   - ✅ Redirected to dashboard

---

### Test 3: Try Accessing Dashboard Without Login
1. Clear localStorage: `localStorage.clear()`
2. Navigate to `http://localhost:5173/` (homepage)
3. **Expected**: 
   - ✅ Redirected to `/login`
   - ✅ Cannot access dashboard

---

### Test 4: Generate AI Notes
1. **Prerequisites**: Logged in, on Notes tab
2. Enter topic: "Photosynthesis"
3. Select style: "Ghibli Style"
4. Click "Generate Notes"
5. **Expected**:
   - ✅ Loading spinner appears
   - ✅ After ~3-5 seconds, notes appear
   - ✅ Note title and sections display
   - ✅ "View Notes" button shows count
   - ⚠️ If Gemini fails: Toast error message

**Backend Check:**
```bash
# In MongoDB, check notes were created:
db.notes.findOne({ userId: ObjectId("...") })
```

---

### Test 5: Fetch Notes from Database
1. Generate at least 2 different notes
2. Refresh the page (`F5`)
3. Navigate to Notes tab again
4. **Expected**:
   - ✅ Loading spinner briefly
   - ✅ All previously generated notes appear
   - ✅ Notes are loaded from backend, not localStorage

**Verify in Network Tab:**
```
GET /api/notes
Status: 200
Headers includes: Authorization: <token>
Response: Array of note objects
```

---

### Test 6: Delete Note
1. Generate a note and wait for it to appear
2. Click "Delete" button on that note
3. **Expected**:
   - ✅ Note removed from list immediately
   - ✅ Toast success message "Note deleted"
   - ✅ Deleted from database

**Verify:**
```javascript
// Open DevTools Network tab
// Click delete → see DELETE /api/notes/:id request
```

---

### Test 7: Download PDF
1. Generate or have an existing note
2. Click "PDF" button
3. **Expected**:
   - ✅ PDF file downloads
   - ✅ PDF contains note title and all sections
   - ✅ Toast "PDF downloaded" message

---

### Test 8: Download PowerPoint
1. Generate or have an existing note
2. Click "PPT" button
3. **Expected**:
   - ✅ PPTX file downloads
   - ✅ Each section on separate slide
   - ✅ Toast "PowerPoint downloaded" message

---

### Test 9: View Stats Dashboard
1. Click "Stats" in sidebar
2. **Expected**:
   - ✅ Total notes count displays
   - ✅ Recent notes list shows
   - ✅ Loading spinner while fetching

**Network Check:**
```
GET /api/stats
Status: 200
Headers: Authorization header present
Response: { totalNotes: X, recentNotes: [...] }
```

---

### Test 10: View Home Dashboard
1. Click "Home" in sidebar
2. **Expected**:
   - ✅ Welcome message with user name
   - ✅ Notes count displays
   - ✅ Recent notes preview shows

---

## 🔍 API Testing with Postman/cURL

### Signup
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@test.com",
    "password": "password123"
  }'

# Expected Response:
{
  "msg": "User created",
  "token": "eyJhbGc...",
  "user": { "id": "...", "name": "Test User", "email": "test@test.com" }
}
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "password123"
  }'

# Copy token from response for next requests
```

### Generate Note
```bash
curl -X POST http://localhost:5000/api/notes \
  -H "Content-Type: application/json" \
  -H "Authorization: <your-token>" \
  -d '{
    "topic": "Photosynthesis",
    "style": "ghibli"
  }'

# Expected: Note object with title and sections
```

### Fetch Notes
```bash
curl -X GET http://localhost:5000/api/notes \
  -H "Authorization: <your-token>"

# Expected: Array of note objects
```

### Fetch Stats
```bash
curl -X GET http://localhost:5000/api/stats \
  -H "Authorization: <your-token>"

# Expected: { totalNotes: X, recentNotes: [...] }
```

### Delete Note
```bash
curl -X DELETE http://localhost:5000/api/notes/<note-id> \
  -H "Authorization: <your-token>"

# Expected: { msg: "Note deleted" }
```

---

## 🐛 Common Issues & Fixes

### Issue: "No token" error when creating notes
**Solution:**
- Check localStorage has token after login: `localStorage.getItem("token")`
- Verify Authorization header is being sent
- Check network tab to confirm header is present

### Issue: CORS errors
**Solution:**
- Verify `app.use(cors())` is in server.js BEFORE routes
- Check VITE_API_URL matches backend URL
- Check if backend port is correct

### Issue: Gemini API returns error
**Solution:**
- Verify GEMINI_API_KEY is set in .env
- Check API quota hasn't been exceeded
- Try with simpler topic first
- Check network requests in backend logs

### Issue: Notes don't persist after refresh
**Solution:**
- Check MongoDB connection
- Verify notes are being saved to DB (check in MongoDB)
- Check userId is properly set
- Verify Authorization header is sent in GET request

### Issue: Can't login with correct credentials
**Solution:**
- Check backend error logs
- Verify user exists in MongoDB
- Check password hashing (bcrypt)
- Verify JWT_SECRET is set

---

## ✅ Acceptance Criteria

- [x] User can sign up with email/password
- [x] User can login and receive JWT token
- [x] User cannot access dashboard without token
- [x] User can generate AI notes
- [x] Generated notes are saved to database
- [x] User can only see their own notes
- [x] User can delete their notes
- [x] User can download notes as PDF
- [x] User can download notes as PowerPoint
- [x] Stats page shows total and recent notes
- [x] Dashboard shows user name and note count
- [x] All API calls include Authorization header
- [x] Error handling with toast notifications
- [x] Loading states on all async operations
- [x] Mobile responsive design

---

## 📊 Database Verification

### Check Users Collection
```javascript
// MongoDB
db.users.find().pretty()

// Expected: Documents with name, email, hashed password
```

### Check Notes Collection
```javascript
// MongoDB
db.notes.find({ userId: ObjectId("...") }).pretty()

// Expected: Documents with userId, topic, title, content, createdAt
```

### Check Total Notes Count
```javascript
// MongoDB
db.notes.countDocuments({ userId: ObjectId("...") })
```

---

## 🚀 Performance Notes

- Note generation takes ~3-5 seconds (Gemini API)
- Initial notes fetch: <500ms
- Stats fetch: <200ms
- Note deletion: <300ms

If slower:
1. Check network speed
2. Check MongoDB indexes
3. Check Gemini API quotas
4. Monitor backend memory usage

---

## 📝 Test Log Template

Date: _______________
Tester: _______________

| Test # | Scenario | Status | Notes |
|--------|----------|--------|-------|
| 1 | Signup | ☐ Pass ☐ Fail | |
| 2 | Login | ☐ Pass ☐ Fail | |
| 3 | Protected Route | ☐ Pass ☐ Fail | |
| 4 | Generate Notes | ☐ Pass ☐ Fail | |
| 5 | Fetch Notes | ☐ Pass ☐ Fail | |
| 6 | Delete Note | ☐ Pass ☐ Fail | |
| 7 | Download PDF | ☐ Pass ☐ Fail | |
| 8 | Download PPT | ☐ Pass ☐ Fail | |
| 9 | Stats Page | ☐ Pass ☐ Fail | |
| 10 | Home Dashboard | ☐ Pass ☐ Fail | |

---

**All tests should pass before production deployment!**
