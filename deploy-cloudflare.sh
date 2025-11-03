#!/bin/bash

# Cloudflare Pages Deployment Script for CatChess

set -e

echo "🚀 CatChess - Cloudflare Pages Deployment"
echo "=========================================="
echo ""

# Check if we're in the right directory
if [ ! -d "frontend" ]; then
  echo "❌ Error: frontend directory not found"
  echo "   Please run this script from the project root"
  exit 1
fi

cd frontend

echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔨 Building for production..."
npm run build

echo ""
echo "✅ Build complete!"
echo ""
echo "📊 Build statistics:"
echo "===================="
ls -lh dist/ | grep -E "(index\.html|\.js|\.css|eco_interpolated\.json)"
echo ""

# Check if eco_interpolated.json exists
if [ -f "dist/eco_interpolated.json" ]; then
  ECO_SIZE=$(du -h dist/eco_interpolated.json | cut -f1)
  echo "✅ ECO database included: $ECO_SIZE"
else
  echo "❌ Error: eco_interpolated.json not found in dist/"
  exit 1
fi

echo ""
echo "🎯 Next steps:"
echo "=============="
echo ""
echo "Option 1: Deploy with Wrangler CLI"
echo "   npx wrangler pages deploy dist --project-name=catchess"
echo ""
echo "Option 2: Deploy via Cloudflare Dashboard"
echo "   1. Go to https://dash.cloudflare.com/"
echo "   2. Pages > Create a project"
echo "   3. Upload the 'dist' folder"
echo ""
echo "Option 3: Connect to Git (Recommended)"
echo "   1. Push to GitHub/GitLab"
echo "   2. Connect repository in Cloudflare Pages"
echo "   3. Set build command: npm run build"
echo "   4. Set output directory: dist"
echo "   5. Set root directory: frontend"
echo ""
echo "✨ Your chess app is ready to deploy!"
