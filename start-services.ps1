Write-Host "Starting NutriAI Services..." -ForegroundColor Green
Write-Host ""

Write-Host "Starting Worker Service on port 8420..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\medja\Desktop\AI meal plan builder\apps\worker'; python -m uvicorn main:app --host 0.0.0.0 --port 8420 --reload"

Write-Host "Waiting 3 seconds for worker to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

Write-Host "Starting Web Application on port 4321..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\medja\Desktop\AI meal plan builder'; pnpm dev"

Write-Host ""
Write-Host "Both services are starting..." -ForegroundColor Green
Write-Host "Worker Service: http://localhost:8420" -ForegroundColor Cyan
Write-Host "Web Application: http://localhost:4321" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor White
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
