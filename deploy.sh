#!/bin/bash

echo "🚀 CatChess Deployment Script"
echo "=============================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

echo ""
echo "📦 Installing dependencies..."
npm install
cd frontend && npm install && cd ..
cd backend && npm install && cd ..

echo ""
echo "🏗️  Building frontend..."
cd frontend
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

cd ..

echo ""
echo "✅ Build successful!"
echo ""
echo "📂 Built files are in: frontend/dist/"
echo ""
echo "🌐 Deployment options:"
echo "  1. Cloudflare Pages: npx wrangler pages deploy frontend/dist --project-name=catchess"
echo "  2. Manual: Upload contents of frontend/dist/ to your hosting provider"
echo "  3. Cloudflare Workers: wrangler deploy (requires wrangler.toml configuration)"
echo ""
echo "For detailed deployment instructions, see DEPLOYMENT.md"
