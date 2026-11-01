@echo off
cd /d "%~dp0"

echo ========================================
echo   ARMY Vault - Setup and Start
echo ========================================
echo.

echo [1/4] Stopping any running Node processes...
taskkill /F /IM node.exe >nul 2>&1

echo [2/4] Cleaning old install...
if exist node_modules rmdir /s /q node_modules
if exist .next rmdir /s /q .next
if exist package-lock.json del /f package-lock.json

echo [3/4] Installing dependencies (may take a few minutes)...
call npm install
if errorlevel 1 (
  echo.
  echo ERROR: npm install failed.
  echo Close other terminals/editors using this folder and run setup.bat again.
  pause
  exit /b 1
)

echo [4/4] Starting dev server at http://localhost:3000 ...
echo.
call npm run dev
pause