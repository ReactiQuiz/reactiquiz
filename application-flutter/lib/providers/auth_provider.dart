import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:dio/dio.dart';
import 'package:reactiquiz/models/user.dart';
import 'package:reactiquiz/services/api_client.dart';

class AuthProvider with ChangeNotifier {
  User? _user;
  bool _isLoading = false;
  String? _error;
  
  User? get user => _user;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isAuthenticated => _user != null;
  
  final ApiClient _apiClient = ApiClient();
  
  AuthProvider() {
    _loadUserFromStorage();
  }
  
  Future<void> _loadUserFromStorage() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final userJson = prefs.getString('user_data');
      if (userJson != null) {
        // User data exists, verify token is valid
        final token = await _apiClient.getToken();
        if (token != null && token.isNotEmpty) {
          try {
            final response = await _apiClient.getUserProfile();
            if (response.statusCode == 200) {
              final profileData = response.data;
              if (profileData is Map<String, dynamic>) {
                _user = User.fromJson(profileData);
                notifyListeners();
              }
            }
          } catch (e) {
            // Token invalid, clear storage
            await _clearStorage();
          }
        }
      }
    } catch (e) {
      debugPrint('Error loading user: $e');
    }
  }
  
  Future<bool> login(String username, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      debugPrint('Attempting login for username: $username');
      final response = await _apiClient.login(username, password);
      
      debugPrint('Login response status: ${response.statusCode}');
      debugPrint('Login response data type: ${response.data.runtimeType}');
      debugPrint('Login response data: ${response.data}');
      
      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = response.data;
        
        // Handle different response formats
        String? token;
        Map<String, dynamic>? userData;
        
        if (data is Map<String, dynamic>) {
          // Safely get token - check multiple possible keys
          final tokenValue = data['token'] ?? data['accessToken'] ?? data['access_token'];
          token = tokenValue != null ? tokenValue.toString() : null;
          
          debugPrint('Extracted token: ${token != null ? 'Token exists' : 'No token'}');
          
          // Safely get user data - check multiple possible keys
          final userValue = data['user'] ?? data['userData'] ?? data['user_data'];
          if (userValue is Map<String, dynamic>) {
            userData = userValue;
            debugPrint('User data found in response');
          } else {
            debugPrint('No user data in response, will fetch from profile');
          }
          
          // If no user in response, fetch it
          if (userData == null && token != null && token.isNotEmpty) {
            await _apiClient.setToken(token);
            try {
              debugPrint('Fetching user profile...');
              final profileResponse = await _apiClient.getUserProfile();
              debugPrint('Profile response status: ${profileResponse.statusCode}');
              if (profileResponse.statusCode == 200) {
                final profileData = profileResponse.data;
                if (profileData is Map<String, dynamic>) {
                  userData = profileData;
                  debugPrint('User profile fetched successfully');
                }
              }
            } catch (e) {
              debugPrint('Error fetching user profile: $e');
            }
          }
        } else {
          debugPrint('Response data is not a Map: ${data.runtimeType}');
        }
        
        if (token != null && token.isNotEmpty) {
          await _apiClient.setToken(token);
          
          if (userData != null) {
            try {
              _user = User.fromJson(userData);
              await _saveUserToStorage(userData);
              debugPrint('Login successful for user: ${_user?.username}');
            } catch (e) {
              debugPrint('Error parsing user data: $e');
              _error = 'Failed to parse user data';
              _isLoading = false;
              notifyListeners();
              return false;
            }
          } else {
            debugPrint('Warning: No user data available after login');
          }
          
          _isLoading = false;
          notifyListeners();
          return true;
        } else {
          debugPrint('Error: No token in response');
          _error = 'Invalid response from server: No authentication token received';
          _isLoading = false;
          notifyListeners();
          return false;
        }
      } else {
        final errorMsg = response.data is Map
            ? (response.data['message']?.toString() ?? 
               response.data['error']?.toString() ?? 
               'Login failed')
            : 'Login failed';
        debugPrint('Login failed with status ${response.statusCode}: $errorMsg');
        _error = errorMsg;
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } on DioException catch (e) {
      debugPrint('DioException during login: ${e.type}');
      debugPrint('Error message: ${e.message}');
      debugPrint('Response: ${e.response?.data}');
      debugPrint('Status code: ${e.response?.statusCode}');
      
      String errorMsg = 'Login failed. Please try again.';
      
      if (e.type == DioExceptionType.connectionTimeout || 
          e.type == DioExceptionType.receiveTimeout ||
          e.type == DioExceptionType.connectionError) {
        errorMsg = 'Connection timeout. Please check your internet connection.';
      } else if (e.response != null) {
        final statusCode = e.response!.statusCode;
        final responseData = e.response!.data;
        
        if (statusCode == 401 || statusCode == 403) {
          errorMsg = responseData is Map && responseData['message'] != null
              ? responseData['message'].toString()
              : 'Invalid username or password';
        } else if (statusCode == 404) {
          errorMsg = 'Login endpoint not found. Please try again later.';
        } else if (statusCode == 500) {
          errorMsg = 'Server error. Please try again later.';
        } else {
          errorMsg = responseData is Map && responseData['message'] != null
              ? responseData['message'].toString()
              : 'Login failed. Please try again.';
        }
      }
      
      debugPrint('Final error message: $errorMsg');
      _error = errorMsg;
      _isLoading = false;
      notifyListeners();
      return false;
    } catch (e, stackTrace) {
      debugPrint('Unexpected error during login: $e');
      debugPrint('Stack trace: $stackTrace');
      _error = 'Login failed. Please try again.';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }
  
  Future<bool> register({
    required String username,
    required String email,
    required String password,
    required String address,
    required String phone,
    required String className,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      final response = await _apiClient.register({
        'username': username,
        'email': email,
        'password': password,
        'address': address,
        'phone': phone,
        'class': className,
      });
      
      if (response.statusCode == 200 || response.statusCode == 201) {
        // Registration successful, now login
        final loginSuccess = await login(username, password);
        
        if (!loginSuccess) {
          _error = 'Registration successful but login failed. Please try logging in.';
          _isLoading = false;
          notifyListeners();
          return false;
        }
        
        return true;
      } else {
        final errorMsg = response.data?['message']?.toString() ?? 
                        response.data?['error']?.toString() ??
                        'Registration failed';
        _error = errorMsg;
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      String errorMsg = 'Registration failed. Please try again.';
      
      if (e.toString().contains('SocketException')) {
        errorMsg = 'No internet connection';
      } else if (e.toString().contains('409')) {
        errorMsg = 'Username or email already exists';
      } else if (e.toString().contains('422')) {
        errorMsg = 'Invalid registration data';
      }
      
      _error = errorMsg;
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }
  
  Future<void> logout() async {
    _user = null;
    await _clearStorage();
    await _apiClient.clearToken();
    notifyListeners();
  }
  
  Future<void> _saveUserToStorage(Map<String, dynamic> userData) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final userJson = userData.toString(); // Simple storage
      await prefs.setString('user_data', userJson);
    } catch (e) {
      debugPrint('Error saving user: $e');
    }
  }
  
  Future<void> _clearStorage() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('user_data');
    } catch (e) {
      debugPrint('Error clearing storage: $e');
    }
  }
  
  void clearError() {
    _error = null;
    notifyListeners();
  }
}

