# Building Release APK

This guide will help you build a release APK for the ReactiQuiz app.

## Prerequisites

1. Flutter SDK installed and configured
2. Android Studio or Android SDK installed
3. Java JDK 11 or higher installed

## Steps to Build Release APK

### 1. Clean the project
```bash
cd mobile
flutter clean
```

### 2. Get dependencies
```bash
flutter pub get
```

### 3. Build the release APK
```bash
flutter build apk --release
```

The APK will be generated at:
```
mobile/build/app/outputs/flutter-apk/app-release.apk
```

### 4. Build Split APKs (Optional - for smaller file size)
If you want to create split APKs for different architectures (recommended for Play Store):

```bash
flutter build apk --split-per-abi --release
```

This will create separate APKs for:
- `app-armeabi-v7a-release.apk` (32-bit ARM)
- `app-arm64-v8a-release.apk` (64-bit ARM)
- `app-x86_64-release.apk` (64-bit x86)

All APKs will be in:
```
mobile/build/app/outputs/flutter-apk/
```

## Signing the APK (For Production)

For production releases, you should sign your APK with a keystore. Here's how:

### 1. Create a keystore (if you don't have one)
```bash
keytool -genkey -v -keystore ~/upload-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload
```

### 2. Create a key.properties file
Create `mobile/android/key.properties`:
```properties
storePassword=YOUR_STORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=upload
storeFile=YOUR_KEYSTORE_PATH
```

### 3. Update build.gradle.kts
Edit `mobile/android/app/build.gradle.kts` and add signing configuration:

```kotlin
android {
    // ... existing code ...
    
    signingConfigs {
        create("release") {
            val keystorePropertiesFile = rootProject.file("key.properties")
            val keystoreProperties = java.util.Properties()
            keystoreProperties.load(java.io.FileInputStream(keystorePropertiesFile))
            
            keyAlias = keystoreProperties["keyAlias"] as String
            keyPassword = keystoreProperties["keyPassword"] as String
            storeFile = file(keystoreProperties["storeFile"] as String)
            storePassword = keystoreProperties["storePassword"] as String
        }
    }
    
    buildTypes {
        release {
            signingConfig = signingConfigs.getByName("release")
            // Add ProGuard rules if needed
            // minifyEnabled = true
            // proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }
}
```

### 4. Build signed release APK
```bash
flutter build apk --release
```

## App Bundle (For Google Play Store)

If you're publishing to Google Play Store, build an App Bundle instead:

```bash
flutter build appbundle --release
```

The AAB file will be at:
```
mobile/build/app/outputs/bundle/release/app-release.aab
```

## Troubleshooting

### If build fails:
1. Make sure you have the latest Flutter version: `flutter upgrade`
2. Clean and rebuild: `flutter clean && flutter pub get && flutter build apk --release`
3. Check for any errors in the terminal output

### If you get signing errors:
1. Make sure `key.properties` file exists and has correct paths
2. Verify keystore file path is correct
3. Ensure passwords are correct

## Notes

- The app version is defined in `pubspec.yaml` (currently `1.0.0+1`)
- Update the version before building a new release
- The following pages are disabled in this release:
  - AI Center
  - Homi Bhabha
  - Profile
  - Settings
  - About

## Quick Build Command

For a quick release build without signing:
```bash
cd mobile && flutter clean && flutter pub get && flutter build apk --release
```
