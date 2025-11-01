#!/bin/bash

# CatChess Development Startup Script
# This script starts both frontend and backend servers

echo "🚀 Starting CatChess Development Environment..."
echo ""

# Check if node_modules exists
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

echo ""
echo "✅ Dependencies installed"
echo ""
echo "Starting services..."
echo "  - Frontend: http://localhost:3000"
echo "  - Backend API: http://localhost:3001"
echo "  - WebSocket: ws://localhost:3001"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Start both services using npm's dev script
npm run dev
