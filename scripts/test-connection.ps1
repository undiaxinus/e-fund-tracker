# Supabase Connection Test Script for Windows
# This script checks if your Supabase configuration is working

Write-Host "Supabase Connection Test" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Gray

# Check if Node.js is installed
try {
    $nodeVersion = node --version 2>$null
    Write-Host "Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js not found. Please install Node.js first." -ForegroundColor Red
    Write-Host "Download from: https://nodejs.org" -ForegroundColor Yellow
    exit 1
}

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "Please run this script from the project root directory" -ForegroundColor Red
    Write-Host "Current directory: $(Get-Location)" -ForegroundColor Yellow
    exit 1
}

# Check if environment file exists
if (-not (Test-Path "src\environments\environment.ts")) {
    Write-Host "Environment file not found: src\environments\environment.ts" -ForegroundColor Red
    exit 1
}

Write-Host "Project structure looks good" -ForegroundColor Green

# Read and check environment configuration
Write-Host "`nChecking environment configuration..." -ForegroundColor Cyan

$envContent = Get-Content "src\environments\environment.ts" -Raw

# Extract Supabase URL and key using simpler regex
$urlPattern = "supabaseUrl: '([^']+)'"
$keyPattern = "supabaseAnonKey: '([^']+)'"

if ($envContent -match $urlPattern) {
    $supabaseUrl = $matches[1]
} else {
    Write-Host "Cannot find supabaseUrl in environment.ts" -ForegroundColor Red
    exit 1
}

if ($envContent -match $keyPattern) {
    $supabaseKey = $matches[1]
} else {
    Write-Host "Cannot find supabaseAnonKey in environment.ts" -ForegroundColor Red
    exit 1
}

if ($supabaseUrl -and $supabaseKey) {
    
    Write-Host "Supabase URL: $supabaseUrl" -ForegroundColor White
    Write-Host "API Key: $($supabaseKey.Substring(0, [Math]::Min(20, $supabaseKey.Length)))..." -ForegroundColor White
    
    # Check if configuration looks valid
    if ($supabaseUrl -eq "YOUR_SUPABASE_URL" -or $supabaseKey -eq "YOUR_SUPABASE_ANON_KEY") {
        Write-Host "`nSupabase not configured properly!" -ForegroundColor Red
        Write-Host "`nTo fix this:" -ForegroundColor Yellow
        Write-Host "1. Go to https://app.supabase.com" -ForegroundColor White
        Write-Host "2. Create or select your project" -ForegroundColor White
        Write-Host "3. Go to Settings > API" -ForegroundColor White
        Write-Host "4. Copy the Project URL and anon/public key" -ForegroundColor White
        Write-Host "5. Update src/environments/environment.ts" -ForegroundColor White
        exit 1
    }
    
    if ($supabaseUrl -notlike "*supabase.co*") {
        Write-Host "URL doesn't look like a Supabase URL" -ForegroundColor Yellow
    } else {
        Write-Host "Configuration looks valid" -ForegroundColor Green
    }
} else {
    Write-Host "Cannot find Supabase configuration in environment.ts" -ForegroundColor Red
    exit 1
}

# Check if @supabase/supabase-js is installed
Write-Host "`nChecking dependencies..." -ForegroundColor Cyan

if (Test-Path "node_modules\@supabase\supabase-js") {
    Write-Host "@supabase/supabase-js is installed" -ForegroundColor Green
} else {
    Write-Host "@supabase/supabase-js not found" -ForegroundColor Red
    Write-Host "Run: npm install" -ForegroundColor Yellow
    exit 1
}

# Run the Node.js connection test
Write-Host "`nRunning connection test..." -ForegroundColor Cyan
Write-Host "-" * 30 -ForegroundColor Gray

try {
    & node "scripts\test-supabase.js"
    $testResult = $LASTEXITCODE
} catch {
    Write-Host "Failed to run connection test: $_" -ForegroundColor Red
    exit 1
}

Write-Host "-" * 30 -ForegroundColor Gray

if ($testResult -eq 0) {
    Write-Host "`nConnection test completed successfully!" -ForegroundColor Green
    Write-Host "`nNext steps:" -ForegroundColor Cyan
    Write-Host "- Start the app: ng serve" -ForegroundColor White
    Write-Host "- Visit: http://localhost:4200" -ForegroundColor White
    Write-Host "- Test UI: http://localhost:4200/connection-test" -ForegroundColor White
    Write-Host "- Login with admin credentials" -ForegroundColor White
} else {
    Write-Host "`nConnection test failed!" -ForegroundColor Red
    Write-Host "Check the error messages above for troubleshooting." -ForegroundColor Yellow
}

Write-Host "`nAdditional help:" -ForegroundColor Cyan
Write-Host "- Setup guide: SUPABASE_SETUP.md" -ForegroundColor White
Write-Host "- Supabase docs: https://supabase.com/docs" -ForegroundColor White

exit $testResult