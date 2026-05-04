<!-- Curriculum Setup System Implementation Guide -->

## Added Components

### Frontend Files

1. **`src/lib/subjectMapping.ts`** - Subject mapping utility
   - Defines class levels (8-12) and curricula (CBSE, ICSE, State)
   - Maps each class + curriculum combination to subjects
   - Exported `getSubjects()` function for use in components

2. **`src/pages/auth/SetupProfile.tsx`** - Profile setup page
   - Shows class level selector (8-12)
   - Shows curriculum selector (CBSE, ICSE, State)
   - Displays selected subjects as badges
   - Submits to `/api/auth/profile-setup` endpoint
   - Navigates to dashboard on success

### Backend Files

1. **`backend/models/User.js`** - Extended User schema
   - Added `classLevel` (String, optional)
   - Added `curriculum` (String, optional)
   - Added `subjects` (Array of Strings, default: [])
   - Fully backward compatible with existing users

2. **`backend/routes/auth.routes.js`** - Added profile setup endpoint
   - New `PUT /api/auth/profile-setup` (protected)
   - Validates classLevel, curriculum, and subjects
   - Updates user document with new fields
   - Returns updated user object

3. **`backend/utils/subjectMapping.js`** - Subject mapping (server-side)
   - Shared subject data for backend use
   - `getSubjects()` function available for API endpoints

### Modified Frontend Files

1. **`src/App.tsx`**
   - Added import for SetupProfile component
   - Added `/setup` route (protected) between auth and dashboard routes
   - Route placed BEFORE dashboard (`/`) so profile setup is encountered first after login

2. **`src/components/ProtectedRoute.tsx`**
   - Enhanced to check profile completion status
   - Calls `GET /api/auth/me` to fetch user data
   - If accessed on `/` and user has no `classLevel`, redirects to `/setup`
   - Loading state while checking profile
   - Maintains backward compatibility with existing protected routes

## User Flow

1. **Signup/Login** → User gets JWT token, stored in localStorage
2. **Access Dashboard** → ProtectedRoute checks if `classLevel` is set
3. **If classLevel missing** → Redirected to `/setup`
4. **Profile Setup Form** → User selects class and curriculum
5. **Submit** → PUT to `/api/auth/profile-setup` updates user
6. **Success** → Redirected to dashboard (`/`)
7. **Future visits** → Dashboard access granted (profile already setup)

## API Endpoints

### Existing (Unchanged)
- `POST /api/auth/signup` - Returns token + user data
- `POST /api/auth/login` - Returns token + user data
- `GET /api/auth/me` (protected) - Returns full user object including new fields

### New
- `PUT /api/auth/profile-setup` (protected) - Saves class/curriculum/subjects

## Database Changes

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String,
  classLevel: String (NEW - optional),
  curriculum: String (NEW - optional),
  subjects: [String] (NEW - default: []),
  createdAt: Date,
  updatedAt: Date
}
```

## Backward Compatibility

- ✅ Existing users unaffected (new fields optional with defaults)
- ✅ GET /me still works (returns new fields if set)
- ✅ No API URL changes
- ✅ No deployment config changes
- ✅ All existing routes continue to work as-is

## Testing Checklist

- [ ] Build succeeds: `npm run build` ✅
- [ ] Frontend signup/login works
- [ ] After login, redirects to `/setup` if no classLevel
- [ ] Profile setup form displays correctly
- [ ] Subject selection works
- [ ] Submitting profile setup saves to database
- [ ] Redirects to dashboard after setup
- [ ] Dashboard accessible after profile setup
- [ ] Can update profile by visiting `/setup` again

## Future Enhancements

Could add later without breaking changes:
- Subject selection UI (currently auto-generated)
- Profile update page (edit class/curriculum)
- Dashboard features using selected subjects
- Learning path generation based on curriculum
- Content filtering by selected subjects
