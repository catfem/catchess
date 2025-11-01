# 🚀 Deployment Guide

This guide covers deploying CatChess to Cloudflare Pages and Workers.

## Prerequisites

- Cloudflare account (free tier works)
- Node.js 18+ installed
- Git installed
- GitHub repository (optional, for automatic deployments)

## Option 1: Cloudflare Pages (Recommended)

### Step 1: Build the Application

```bash
cd frontend
npm install
npm run build
```

This creates a `frontend/dist` directory with your production build.

### Step 2: Deploy to Cloudflare Pages

#### Via Cloudflare Dashboard:

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Go to **Pages** → **Create a project**
3. Choose **"Connect to Git"** or **"Direct Upload"**

**For Git Connection:**
- Connect your GitHub/GitLab account
- Select your repository
- Configure build settings:
  - **Build command**: `cd frontend && npm install && npm run build`
  - **Build output directory**: `frontend/dist`
  - **Root directory**: `/`
- Click **Save and Deploy**

**For Direct Upload:**
- Click **"Upload assets"**
- Drag and drop the `frontend/dist` folder
- Click **Deploy**

#### Via Wrangler CLI:

```bash
# Install Wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy
cd frontend
npx wrangler pages deploy dist --project-name=catchess
```

Your site will be live at: `https://catchess.pages.dev`

## Option 2: Cloudflare Workers (For API)

If you need the backend API and WebSocket support:

### Step 1: Create KV Namespace (Optional)

KV namespaces are used to persist room data. If you don't need persistence, you can skip this step.

To enable KV storage:

```bash
# Create production KV namespace
wrangler kv:namespace create "CHESS_ROOMS"

# Create preview KV namespace (for development)
wrangler kv:namespace create "CHESS_ROOMS" --preview
```

Note the namespace IDs returned by each command.

### Step 2: Update wrangler.toml (If using KV)

If you created KV namespaces, edit `wrangler.toml` and uncomment the KV namespace section, replacing with your namespace IDs:

```toml
[[kv_namespaces]]
binding = "CHESS_ROOMS"
id = "your-production-namespace-id-here"
preview_id = "your-preview-namespace-id-here"
```

### Step 3: Deploy Worker

```bash
# Build frontend first
cd frontend
npm run build
cd ..

# Deploy worker
wrangler deploy
```

## Option 3: Custom Domain

### Add Custom Domain to Cloudflare Pages:

1. In Cloudflare Dashboard, go to your Pages project
2. Click **Custom domains** tab
3. Click **Set up a custom domain**
4. Enter your domain (e.g., `chess.yourdomain.com`)
5. Follow DNS configuration instructions

Your site will be available at your custom domain with automatic HTTPS!

## Option 4: Docker Deployment (Self-Hosted)

### Create Dockerfile:

```dockerfile
# Dockerfile
FROM node:18-alpine as builder

WORKDIR /app

# Install frontend dependencies
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

# Build frontend
COPY frontend ./frontend
RUN cd frontend && npm run build

# Production image
FROM node:18-alpine

WORKDIR /app

# Install backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install --production

# Copy backend code
COPY backend ./backend

# Copy built frontend
COPY --from=builder /app/frontend/dist ./frontend/dist

EXPOSE 3001

CMD ["node", "backend/src/index.js"]
```

### Build and Run:

```bash
# Build image
docker build -t catchess .

# Run container
docker run -p 3001:3001 catchess
```

## Environment Variables

For production deployments, you may want to configure:

### Cloudflare Pages Environment Variables:

1. Go to Pages project settings
2. Click **Environment variables**
3. Add variables:
   - `NODE_VERSION`: `18`
   - `NPM_VERSION`: `9`

### Backend Environment Variables:

Create `.env` file (for local development):

```env
PORT=3001
NODE_ENV=production
STOCKFISH_ENDPOINT=https://your-worker.workers.dev
```

## Post-Deployment Checklist

- [ ] Test all game modes (vs Engine, PvP Local, PvP Online)
- [ ] Verify Stockfish engine loads correctly
- [ ] Test PGN import/export
- [ ] Check WebSocket connections for online play
- [ ] Test on mobile devices
- [ ] Verify dark/light theme toggle
- [ ] Check evaluation bar and graphs
- [ ] Test move analysis and labeling

## Monitoring and Analytics

### Add Cloudflare Web Analytics:

1. In Cloudflare Dashboard, go to **Web Analytics**
2. Create a new site
3. Copy the tracking code
4. Add to `frontend/index.html` before `</body>`

### Enable Cloudflare Workers Analytics:

1. Go to **Workers** → **Your Worker** → **Metrics**
2. View requests, errors, and performance

## Troubleshooting

### KV namespace error (code: 10042):

**Error**: `KV namespace 'your-kv-namespace-id' is not valid`

**Solution**: This error occurs when wrangler.toml contains placeholder KV namespace IDs. You have two options:

1. **Skip KV storage** (recommended for initial deployment):
   - The KV namespace section is already commented out in `wrangler.toml`
   - The worker will function without persistence
   
2. **Enable KV storage**:
   - Create KV namespaces: `wrangler kv:namespace create "CHESS_ROOMS"`
   - Create preview namespace: `wrangler kv:namespace create "CHESS_ROOMS" --preview`
   - Uncomment the KV section in `wrangler.toml` and add the returned IDs

### Stockfish not loading:

- Check browser console for errors
- Verify CDN is accessible: https://cdn.jsdelivr.net/npm/stockfish
- Try clearing browser cache

### WebSocket connection fails:

- Ensure Durable Objects are enabled in your Cloudflare plan
- Check wrangler.toml configuration
- Verify worker is deployed

### Build errors:

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Rollback

### Cloudflare Pages:

1. Go to your Pages project
2. Click **Deployments** tab
3. Find previous successful deployment
4. Click **...** → **Rollback to this deployment**

### Cloudflare Workers:

```bash
# Deploy previous version
wrangler rollback
```

## Updates

To update your deployment:

```bash
# Pull latest changes
git pull origin main

# Build
cd frontend && npm run build

# Deploy
wrangler deploy
```

## Support

For deployment issues:
- Check [Cloudflare Docs](https://developers.cloudflare.com)
- Visit [Cloudflare Community](https://community.cloudflare.com)
- Open an issue on GitHub

---

Happy deploying! ♟️
