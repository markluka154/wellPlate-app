# NutriAI Worker Service Startup Script
# This script starts the Python FastAPI worker service

Write-Host "🚀 Starting NutriAI Worker Service..." -ForegroundColor Green
Write-Host ""

# Set the worker directory
$workerDir = "C:\Users\medja\Desktop\AI meal plan builder\apps\worker"

# Check if the worker directory exists
if (-not (Test-Path $workerDir)) {
    Write-Host "❌ Worker directory not found: $workerDir" -ForegroundColor Red
    Write-Host "Please make sure you're running this script from the correct location." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if .env file exists
$envFile = Join-Path $workerDir ".env"
if (-not (Test-Path $envFile)) {
    Write-Host "⚠️  No .env file found in worker directory" -ForegroundColor Yellow
    Write-Host "Creating .env file from template..." -ForegroundColor Yellow
    
    # Copy from env.example if it exists
    $envExample = Join-Path $workerDir "env.example"
    if (Test-Path $envExample) {
        Copy-Item $envExample $envFile
        Write-Host "✅ Created .env file from template" -ForegroundColor Green
        Write-Host "⚠️  Please edit the .env file and add your OpenAI API key!" -ForegroundColor Yellow
    } else {
        Write-Host "❌ No env.example file found either" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

# Check if Python is available
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found in PATH" -ForegroundColor Red
    Write-Host "Please install Python and make sure it's in your PATH" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if required packages are installed
Write-Host "🔍 Checking Python packages..." -ForegroundColor Yellow
try {
    python -c "import fastapi, uvicorn, openai" 2>$null
    Write-Host "✅ Required packages found" -ForegroundColor Green
} catch {
    Write-Host "❌ Missing required packages" -ForegroundColor Red
    Write-Host "Installing required packages..." -ForegroundColor Yellow
    pip install -r (Join-Path $workerDir "requirements.txt")
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install packages" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
    Write-Host "✅ Packages installed successfully" -ForegroundColor Green
}

Write-Host ""
Write-Host "🌐 Starting Worker Service on port 8420..." -ForegroundColor Cyan
Write-Host "📋 Health check: http://localhost:8420/health" -ForegroundColor Cyan
Write-Host "🤖 AI generation: http://localhost:8420/generate" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the service" -ForegroundColor Gray
Write-Host "=" * 50 -ForegroundColor Gray

# Change to worker directory and start the service
Set-Location $workerDir

# Start the worker service with uvicorn
try {
    python -m uvicorn main:app --host 0.0.0.0 --port 8420 --reload
} catch {
    Write-Host "❌ Failed to start worker service" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
