# ReactiQuiz Mobile App

Flutter mobile application for ReactiQuiz - AI-Powered Educational Quiz Platform.

## Features

- ✅ User Authentication (Login/Register)
- ✅ Secure token storage
- ✅ Theme system (Gray, Dark, Neon)
- ✅ Navigation with Go Router
- ✅ State Management with Provider

## Setup

1. Install Flutter dependencies:
   ```bash
   flutter pub get
   ```

2. Run the app:
   ```bash
   flutter run
   ```

## Project Structure

```
lib/
├── config/
│   ├── app_router.dart      # Navigation routes
│   └── theme_system.dart    # Theme configuration
├── models/                  # Data models
├── providers/               # State management
├── screens/                # UI screens
└── services/                # API client
```

## API Integration

The app connects to: `https://reactiquiz.vercel.app/api`

## Building

### Debug APK
```bash
flutter build apk --debug
```

### Release APK
```bash
flutter build apk --release
```

