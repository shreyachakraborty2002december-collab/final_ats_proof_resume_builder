@echo off
echo ============================================
echo   ResumeAI - Starting Frontend Only
echo ============================================
echo.
echo NOTE: Backend server will NOT be running.
echo AI features (generate, grade, suggest) will not work.
echo You can still see the UI layout.
echo.
echo [1/2] Installing client dependencies...
call npm install --prefix client

echo.
echo [2/2] Starting Vite dev server...
echo Frontend -> http://localhost:5173
echo.
echo Press Ctrl+C to stop.
echo.

call npm run dev --prefix client
