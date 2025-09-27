Write-Host "Starting NutriAI Development Environment..." -ForegroundColor Green
Write-Host ""

Write-Host "Starting Web App (Next.js)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\medja\Desktop\AI meal plan builder'; pnpm dev"

Start-Sleep -Seconds 3

Write-Host "Starting Worker Service (Python FastAPI)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\medja\Desktop\AI meal plan builder\apps\worker'; poetry run uvicorn worker.main:app --host 0.0.0.0 --port 8420 --reload"

Write-Host ""
Write-Host "✅ Both services are starting!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Web App: http://localhost:4321" -ForegroundColor Cyan
Write-Host "🔧 Worker Health: http://localhost:8420/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to close this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")