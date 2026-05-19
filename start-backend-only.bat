@echo off
echo ============================================
echo   ResumeAI - Starting Backend Server Only
echo ============================================
echo.
echo [1/2] Installing server dependencies...
call npm install --prefix server

echo.
echo [2/2] Starting Express server...
echo Backend API -> http://localhost:5000
echo.
echo Press Ctrl+C to stop.
echo.

call npm run dev --prefix server
