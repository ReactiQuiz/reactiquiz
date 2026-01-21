import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:reactiquiz/config/theme_system.dart';

class ThemeProvider extends ChangeNotifier {
  AppThemeMode _currentTheme = AppThemeMode.gray;

  ThemeProvider() {
    _loadTheme();
  }

  AppThemeMode get currentTheme => _currentTheme;

  void setTheme(AppThemeMode theme) {
    if (_currentTheme != theme) {
      _currentTheme = theme;
      _saveTheme(theme);
      notifyListeners();
    }
  }

  ThemeData get currentThemeData => ThemeSystem.getThemeData(_currentTheme);

  Map<String, Color> get currentColors => ThemeSystem.getColors(_currentTheme);

  Future<void> _loadTheme() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final themeString = prefs.getString('appThemeMode') ?? 'gray';
      _currentTheme = AppThemeMode.values.firstWhere(
        (e) => e.toString().split('.').last == themeString,
        orElse: () => AppThemeMode.gray,
      );
      notifyListeners();
    } catch (e) {
      _currentTheme = AppThemeMode.gray;
      notifyListeners();
    }
  }

  Future<void> _saveTheme(AppThemeMode themeMode) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('appThemeMode', themeMode.toString().split('.').last);
    } catch (e) {
      // Ignore save errors
    }
  }
}

