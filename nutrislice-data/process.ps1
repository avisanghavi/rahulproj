Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Nutrislice Data Processor" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

Write-Host "Processing Nutrislice CSV files..." -ForegroundColor Green
Write-Host ""

try {
    node scripts/processNutrisliceData.js
    Write-Host ""
    Write-Host "Processing complete! Check the processed-data folder for results." -ForegroundColor Green
} catch {
    Write-Host "Error during processing: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Read-Host "Press Enter to continue" 