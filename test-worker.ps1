# Simple test script for worker service
Write-Host "🧪 Testing Worker Service..." -ForegroundColor Cyan

$body = @{
    age = 25
    weightKg = 70
    heightCm = 175
    sex = "male"
    goal = "maintain"
    dietType = "omnivore"
    allergies = @()
    dislikes = @()
    cookingEffort = "quick"
    caloriesTarget = 2000
}

$jsonBody = $body | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8420/generate" -Method POST -Body $jsonBody -ContentType "application/json"
    Write-Host "✅ SUCCESS! Worker is running!" -ForegroundColor Green
    Write-Host "First meal: $($response.plan[0].meals[0].name)" -ForegroundColor Yellow
    Write-Host "Calories: $($response.plan[0].meals[0].kcal)" -ForegroundColor Yellow
} catch {
    Write-Host "❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
}
