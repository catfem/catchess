# 🚀 Complete Cloudflare Pages Chess Platform Deployment Guide

This guide covers the complete deployment of a production-grade chess platform on Cloudflare infrastructure.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Architecture](#architecture)
4. [Database Setup](#database-setup)
5. [Worker Deployment](#worker-deployment)
6. [Pages Deployment](#pages-deployment)
7. [Configuration](#configuration)
8. [Post-Deployment](#post-deployment)
9. [Maintenance](#maintenance)

---

## Overview

CatChess is a full-stack chess platform built entirely on Cloudflare's serverless infrastructure:

✅ **Cloudflare Pages** - Static frontend hosting  
✅ **Cloudflare Workers** - Serverless API endpoints  
✅ **Durable Objects** - Real-time multiplayer state  
✅ **D1 Database** - Persistent SQL database  
✅ **KV Storage** - Optional caching layer  
✅ **PWA Support** - Installable app with offline mode  

### Features Included

- ♟️ Interactive chess board with Stockfish analysis
- 👥 Real-time multiplayer via WebSocket
- 🧠 Tactics puzzles and training
- 📊 ELO rating system
- 🏆 Tournaments and leaderboards
- 👤 User authentication and profiles
- 📱 Progressive Web App (offline capable)
- 🌍 Global edge deployment

---

## Prerequisites

Before deploying, ensure you have:

1. **Cloudflare Account** (free tier works)
2. **Wrangler CLI** installed globally
3. **Node.js 18+** and npm
4. **Git** repository (GitHub, GitLab, or Bitbucket)

### Install Wrangler

```bash
npm install -g wrangler
```

### Login to Cloudflare

```bash
wrangler login
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Cloudflare Global Edge                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐ │
│  │ Pages (Static) │  │ Workers (API)  │  │ D1 (Database)  │ │
│  │  - React UI    │  │  - Auth        │  │  - Users       │ │
│  │  - Stockfish   │  │  - Games       │  │  - Games       │ │
│  │  - PWA         │  │  - Ratings     │  │  - Ratings     │ │
│  └────────────────┘  └────────────────┘  └────────────────┘ │
│           │                   │                    │          │
│           └───────────────────┴────────────────────┘          │
│                              │                                │
│                  ┌───────────▼────────────┐                   │
│                  │   Durable Objects       │                   │
│                  │  (WebSocket Rooms)      │                   │
│                  └─────────────────────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Setup

### Step 1: Create D1 Database

```bash
wrangler d1 create catchess-db
```

This will output a database ID like:

```
✅ Successfully created DB 'catchess-db'!
Database ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### Step 2: Initialize Schema

Copy the database ID and update `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "catchess-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  # Your DB ID
```

Then initialize the schema:

```bash
wrangler d1 execute catchess-db --file=./schema-complete.sql
```

### Step 3: Verify Database

```bash
wrangler d1 execute catchess-db --command="SELECT name FROM sqlite_master WHERE type='table'"
```

You should see tables for users, games, tournaments, etc.

---

## Worker Deployment

### Step 1: Configure Wrangler

Edit `wrangler.toml`:

```toml
name = "catchess"
main = "workers/enhanced-api.js"
compatibility_date = "2024-01-01"

# D1 Database
[[d1_databases]]
binding = "DB"
database_name = "catchess-db"
database_id = "your-database-id-here"

# Durable Objects for WebSocket
[[durable_objects.bindings]]
name = "CHESS_ROOM"
class_name = "ChessRoom"
script_name = "catchess"

[[migrations]]
tag = "v1"
new_classes = ["ChessRoom"]

# Optional: KV for caching
[[kv_namespaces]]
binding = "CACHE"
id = "your-kv-namespace-id"
```

### Step 2: Deploy Worker

```bash
wrangler deploy
```

Your API will be available at:
```
https://catchess.<your-account>.workers.dev
```

### Step 3: Test Worker

```bash
curl https://catchess.<your-account>.workers.dev/api/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "CatChess API v2.0",
  "features": ["authentication", "ratings", ...]
}
```

---

## Pages Deployment

### Option A: Git Integration (Recommended)

1. **Push code to GitHub/GitLab**

2. **Connect to Cloudflare Pages:**
   - Go to [dash.cloudflare.com](https://dash.cloudflare.com)
   - Navigate to **Pages** → **Create a project**
   - Select your Git repository

3. **Configure build settings:**

   ```yaml
   Framework preset: Vite
   Build command: cd frontend && npm install && npm run build
   Build output directory: frontend/dist
   Root directory: /
   ```

4. **Environment variables:**

   Add these in Pages settings:
   ```
   VITE_API_URL=https://catchess.<your-account>.workers.dev
   VITE_WS_URL=wss://catchess.<your-account>.workers.dev
   ```

5. **Deploy!**

   Cloudflare will automatically build and deploy on every git push.

### Option B: Direct Upload

```bash
# Build frontend
cd frontend
npm install
npm run build

# Deploy to Pages
wrangler pages deploy dist --project-name=catchess
```

Your site will be live at:
```
https://catchess.pages.dev
```

---

## Configuration

### Frontend Environment Variables

Create `frontend/.env.production`:

```bash
VITE_API_URL=https://catchess.<your-account>.workers.dev
VITE_WS_URL=wss://catchess.<your-account>.workers.dev
VITE_ENABLE_ANALYTICS=true
VITE_SENTRY_DSN=your-sentry-dsn  # Optional
```

### Worker Environment Variables

Set secrets in Cloudflare dashboard or via CLI:

```bash
# JWT Secret
wrangler secret put JWT_SECRET
# Enter your secret when prompted

# Admin password
wrangler secret put ADMIN_PASSWORD
```

### Custom Domain (Optional)

1. Go to your Pages project settings
2. Click **Custom domains**
3. Add your domain: `chess.yourdomain.com`
4. Cloudflare will automatically provision SSL

---

## Post-Deployment

### 1. Create Admin User

```bash
curl -X POST https://your-api.workers.dev/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@yourdomain.com",
    "password": "secure-password"
  }'
```

### 2. Seed Initial Data

```bash
# Add sample puzzles
wrangler d1 execute catchess-db --file=./seed-puzzles.sql

# Add opening library
wrangler d1 execute catchess-db --file=./seed-openings.sql
```

### 3. Test All Features

- ✅ User registration and login
- ✅ Create online game room
- ✅ Real-time multiplayer moves
- ✅ Stockfish analysis
- ✅ Puzzles
- ✅ Leaderboard
- ✅ PWA installation

### 4. Set Up Monitoring

Cloudflare provides built-in analytics:

- **Web Analytics**: Automatic (no tracking cookies)
- **Workers Analytics**: Request counts, errors, latency
- **D1 Queries**: Query performance metrics

### 5. Enable Caching

Add cache rules in Cloudflare dashboard:

```
Cache Rule:
- URL: *.js, *.css, *.wasm, *.json
- Edge Cache TTL: 1 hour
- Browser Cache TTL: 1 day
```

---

## Maintenance

### Update Schema

```bash
# Create migration file
echo "ALTER TABLE users ADD COLUMN premium BOOLEAN DEFAULT FALSE;" > migrations/001_add_premium.sql

# Apply migration
wrangler d1 execute catchess-db --file=migrations/001_add_premium.sql
```

### Update Worker

```bash
# Make changes to workers/enhanced-api.js
# Deploy new version
wrangler deploy
```

### Update Frontend

```bash
# Push to git (auto-deploys if using Git integration)
git push

# Or manual deploy
cd frontend && npm run build
wrangler pages deploy dist --project-name=catchess
```

### Backup Database

```bash
# Export database
wrangler d1 export catchess-db > backup-$(date +%Y%m%d).sql

# Restore from backup
wrangler d1 execute catchess-db --file=backup-20240101.sql
```

### Monitor Usage

```bash
# View Worker analytics
wrangler tail

# Check D1 usage
wrangler d1 info catchess-db
```

### Clean Up Old Data

```bash
# Delete expired rooms
wrangler d1 execute catchess-db --command="
  DELETE FROM chess_rooms 
  WHERE expires_at < strftime('%s', 'now') * 1000
"

# Archive old games
wrangler d1 execute catchess-db --command="
  UPDATE games 
  SET archived = TRUE 
  WHERE completed_at < strftime('%s', 'now', '-90 days') * 1000
"
```

---

## Performance Optimization

### 1. Enable Cloudflare Speed Features

- ✅ Brotli compression
- ✅ Rocket Loader (for JS)
- ✅ Mirage (for images)
- ✅ HTTP/3 (QUIC)

### 2. Optimize Assets

```bash
# Compress images
npm install -g imagemin-cli
imagemin frontend/public/icons/* --out-dir=frontend/public/icons/

# Tree-shake dependencies
npm run build -- --analyze
```

### 3. Use KV for Caching

Store frequently accessed data:

```javascript
// Cache opening library
await env.CACHE.put('openings:eco', JSON.stringify(openings), {
  expirationTtl: 86400 // 1 day
});
```

---

## Cost Estimation

Cloudflare offers generous free tiers:

| Service | Free Tier | Typical Usage |
|---------|-----------|---------------|
| Pages | Unlimited requests | ✅ Free |
| Workers | 100k requests/day | ✅ Free |
| Durable Objects | 1M requests/month | ✅ Free |
| D1 | 5 GB storage + 5M reads | ✅ Free |
| KV | 100k reads/day | ✅ Free |

**Estimated monthly cost for 10k users: $0-5** 🎉

---

## Troubleshooting

### Worker fails to deploy

```bash
# Check syntax
wrangler publish --dry-run

# View logs
wrangler tail
```

### Pages build fails

```bash
# Test build locally
cd frontend
npm run build

# Check build logs in Cloudflare dashboard
```

### Database connection errors

```bash
# Verify D1 binding
wrangler d1 list

# Test connection
wrangler d1 execute catchess-db --command="SELECT 1"
```

### WebSocket not connecting

- Verify Durable Objects are deployed
- Check CORS headers
- Test with `wscat` tool:
  ```bash
  npm install -g wscat
  wscat -c wss://your-worker.workers.dev/ws/room/test123
  ```

---

## Security Best Practices

1. **Use Environment Variables** for secrets
2. **Enable HTTPS only** (automatic with Cloudflare)
3. **Implement rate limiting** (included in Worker)
4. **Validate all inputs** (SQL injection prevention)
5. **Use CSP headers** (Content Security Policy)
6. **Enable Turnstile** (bot protection)

---

## Next Steps

After successful deployment:

1. 📊 **Set up analytics** - Google Analytics, Plausible, or Fathom
2. 🔔 **Enable notifications** - Push notifications for game invites
3. 🎨 **Customize branding** - Update colors, logo, favicon
4. 📱 **Test on mobile** - iOS and Android browsers
5. 🌍 **Add translations** - i18n for multiple languages
6. 🏆 **Launch tournaments** - Create your first tournament
7. 📣 **Share with community** - Reddit, HN, Twitter

---

## Support

- **Documentation**: [Your docs site]
- **Issues**: [GitHub Issues]
- **Discord**: [Your Discord server]
- **Email**: support@yourdomain.com

---

## Congratulations! 🎉

Your chess platform is now live on Cloudflare's global edge network with:

✅ **Zero cold starts**  
✅ **Sub-50ms latency worldwide**  
✅ **99.99% uptime SLA**  
✅ **Automatic scaling**  
✅ **DDoS protection**  

**Happy chess playing!** ♟️
