@echo off

echo ======================================================
echo   Starting Campus Food Recovery Platform
echo ======================================================
echo.

:: Start backend in a new window
echo Starting backend server...
start "Food Recovery Backend" cmd /c "cd backend && npm run dev"

:: Wait a moment
timeout /t 3 /nobreak >nul

:: Start frontend in a new window
echo Starting frontend server...
start "Food Recovery Frontend" cmd /c "cd frontend && npm start"

:: Wait a moment
timeout /t 3 /nobreak >nul

echo.
echo ======================================================
echo.
echo [OK] Application is running!
echo.
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:5000
echo.
echo Two terminal windows have been opened:
echo   - Backend Server
echo   - Frontend Server
echo.
echo Close those windows to stop the servers
echo.
echo ======================================================
echo.

:: Wait for user input before closing this window
pause
