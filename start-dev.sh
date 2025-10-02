#!/bin/bash

# Start development environment for Collective AI Tools
# This script starts both the API server and the development server

echo "🚀 Starting Collective AI Tools Development Environment"
echo ""

# Function to cleanup background processes
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    kill $API_PID $DEV_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start API server in background
echo "📡 Starting API server on port 3001..."
node server.js &
API_PID=$!

# Wait a moment for API server to start
sleep 2

# Start development server
echo "🌐 Starting development server on port 5173..."
npm run dev &
DEV_PID=$!

echo ""
echo "✅ Development environment is ready!"
echo ""
echo "📡 API Server: http://localhost:3001"
echo "   - GET /api/jobs (AI jobs board)"
echo "   - POST /api/ai-tools (AI tools)"
echo "   - GET /api/health (health check)"
echo ""
echo "🌐 Frontend: http://localhost:5173"
echo "   - AI Jobs Board: http://localhost:5173/job-board"
echo "   - AI Workspace: http://localhost:5173/built-in-tools"
echo "   - External Tools: http://localhost:5173/tools"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for both processes
wait
