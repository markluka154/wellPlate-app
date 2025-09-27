@echo off
echo Starting NutriAI Services...
echo.

echo Starting Worker Service on port 8420...
start "NutriAI Worker" cmd /k "cd /d "%~dp0apps\worker" && python -m uvicorn main:app --host 0.0.0.0 --port 8420 --reload"

echo Waiting 3 seconds for worker to start...
timeout /t 3 /nobreak > nul

echo Starting Web Application on port 4321...
start "NutriAI Web" cmd /k "cd /d "%~dp0" && pnpm dev"

echo.
echo Both services are starting...
echo Worker Service: http://localhost:8420
echo Web Application: http://localhost:4321
echo.
echo Press any key to exit...
pause > nul
