# 📜 NPM Scripts Reference

Complete guide to all available npm scripts in the CatChess project.

## Root Scripts (from project root)

### Development

```bash
npm run install:all
```
Installs all dependencies for root, frontend, and backend.

```bash
npm run dev
```
Runs both frontend and backend concurrently in development mode.
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

```bash
npm run dev:frontend
```
Runs only the frontend dev server.

```bash
npm run dev:backend
```
Runs only the backend dev server.

### Build & Deploy

```bash
npm run build
```
Builds the frontend for production. Output in `frontend/dist/`.

```bash
npm run preview
```
Preview the production build locally.

```bash
npm run deploy
```
Builds frontend and deploys to Cloudflare (requires wrangler setup).

## Frontend Scripts (from frontend/)

### Development

```bash
cd frontend
npm run dev
```
Starts Vite dev server with hot module replacement.
- URL: http://localhost:3000
- Auto-reloads on file changes

### Build

```bash
npm run build
```
Compiles TypeScript and builds for production.
Steps:
1. TypeScript compilation (`tsc`)
2. Vite build (bundling, minification, optimization)
Output: `dist/` directory

### Preview

```bash
npm run preview
```
Serves the production build locally for testing.
- URL: http://localhost:4173

### Linting

```bash
npm run lint
```
Runs ESLint on TypeScript and TSX files.
- Reports unused variables
- Checks code style
- Shows warnings and errors

## Backend Scripts (from backend/)

### Development

```bash
cd backend
npm run dev
```
Starts Express server with auto-reload.
- URL: http://localhost:3001
- Uses `--watch` flag (Node 18+)

### Production

```bash
npm start
```
Starts Express server in production mode.
- No auto-reload
- Optimized for performance

## Custom Scripts

### Quick Deploy Script

```bash
./deploy.sh
```
Automated deployment script that:
1. Installs all dependencies
2. Builds frontend
3. Shows deployment options

Make executable: `chmod +x deploy.sh`

## Cloudflare Wrangler Commands

### Development

```bash
wrangler dev
```
Run Cloudflare Worker locally.

### Deployment

```bash
wrangler deploy
```
Deploy to Cloudflare Workers/Pages.

```bash
wrangler pages deploy frontend/dist --project-name=catchess
```
Deploy to Cloudflare Pages directly.

### D1 Database Management

```bash
wrangler d1 create catchess-db
```
Create a new D1 database.

```bash
wrangler d1 list
```
List all D1 databases.

```bash
wrangler d1 execute catchess-db --file=./schema.sql
```
Execute SQL file on D1 database (initialize schema).

```bash
wrangler d1 execute catchess-db --command="SELECT * FROM chess_rooms"
```
Execute SQL command on D1 database.

```bash
wrangler d1 execute catchess-db --command="DELETE FROM chess_rooms WHERE created_at < strftime('%s', 'now', '-1 hour') * 1000"
```
Clean up old rooms (older than 1 hour).

### Logs & Monitoring

```bash
wrangler tail
```
Stream live logs from deployed worker.

```bash
wrangler pages deployment list
```
List all Pages deployments.

## Useful One-Liners

### Clean Install

```bash
rm -rf node_modules package-lock.json && npm install
```
Clean install of all dependencies.

### Full Clean Build

```bash
cd frontend && rm -rf node_modules dist && npm install && npm run build
```
Clean everything and rebuild from scratch.

### Check Bundle Size

```bash
cd frontend && npm run build && ls -lh dist/assets/
```
Build and show bundle sizes.

### Port Management

```bash
# Kill process on port
npx kill-port 3000
npx kill-port 3001
```

### Git Shortcuts

```bash
# Add all and commit
git add . && git commit -m "feat: your message"

# Push to remote
git push origin feature-branch
```

## Package Management

### Check for Updates

```bash
npm outdated
```
Show outdated packages.

```bash
cd frontend && npm outdated
cd backend && npm outdated
```
Check each project separately.

### Update Dependencies

```bash
npm update
```
Update all dependencies to latest compatible versions.

```bash
npm install <package>@latest
```
Update specific package to latest.

### Audit Security

```bash
npm audit
```
Check for security vulnerabilities.

```bash
npm audit fix
```
Automatically fix vulnerabilities.

```bash
npm audit fix --force
```
Fix with breaking changes (use with caution).

## Development Workflow

### Typical Development Session

```bash
# 1. Pull latest changes
git pull origin main

# 2. Install dependencies (if updated)
npm install
cd frontend && npm install
cd ../backend && npm install
cd ..

# 3. Start dev servers
npm run dev

# 4. Make changes...

# 5. Test build
cd frontend && npm run build

# 6. Commit changes
git add .
git commit -m "feat: your feature"
git push origin feature-branch
```

### Pre-Deployment Checklist

```bash
# 1. Lint code
cd frontend && npm run lint

# 2. Build successfully
npm run build

# 3. Preview build
npm run preview

# 4. Test in browser
# Visit http://localhost:4173

# 5. Deploy
cd .. && npm run deploy
```

## Debugging

### Frontend Debugging

```bash
# Enable source maps in dev
npm run dev
# Then use browser DevTools

# Build with source maps
npm run build
# Check dist/assets/*.js.map files
```

### Backend Debugging

```bash
# Run with Node inspector
node --inspect backend/src/index.js

# Then open chrome://inspect in Chrome
```

### Verbose Logging

```bash
# Backend with debug output
DEBUG=* npm run dev:backend

# Vite with debug
VITE_DEBUG=* npm run dev:frontend
```

## Performance Analysis

### Bundle Analysis

```bash
cd frontend
npm install -D rollup-plugin-visualizer
# Add to vite.config.ts
npm run build
# Opens stats.html with bundle visualization
```

### Lighthouse Audit

```bash
# Install lighthouse
npm install -g @lhci/cli

# Run audit
lhci autorun --upload.target=temporary-public-storage
```

## Testing (Future)

```bash
# Run unit tests
npm test

# Run e2e tests
npm run test:e2e

# Run with coverage
npm run test:coverage
```

## Environment Variables

### Development

```bash
# Set custom port
PORT=3002 npm run dev:backend

# Use different API endpoint
VITE_API_URL=http://localhost:4000 npm run dev:frontend
```

### Production

```bash
# Build with production API
VITE_API_URL=https://api.catchess.com npm run build
```

## Docker Commands (Optional)

```bash
# Build image
docker build -t catchess .

# Run container
docker run -p 3001:3001 catchess

# Docker Compose
docker-compose up
docker-compose down
```

---

## Quick Reference

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start everything |
| `npm run build` | Build for production |
| `npm run lint` | Check code style |
| `npm run preview` | Preview production build |
| `npm run deploy` | Deploy to Cloudflare |
| `wrangler deploy` | Deploy Workers |
| `wrangler tail` | View live logs |

---

For more information, see:
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Development guide
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide
- [README.md](./README.md) - Project overview
