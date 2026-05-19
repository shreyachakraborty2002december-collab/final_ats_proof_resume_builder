@echo off
echo ============================================
echo   ResumeAI - Clean Install + Start
echo ============================================
echo.

echo [1/6] Checking Node.js...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found. Install from https://nodejs.org (v20+)
    pause & exit /b 1
)

echo.
echo [2/6] Removing old node_modules (cross-machine fix)...
if exist "node_modules" rmdir /s /q "node_modules"
if exist "client\node_modules" rmdir /s /q "client\node_modules"
if exist "server\node_modules" rmdir /s /q "server\node_modules"
echo Done.

echo.
echo [3/6] Installing root dependencies...
call npm install
if %errorlevel% neq 0 ( echo ERROR: Root install failed. & pause & exit /b 1 )

echo.
echo [4/6] Installing server dependencies...
call npm install --prefix server
if %errorlevel% neq 0 ( echo ERROR: Server install failed. & pause & exit /b 1 )

echo.
echo [5/6] Installing client dependencies...
call npm install --prefix client
if %errorlevel% neq 0 ( echo ERROR: Client install failed. & pause & exit /b 1 )

echo.
echo [6/6] Starting servers...
echo ============================================
echo   Backend  -> http://localhost:5000
echo   Frontend -> http://localhost:5173
echo   Open http://localhost:5173 in browser
echo ============================================
echo.
echo Press Ctrl+C to stop.
echo.
call npm run dev
