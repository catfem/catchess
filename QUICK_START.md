# Quick Start Guide - ECO Database & API

## Prerequisites
- Node.js installed
- Git repository cloned
- Terminal/Command line access

## Starting the Application

### 1. Start Backend Server (Required First!)

```bash
cd backend
npm install  # If first time
npm run dev  # Or: node src/index.js
```

**Expected Output:**
```
✓ Database initialized with 1378 openings
🚀 CatChess Backend running on port 3001
```

The backend will:
- Automatically create `chess_openings.db` on first run
- Load all 1,378 ECO openings from `frontend/public/eco_interpolated.json`
- Categorize and add descriptions to each opening
- Start API server on http://localhost:3001

### 2. Start Frontend (In New Terminal)

```bash
cd frontend
npm install  # If first time
npm run dev
```

The frontend will start on http://localhost:5173 and automatically connect to the backend API.

## Verification

### Check Backend Health
```bash
curl http://localhost:3001/health
```

Expected: `{"status":"ok","message":"CatChess Backend API"}`

### Check Database
```bash
cd backend
node scripts/verify_database.js
```

Expected:
```
✅ Database verification PASSED!
   - 1378 openings loaded
   - All entries have complete data
```

### Test API Endpoints
```bash
# Search for Sicilian openings
curl "http://localhost:3001/api/openings/search?q=sicilian"

# Get all categories
curl http://localhost:3001/api/openings/categories

# List first 5 openings
curl "http://localhost:3001/api/openings/list?limit=5"
```

## Common Issues

### Issue: "Connection Refused" Error
**Cause:** Backend not running  
**Solution:** Start backend first with `cd backend && npm run dev`

### Issue: "<!doctype html>" Parse Error
**Cause:** Frontend trying to connect to wrong URL or backend not ready  
**Solution:** 
1. Verify backend is running on port 3001
2. Check browser console for "Request URL was:" log
3. Wait a few seconds for backend to fully start

### Issue: Database Empty
**Cause:** ECO JSON file not found  
**Solution:** 
1. Verify `frontend/public/eco_interpolated.json` exists
2. Manually populate: `cd backend && node scripts/populate_eco_database.js`

### Issue: Port 3001 Already in Use
**Solution:**
```bash
# Find process using port 3001
lsof -i :3001
# Kill it
kill -9 <PID>
# Or use different port (update VITE_API_BASE_URL)
```

## Environment Configuration (Optional)

Create `frontend/.env`:
```bash
# Custom backend URL (if not using default)
VITE_API_BASE_URL=http://localhost:3001
```

## Development Workflow

1. **Make Backend Changes:**
   - Edit files in `backend/src/`
   - Restart backend: `Ctrl+C` then `npm run dev`

2. **Make Frontend Changes:**
   - Edit files in `frontend/src/`
   - Vite will auto-reload

3. **Reset Database:**
   ```bash
   cd backend
   rm chess_openings.db
   node src/index.js
   ```

4. **Verify Changes:**
   ```bash
   cd backend
   node scripts/verify_database.js
   ```

## What's Inside

### Backend (Port 3001)
- SQLite database with 1,378 chess openings
- RESTful API with 5 endpoints
- Auto-population from ECO JSON
- CORS enabled for development

### Frontend
- React + TypeScript + Vite
- Opening API client with error handling
- Content-Type validation
- Dynamic URL resolution

### Database Categories (21 total)
- 234 Gambits
- 156 Sicilian Defense variations
- 137 Queen's Gambit variations
- 89 Indian Defense variations
- And 17 more categories...

## Next Steps

1. ✅ Backend running on port 3001
2. ✅ Frontend running on port 5173
3. ✅ Database populated with 1,378 openings
4. ✅ API working correctly

Now you can:
- Search for chess openings
- Browse by category
- View opening details
- Integrate with chess analysis

## Documentation

- [`ECO_DATABASE_IMPLEMENTATION.md`](./ECO_DATABASE_IMPLEMENTATION.md) - Full implementation details
- [`API_ERROR_HANDLING.md`](./API_ERROR_HANDLING.md) - Error handling guide
- Backend API: http://localhost:3001/health
- Frontend Dev: http://localhost:5173

## Support

If you encounter issues:
1. Check backend logs
2. Check browser console
3. Check Network tab in DevTools
4. Verify port 3001 is available
5. Run verification script
