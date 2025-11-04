# CatChess Deployment Guide

## Quick Start

### Prerequisites
- Node.js 18+ installed
- Cloudflare account (free tier works)
- Wrangler CLI installed: `npm install -g wrangler`

### 1. Build the Frontend

```bash
cd frontend
npm install
npm run build
```

This creates a production build in `frontend/dist/`

### 2. Deploy to Cloudflare Pages

#### Option A: Using Wrangler CLI

```bash
# Login to Cloudflare
wrangler login

# Deploy
cd frontend
wrangler pages deploy dist --project-name=catchess
```

#### Option B: Using Cloudflare Dashboard

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Pages**
3. Click **Create a project**
4. Connect your Git repository (GitHub, GitLab, etc.)
5. Configure build settings:
   - **Build command**: `cd frontend && npm install && npm run build`
   - **Build output directory**: `frontend/dist`
   - **Root directory**: `/`
6. Click **Save and Deploy**

#### Option C: Direct Upload

1. Go to Cloudflare Pages dashboard
2. Click **Upload assets**
3. Upload the `frontend/dist` folder
4. Give it a project name: `catchess`

### 3. Configure Custom Domain (Optional)

1. In Cloudflare Pages, go to your project
2. Click **Custom domains**
3. Add your domain (e.g., `chess.yourdomain.com`)
4. Cloudflare will automatically provision SSL certificate

## Advanced Configuration

### Environment Variables

For production, you can set environment variables in Cloudflare Pages:

1. Go to your Pages project
2. Navigate to **Settings** > **Environment variables**
3. Add variables:

```
VITE_API_URL=https://api.catchess.com
VITE_WS_URL=wss://ws.catchess.com
VITE_ENABLE_ANALYTICS=true
```

### Cloudflare Workers (Backend API)

When you're ready to add backend functionality:

```bash
# Create D1 database
wrangler d1 create catchess-db

# Update wrangler.toml with the database ID
# Then deploy migrations
wrangler d1 execute catchess-db --file=./workers/schema.sql

# Deploy Workers
cd workers
wrangler deploy
```

### Durable Objects (Real-time Multiplayer)

1. Enable Durable Objects in your Cloudflare account
2. Create Durable Object namespace
3. Deploy workers with Durable Objects binding

## CI/CD with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd frontend
          npm ci
      
      - name: Build
        run: |
          cd frontend
          npm run build
      
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: catchess
          directory: frontend/dist
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
```

### Required Secrets

Add these to your GitHub repository secrets:
- `CLOUDFLARE_API_TOKEN`: Get from Cloudflare Dashboard > API Tokens
- `CLOUDFLARE_ACCOUNT_ID`: Found in Cloudflare Dashboard URL

## Performance Optimization

### 1. Enable Cloudflare Features

In your Cloudflare dashboard:
- **Auto Minify**: Enable for HTML, CSS, JS
- **Brotli Compression**: Enable
- **Early Hints**: Enable
- **HTTP/3**: Enable

### 2. Cache Configuration

Cloudflare Pages automatically caches:
- Static assets (CSS, JS, images)
- HTML with edge caching
- Service Worker caching for offline support

### 3. CDN Configuration

Cloudflare automatically serves your site from 275+ edge locations worldwide.

## Monitoring

### Cloudflare Analytics

1. Go to your Pages project
2. Click **Analytics**
3. View:
   - Requests per second
   - Bandwidth usage
   - Cache hit rate
   - Error rates

### Real User Monitoring

Enable Web Analytics in Cloudflare:
1. Go to **Analytics** > **Web Analytics**
2. Add your domain
3. Get beacon script
4. Add to your site (optional, Pages has built-in analytics)

## Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
cd frontend
rm -rf node_modules dist
npm install
npm run build
```

### Service Worker Issues

Clear the service worker cache:
1. Open DevTools (F12)
2. Go to Application > Service Workers
3. Click "Unregister"
4. Refresh page

### TypeScript Errors

```bash
# Check for type errors
cd frontend
npm run build
```

### Deployment Verification

After deployment, test:
1. Visit your site URL
2. Check console for errors (F12)
3. Test offline mode (Network > Offline in DevTools)
4. Verify PWA installation (look for install prompt)

## Rollback

If you need to rollback:

1. Go to Cloudflare Pages dashboard
2. Find your project
3. Click **Deployments**
4. Find the previous successful deployment
5. Click **Rollback to this deployment**

## Local Testing

Test the production build locally:

```bash
cd frontend
npm run build
npm run preview
# Visit http://localhost:4173
```

## Domain Configuration Examples

### Subdomain (Recommended)
- URL: `https://chess.yourdomain.com`
- CNAME: `chess` → `catchess.pages.dev`

### Root Domain
- URL: `https://yourdomain.com`
- CNAME: `@` → `catchess.pages.dev`
- Requires Cloudflare DNS

### Custom Path
- URL: `https://yourdomain.com/chess`
- Requires reverse proxy or Pages Functions

## Security Best Practices

1. **HTTPS Only**: Automatically enabled
2. **Security Headers**: Configure in Pages Settings
3. **CSP**: Set Content Security Policy
4. **CORS**: Configure for API endpoints

## Cost Estimation

### Cloudflare Pages (Free Tier)
- Unlimited bandwidth
- Unlimited requests
- 500 builds per month
- 1 build at a time

### Paid Plans
- **Pro** ($20/month): More builds, preview deployments
- **Business** ($200/month): Advanced features, 24/7 support

## Support

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages)
- [Cloudflare Community](https://community.cloudflare.com)
- [GitHub Issues](https://github.com/yourusername/catchess/issues)

---

**Ready to Deploy!** 🚀

Your chess platform is production-ready and can be deployed to Cloudflare Pages in minutes.
