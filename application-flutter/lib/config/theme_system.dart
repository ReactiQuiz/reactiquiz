import 'package:flutter/material.dart';

enum AppThemeMode { gray, dark, neon }

class ThemeSystem {
  static const Map<String, Color> grayColors = {
    'background': Color(0xFF2C2C2C),
    'card': Color(0xFF3A3A3A),
    'text': Color(0xFFE0E0E0),
    'textSecondary': Color(0xFFB0B0B0),
    'primary': Color(0xFF667eea),
    'accent': Color(0xFF6A6A6A),
    'error': Color(0xFFD32F2F),
    'border': Color(0xFF555555),
    'surface': Color(0xFF333333),
    'drawer': Color(0xFF2A2A2A),
    'drawerHeader': Color(0xFF1A1A1A),
    'selectedItem': Color(0xFF4A4A4A),
    'unselectedItem': Colors.transparent,
  };

  static const Map<String, Color> darkColors = {
    'background': Color(0xFF121212),
    'card': Color(0xFF1E1E1E),
    'text': Colors.white,
    'textSecondary': Color(0xFFB0B0B0),
    'primary': Color(0xFF2196F3),
    'accent': Color(0xFF4CAF50),
    'error': Color(0xFFEF5350),
    'border': Color(0xFF333333),
    'surface': Color(0xFF1E1E1E),
    'drawer': Color(0xFF1A1A1A),
    'drawerHeader': Color(0xFF1976D2),
    'selectedItem': Color(0xFF2A2A2A),
    'unselectedItem': Colors.transparent,
  };

  static const Map<String, Color> neonColors = {
    'background': Color(0xFF000000),
    'card': Color(0xFF0A0A0A),
    'text': Color(0xFF00FFFF),
    'textSecondary': Color(0xFF00AAFF),
    'primary': Color(0xFF00FFFF),
    'accent': Color(0xFFCC00FF),
    'error': Color(0xFFFF00FF),
    'border': Color(0xFF005555),
    'surface': Color(0xFF0A0A0A),
    'drawer': Color(0xFF000000),
    'drawerHeader': Color(0xFF00FFFF),
    'selectedItem': Color(0xFF001111),
    'unselectedItem': Colors.transparent,
  };

  static Map<String, Color> getColors(AppThemeMode mode) {
    switch (mode) {
      case AppThemeMode.gray:
        return grayColors;
      case AppThemeMode.dark:
        return darkColors;
      case AppThemeMode.neon:
        return neonColors;
    }
  }

  static ThemeData getThemeData(AppThemeMode mode) {
    final colors = getColors(mode);
    final isLight = mode == AppThemeMode.gray;
    
    return ThemeData(
      useMaterial3: true,
      brightness: isLight ? Brightness.light : Brightness.dark,
      scaffoldBackgroundColor: colors['background'],
      cardColor: colors['card'],
      dividerColor: colors['border'],
      colorScheme: ColorScheme.fromSeed(
        seedColor: colors['primary']!,
        brightness: isLight ? Brightness.light : Brightness.dark,
        surface: colors['surface']!,
        onSurface: colors['text']!,
        primary: colors['primary']!,
        onPrimary: Colors.white,
        secondary: colors['accent']!,
        onSecondary: Colors.white,
        error: colors['error']!,
        onError: Colors.white,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: colors['card'],
        foregroundColor: colors['text'],
        iconTheme: IconThemeData(color: colors['text']),
        titleTextStyle: TextStyle(
          color: colors['text'], 
          fontSize: 20, 
          fontWeight: FontWeight.bold
        ),
        elevation: 0,
      ),
      cardTheme: CardThemeData(
        color: colors['card'],
        elevation: 2,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
      textTheme: TextTheme(
        bodyLarge: TextStyle(color: colors['text']),
        bodyMedium: TextStyle(color: colors['textSecondary']),
        headlineSmall: TextStyle(color: colors['text']),
        titleLarge: TextStyle(color: colors['text']),
        titleMedium: TextStyle(color: colors['text']),
        titleSmall: TextStyle(color: colors['textSecondary']),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: colors['primary'],
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: colors['primary'],
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: colors['surface'],
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: colors['border']!),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: colors['border']!),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: colors['primary']!, width: 2),
        ),
      ),
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        backgroundColor: colors['card'],
        selectedItemColor: colors['primary'],
        unselectedItemColor: colors['textSecondary'],
        type: BottomNavigationBarType.fixed,
      ),
      drawerTheme: DrawerThemeData(
        backgroundColor: colors['drawer'],
      ),
    );
  }

  static const Map<String, Color> subjectColors = {
    'physics': Color(0xFF2196F3),
    'chemistry': Color(0xFFF44336),
    'biology': Color(0xFF4CAF50),
    'mathematics': Color(0xFFFF9800),
    'math': Color(0xFFFF9800),
    'gk': Color(0xFFFFEB3B),
    'general knowledge': Color(0xFFFFEB3B),
    'general': Color(0xFF2196F3),
    'english': Color(0xFF9C27B0),
  };

  static Color getSubjectColor(String subjectKey) {
    final key = subjectKey.toLowerCase().trim();
    // Try exact match first
    if (subjectColors.containsKey(key)) {
      return subjectColors[key]!;
    }
    // Try partial matches
    for (final entry in subjectColors.entries) {
      if (key.contains(entry.key) || entry.key.contains(key)) {
        return entry.value;
      }
    }
    // Default to physics blue
    return subjectColors['physics']!;
  }

  static const Map<String, Color> difficultyColors = {
    'easy': Color(0xFF4CAF50),
    'medium': Color(0xFFFF9800),
    'hard': Color(0xFFF44336),
  };

  static Color getDifficultyColor(String difficulty) {
    return difficultyColors[difficulty.toLowerCase()] ?? difficultyColors['medium']!;
  }
}

