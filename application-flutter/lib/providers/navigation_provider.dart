import 'package:flutter/material.dart';

class NavigationProvider extends ChangeNotifier {
  int _currentBottomNavIndex = 0;
  String _currentRoute = 'home';

  int get currentBottomNavIndex => _currentBottomNavIndex;
  String get currentRoute => _currentRoute;

  void setBottomNavIndex(int index) {
    if (_currentBottomNavIndex != index) {
      _currentBottomNavIndex = index;
      _updateRouteFromBottomNav(index);
      notifyListeners();
    }
  }

  void setRoute(String route) {
    if (_currentRoute != route) {
      _currentRoute = route;
      _updateBottomNavFromRoute(route);
      notifyListeners();
    }
  }

  void _updateRouteFromBottomNav(int index) {
    switch (index) {
      case 0:
        _currentRoute = 'home';
        break;
      case 1:
        _currentRoute = 'dashboard';
        break;
      case 2:
        _currentRoute = 'profile';
        break;
    }
  }

  void _updateBottomNavFromRoute(String route) {
    switch (route) {
      case 'home':
        _currentBottomNavIndex = 0;
        break;
      case 'dashboard':
        _currentBottomNavIndex = 1;
        break;
      case 'profile':
        _currentBottomNavIndex = 2;
        break;
      default:
        break;
    }
  }

  bool isRouteActive(String route) {
    return _currentRoute == route;
  }
}

