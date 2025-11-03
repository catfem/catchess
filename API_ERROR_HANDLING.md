# API Error Handling & Integration Guide

## Overview

This document explains how the chess opening API integration works and how it handles errors, particularly the "Unexpected token '<'" JSON parse error.

## Problem: HTML Response Instead of JSON

### Symptom
```
API fetch error: SyntaxError: Unexpected token '<', "<!doctype "... is not valid JSON
```

### Root Cause
This error occurs when:
1. The backend server is not running
2. The API endpoint URL is incorrect
3. The server returns an HTML error page (404, 500, etc.) instead of JSON
4. There's a CORS or network issue causing a redirect to an error page

## Solution Implemented

### 1. Content-Type Validation

All API methods now check the `Content-Type` header before attempting to parse JSON:

```typescript
// Check if the response is JSON before parsing
const contentType = response.headers.get('content-type');
if (!contentType || !contentType.includes('application/json')) {
  const text = await response.text();
  console.error('API returned non-JSON response:', text.substring(0, 200));
  console.error('Request URL was:', url);
  throw new Error('API returned non-JSON response (possibly HTML error page)');
}
```

**Benefits:**
- Prevents JSON.parse() errors on HTML content
- Provides clear error messages with the actual response content
- Logs the problematic URL for debugging

### 2. Dynamic API Base URL Resolution

The API base URL is now determined dynamically instead of at module load time:

```typescript
const getAPIBase = () => {
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    
    // Development environment
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3001';
    }
    
    // Production environment with env variable
    if (import.meta.env.VITE_API_BASE_URL) {
      return import.meta.env.VITE_API_BASE_URL;
    }
    
    // Default: same host, port 3001
    return `${window.location.protocol}//${hostname}:3001`;
  }
  
  // Fallback for SSR
  return 'http://localhost:3001';
};
```

**Benefits:**
- Works correctly in SSR environments
- Supports custom backend URLs via environment variables
- Automatically adapts to development vs production

### 3. Enhanced Error Logging

Added debug logging to track API requests:

```typescript
console.log('Fetching from API:', url); // Debug log
```

This helps identify:
- Incorrect URLs being constructed
- Timing issues (when backend isn't ready)
- Environment-specific problems

## API Endpoints

### Backend Server (Port 3001)

All endpoints return JSON with `Content-Type: application/json; charset=utf-8`

#### Health Check
```
GET /health
Response: {"status":"ok","message":"CatChess Backend API"}
```

#### Search Openings
```
GET /api/openings/search?q={query}
Response: OpeningData[]
```

#### Get by Name
```
GET /api/openings/by-name/{name}
Response: OpeningData | 404
```

#### Get by ECO Code
```
GET /api/openings/by-eco/{eco}
Response: OpeningData | 404
```

#### List Openings
```
GET /api/openings/list?limit={limit}&offset={offset}&category={category}
Response: OpeningData[]
```

#### Get Categories
```
GET /api/openings/categories
Response: string[]
```

## Configuration

### Environment Variables

Create a `.env` file in the frontend directory:

```bash
# Custom backend URL (optional)
VITE_API_BASE_URL=http://localhost:3001

# Or for production
VITE_API_BASE_URL=https://api.your-domain.com
```

### Development Setup

1. Start the backend server:
```bash
cd backend
npm run dev
# Server runs on http://localhost:3001
```

2. Start the frontend:
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

3. The frontend will automatically connect to `http://localhost:3001`

### Production Setup

The backend and frontend can run on:
- Same server, different ports (backend on 3001, frontend on 80/443)
- Different servers (configure VITE_API_BASE_URL)
- Behind a reverse proxy (configure proxy rules)

## Error Scenarios & Handling

### Scenario 1: Backend Not Running

**Symptom:**
```
Failed to fetch
net::ERR_CONNECTION_REFUSED
```

**Solution:**
- Start the backend server: `cd backend && npm run dev`
- Check if port 3001 is available
- Verify no firewall blocking

### Scenario 2: Wrong API URL

**Symptom:**
```
API returned non-JSON response: <!DOCTYPE html>...
```

**Solution:**
- Check console for "Fetching from API:" log
- Verify the URL is correct
- Update VITE_API_BASE_URL if needed

### Scenario 3: CORS Issues

**Symptom:**
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```

**Solution:**
- Backend already has CORS enabled with `app.use(cors())`
- If issues persist, check specific CORS origin settings

### Scenario 4: Network Errors

**Symptom:**
```
TypeError: Failed to fetch
```

**Solution:**
- Check internet connection
- Verify DNS resolution
- Check proxy settings

## Database Population

The backend automatically populates the database on first run:

```bash
cd backend
rm chess_openings.db  # Optional: reset database
node src/index.js
```

Output:
```
Loading ECO database from: .../eco_interpolated.json
Processing 1383 unique openings...
✓ Inserted 1378 openings into database
✓ Database initialized with 1378 openings
🚀 CatChess Backend running on port 3001
```

To manually repopulate:
```bash
cd backend
node scripts/populate_eco_database.js
```

## Verification

Run the verification script:
```bash
cd backend
node scripts/verify_database.js
```

Expected output:
```
✅ Database verification PASSED!
   - 1378 openings loaded
   - All entries have complete data
   - Multiple categories properly assigned
```

## API Testing

### Using curl

```bash
# Health check
curl http://localhost:3001/health

# Search
curl "http://localhost:3001/api/openings/search?q=sicilian"

# List categories
curl http://localhost:3001/api/openings/categories

# Get specific opening
curl "http://localhost:3001/api/openings/by-name/Sicilian%20Defense"
```

### Using Browser DevTools

1. Open DevTools (F12)
2. Go to Network tab
3. Interact with the app
4. Check XHR/Fetch requests
5. Verify:
   - Status: 200 OK
   - Content-Type: application/json
   - Response body is valid JSON

## Debugging Checklist

When encountering API errors:

1. ✅ Is the backend running? `ps aux | grep node`
2. ✅ Can you reach health endpoint? `curl http://localhost:3001/health`
3. ✅ Check browser console for "Fetching from API:" logs
4. ✅ Check Network tab for actual request URL
5. ✅ Verify response Content-Type header
6. ✅ Check backend logs: `tail -f /tmp/backend.log`
7. ✅ Verify database has data: `node scripts/verify_database.js`
8. ✅ Check CORS headers in response

## Best Practices

### For Development
- Always start backend before frontend
- Use console logs to track API calls
- Check Network tab for actual requests
- Keep backend logs visible

### For Production
- Set VITE_API_BASE_URL environment variable
- Use process manager (PM2) for backend
- Configure reverse proxy (nginx) for routing
- Monitor API response times
- Set up error tracking (Sentry, etc.)

### For Testing
- Mock API responses in tests
- Use test database for backend tests
- Test error scenarios (network failures, etc.)
- Verify JSON schemas

## Summary

The API error handling implementation:
- ✅ Validates Content-Type before parsing JSON
- ✅ Provides detailed error messages
- ✅ Logs problematic URLs
- ✅ Handles all error scenarios gracefully
- ✅ Works in development and production
- ✅ Supports custom backend URLs
- ✅ Compatible with SSR

This ensures the frontend never crashes on unexpected HTML responses and provides clear debugging information when issues occur.
