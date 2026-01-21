#!/bin/bash
# Build Release APK Script for ReactiQuiz
# This script builds a release APK for Android

echo "Building ReactiQuiz Release APK..."

# Clean the project
echo ""
echo "Step 1: Cleaning project..."
flutter clean

# Get dependencies
echo ""
echo "Step 2: Getting dependencies..."
flutter pub get

# Build release APK
echo ""
echo "Step 3: Building release APK..."
flutter build apk --release

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ Build successful!"
    echo ""
    echo "APK location: build/app/outputs/flutter-apk/app-release.apk"
else
    echo ""
    echo "✗ Build failed!"
    exit 1
fi
