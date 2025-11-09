# 🚀 Quick Deploy Script

# This script helps you deploy to Vercel quickly
# Make sure you've completed Supabase setup first!

Write-Host "🚀 DHS Healthcare - Quick Deploy to Vercel" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (!(Test-Path "client\package.json")) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Project structure verified" -ForegroundColor Green
Write-Host ""

# Ask for Supabase credentials
Write-Host "📝 Please enter your Supabase credentials:" -ForegroundColor Yellow
Write-Host ""

$supabaseUrl = Read-Host "Supabase Project URL (https://xxxxx.supabase.co)"
$supabaseKey = Read-Host "Supabase Anon Key (eyJhbGc...)"

if ([string]::IsNullOrWhiteSpace($supabaseUrl) -or [string]::IsNullOrWhiteSpace($supabaseKey)) {
    Write-Host "❌ Error: Both URL and Key are required!" -ForegroundColor Red
    exit 1
}

# Create .env file for local testing
Write-Host ""
Write-Host "📝 Creating .env file for local development..." -ForegroundColor Yellow

$envContent = @"
VITE_SUPABASE_URL=$supabaseUrl
VITE_SUPABASE_ANON_KEY=$supabaseKey
"@

Set-Content -Path "client\.env" -Value $envContent

Write-Host "✅ .env file created" -ForegroundColor Green
Write-Host ""

# Test build
Write-Host "🔨 Testing production build..." -ForegroundColor Yellow
Set-Location client
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful!" -ForegroundColor Green
} else {
    Write-Host "❌ Build failed! Please fix errors before deploying." -ForegroundColor Red
    Set-Location ..
    exit 1
}

Set-Location ..

Write-Host ""
Write-Host "🎉 Ready to deploy!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Push code to GitHub:" -ForegroundColor White
Write-Host "   git add ." -ForegroundColor Gray
Write-Host "   git commit -m 'Ready for deployment'" -ForegroundColor Gray
Write-Host "   git push" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Go to https://vercel.com and import your repository" -ForegroundColor White
Write-Host ""
Write-Host "3. Configure Vercel:" -ForegroundColor White
Write-Host "   - Root Directory: client" -ForegroundColor Gray
Write-Host "   - Add environment variables (same as above)" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Deploy! 🚀" -ForegroundColor White
Write-Host ""
Write-Host "Need detailed instructions? Check VERCEL_SUPABASE_DEPLOYMENT.md" -ForegroundColor Yellow
Write-Host ""
