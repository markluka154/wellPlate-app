@echo off
echo Starting NutriAI Development Environment...
echo.

echo Starting Web App (Next.js)...
start "NutriAI Web App" cmd /k "cd /d "%~dp0" && pnpm dev"

echo Waiting 3 seconds for web app to initialize...
timeout /t 3 /nobreak > nul

echo Starting Worker Service (Python FastAPI)...
start "NutriAI Worker" cmd /k "cd /d "%~dp0\apps\worker" && python -m uvicorn main:app --host 0.0.0.0 --port 8420"

echo.
echo ✅ Both services are starting!
echo.
echo 🌐 Web App: http://localhost:4321
echo 🔧 Worker Health: http://localhost:8420/health
echo.
echo Press any key to close this window...
pause > nul
