@echo off
echo ========================================
echo   Nutrislice Data Processor
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    echo.
)

echo Processing Nutrislice CSV files...
echo.
node scripts/processNutrisliceData.js

echo.
echo Processing complete! Check the processed-data folder for results.
pause 