# Test script to verify meal plan variety
Write-Host "🧪 Testing Meal Plan Variety..." -ForegroundColor Cyan

# Test 1: Maintain goal
Write-Host "`n=== TEST 1: 25yo Male, Maintain Weight ===" -ForegroundColor Yellow
$body1 = @{
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
} | ConvertTo-Json

try {
    $response1 = Invoke-RestMethod -Uri "http://localhost:8420/generate" -Method POST -Body $body1 -ContentType "application/json"
    Write-Host "✅ Success: $($response1.plan[0].meals[0].name)" -ForegroundColor Green
    Write-Host "   Calories: $($response1.plan[0].meals[0].kcal)"
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Start-Sleep -Seconds 2

# Test 2: Gain weight goal
Write-Host "`n=== TEST 2: 22yo Male, Gain Weight ===" -ForegroundColor Yellow
$body2 = @{
    age = 22
    weightKg = 65
    heightCm = 170
    sex = "male"
    goal = "gain weight"
    dietType = "omnivore"
    allergies = @()
    dislikes = @()
    cookingEffort = "quick"
    caloriesTarget = 2500
} | ConvertTo-Json

try {
    $response2 = Invoke-RestMethod -Uri "http://localhost:8420/generate" -Method POST -Body $body2 -ContentType "application/json"
    Write-Host "✅ Success: $($response2.plan[0].meals[0].name)" -ForegroundColor Green
    Write-Host "   Calories: $($response2.plan[0].meals[0].kcal)"
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Start-Sleep -Seconds 2

# Test 3: Different diet type
Write-Host "`n=== TEST 3: 30yo Female, Lose Weight, Vegan ===" -ForegroundColor Yellow
$body3 = @{
    age = 30
    weightKg = 60
    heightCm = 165
    sex = "female"
    goal = "lose weight"
    dietType = "vegan"
    allergies = @()
    dislikes = @()
    cookingEffort = "quick"
    caloriesTarget = 1500
} | ConvertTo-Json

try {
    $response3 = Invoke-RestMethod -Uri "http://localhost:8420/generate" -Method POST -Body $body3 -ContentType "application/json"
    Write-Host "✅ Success: $($response3.plan[0].meals[0].name)" -ForegroundColor Green
    Write-Host "   Calories: $($response3.plan[0].meals[0].kcal)"
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎯 Variety Test Complete!" -ForegroundColor Cyan
