@echo off
REM Double-click this in Explorer (Windows) to run Crabby Beach locally on port 8154.
cd /d "%~dp0"
where npm >nul 2>&1
if errorlevel 1 (
  echo Node/npm not found. Install Node LTS from https://nodejs.org then try again.
  pause
  exit /b 1
)
if not exist node_modules (
  echo First run — installing dependencies...
  call npm install
  if errorlevel 1 pause & exit /b 1
)
echo Starting Crabby Beach at http://127.0.0.1:8154
echo Leave this window open while you play. Ctrl+C to stop.
call npm run local
pause
