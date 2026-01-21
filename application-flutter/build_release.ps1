# Build Release APK Script for ReactiQuiz
# This script builds a release APK for Android

Write-Host "Building ReactiQuiz Release APK..." -ForegroundColor Green

# Clean the project
Write-Host "`nStep 1: Cleaning project..." -ForegroundColor Yellow
flutter clean

# Get dependencies
Write-Host "`nStep 2: Getting dependencies..." -ForegroundColor Yellow
flutter pub get

# Build release APK
Write-Host "`nStep 3: Building release APK..." -ForegroundColor Yellow
flutter build apk --release

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✓ Build successful!" -ForegroundColor Green
    Write-Host "`nAPK location: build/app/outputs/flutter-apk/app-release.apk" -ForegroundColor Cyan
} else {
    Write-Host "`n✗ Build failed!" -ForegroundColor Red
    exit 1
}
