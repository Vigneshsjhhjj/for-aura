@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed or not on PATH.
  echo Install Node.js, then run this file again.
  pause
  exit /b 1
)

echo Starting AURA server...
start "AURA Server" cmd /k "cd /d ""%~dp0"" && node src\index.js"

timeout /t 3 >nul
start "" "http://localhost:4545"

echo AURA deployment launched.
echo Browser should open at http://localhost:4545
echo If voice does not start automatically, click Start Listening once.
pause
