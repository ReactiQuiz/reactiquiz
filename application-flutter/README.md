# ReactiQuiz Flutter Application

Cross-platform mobile application for ReactiQuiz built with Flutter.

## Features

- User authentication
- Subject and topic browsing
- Interactive quizzes
- Performance dashboard
- Results tracking
- Flashcards system
- Multiple themes (Gray, Dark, Neon)
- Offline support

## Tech Stack

- **Framework**: Flutter
- **State Management**: Provider
- **Navigation**: GoRouter
- **HTTP Client**: Dio
- **Local Storage**: Shared Preferences
- **Platform**: Android, iOS, Web, Windows, Linux, macOS

## Getting Started

### Prerequisites

- Flutter SDK (latest stable version)
- Android Studio / Xcode (for mobile development)
- Dart SDK (comes with Flutter)

### Installation

```bash
flutter pub get
```

### Running

#### Android
```bash
flutter run
```

#### iOS
```bash
flutter run -d ios
```

#### Web
```bash
flutter run -d chrome
```

### Building Release APK

#### Android
```bash
flutter build apk --release
```

#### iOS
```bash
flutter build ios --release
```

## Project Structure

- `lib/` - Dart source code
  - `main.dart` - Application entry point
  - `screens/` - Screen widgets
  - `widgets/` - Reusable widgets
  - `providers/` - State management providers
  - `models/` - Data models
  - `services/` - Service classes (API client, etc.)
  - `config/` - Configuration files (routing, themes)
- `assets/` - Images and other assets
- `android/` - Android-specific configuration
- `ios/` - iOS-specific configuration
- `web/` - Web-specific configuration

## Configuration

### API Base URL

The API base URL is configured in `lib/services/api_client.dart`. Default is `https://reactiquiz.vercel.app`.

### Environment Variables

No environment variables needed for mobile app. All configuration is in code.

## Building Release APK

See `BUILD_RELEASE.md` for detailed instructions on building release APKs.
