#!/bin/bash

echo "======================================================"
echo "  Starting Campus Food Recovery Platform"
echo "======================================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Shutting down servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

# Start backend
echo "Starting backend server..."
cd backend
npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Check if backend started successfully
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${YELLOW}⚠ Backend failed to start. Check backend.log for errors${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"

# Start frontend
echo "Starting frontend server..."
cd frontend
npm start > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait a moment for frontend to start
sleep 3

# Check if frontend started successfully
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    echo -e "${YELLOW}⚠ Frontend failed to start. Check frontend.log for errors${NC}"
    kill $BACKEND_PID
    exit 1
fi
echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID)${NC}"

echo ""
echo "======================================================"
echo ""
echo -e "${GREEN}✓ Application is running!${NC}"
echo ""
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:5000"
echo ""
echo "  Logs:"
echo "    Backend:  tail -f backend.log"
echo "    Frontend: tail -f frontend.log"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""
echo "======================================================"

# Keep script running
wait
