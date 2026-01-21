import 'package:dio/dio.dart';
import 'package:dio/io.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiClient {
  static const String baseUrl = 'https://reactiquiz.vercel.app';
  late final Dio _dio;
  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  
  static final ApiClient _instance = ApiClient._internal();
  factory ApiClient() => _instance;
  
  ApiClient._internal() {
    _dio = Dio(
      BaseOptions(
        baseUrl: baseUrl,
        connectTimeout: const Duration(seconds: 60), // Increased timeout
        receiveTimeout: const Duration(seconds: 60), // Increased timeout
        sendTimeout: const Duration(seconds: 60), // Added send timeout
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        validateStatus: (status) {
          // Accept status codes < 500
          return status != null && status < 500;
        },
        // Enable connection pooling and DNS caching
        followRedirects: true,
        maxRedirects: 5,
        // Add DNS resolution hints
        extra: {
          'withCredentials': false,
        },
      ),
    );
    
    // Configure HTTP client adapter for better DNS resolution on mobile platforms
    if (!kIsWeb) {
      try {
        final adapter = _dio.httpClientAdapter;
        if (adapter is DefaultHttpClientAdapter) {
          adapter.onHttpClientCreate = (client) {
            // Configure DNS and connection settings
            client.badCertificateCallback = (cert, host, port) {
              // Only allow in debug mode - should be removed for production
              if (kDebugMode) {
                debugPrint('Allowing certificate for $host:$port in debug mode');
                return true;
              }
              return false;
            };
            // Enable connection pooling and DNS caching
            client.connectionTimeout = const Duration(seconds: 60);
            client.idleTimeout = const Duration(seconds: 30);
            return client;
          };
        }
      } catch (e) {
        debugPrint('Error configuring HTTP client adapter: $e');
      }
    }
    
    _setupInterceptors();
  }
  
  void _setupInterceptors() {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await getToken();
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          debugPrint('API Request: ${options.method} ${options.uri}');
          return handler.next(options);
        },
        onResponse: (response, handler) {
          debugPrint('API Response: ${response.statusCode} ${response.requestOptions.uri}');
          return handler.next(response);
        },
        onError: (error, handler) {
          debugPrint('API Error: ${error.type} - ${error.message}');
          if (error.type == DioExceptionType.connectionTimeout ||
              error.type == DioExceptionType.sendTimeout ||
              error.type == DioExceptionType.receiveTimeout) {
            debugPrint('Connection timeout - URL: ${error.requestOptions.uri}');
          }
          if (error.response?.statusCode == 401) {
            clearToken();
          }
          return handler.next(error);
        },
      ),
    );
  }
  
  Future<void> setToken(String token) async {
    await _storage.write(key: 'auth_token', value: token);
  }
  
  Future<String?> getToken() async {
    return await _storage.read(key: 'auth_token');
  }
  
  Future<void> clearToken() async {
    await _storage.delete(key: 'auth_token');
  }
  
  Future<Response> login(String username, String password) async {
    return await _dio.post('/api/users/login', data: {
      'username': username,
      'password': password,
    });
  }
  
  Future<Response> register(Map<String, dynamic> userData) async {
    return await _dio.post('/api/users/register', data: userData);
  }
  
  Future<Response> getUserProfile() async {
    return await _dio.get('/api/users/me');
  }

  /// Generic HTTP methods
  Future<Response> get(String path, {Map<String, dynamic>? queryParameters}) async {
    return await _dio.get(path, queryParameters: queryParameters);
  }

  Future<Response> post(String path, {dynamic data, Map<String, dynamic>? queryParameters}) async {
    return await _dio.post(path, data: data, queryParameters: queryParameters);
  }

  Future<Response> put(String path, {dynamic data, Map<String, dynamic>? queryParameters}) async {
    return await _dio.put(path, data: data, queryParameters: queryParameters);
  }

  Future<Response> delete(String path, {Map<String, dynamic>? queryParameters}) async {
    return await _dio.delete(path, queryParameters: queryParameters);
  }

  /// Results
  Future<Response> submitQuizResult(Map<String, dynamic> resultData) async {
    return await _dio.post('/api/results', data: resultData);
  }

  Future<Response> getResults() async {
    return await _dio.get('/api/results');
  }

  Future<Response> getResult(String resultId) async {
    return await _dio.get('/api/results/$resultId');
  }

  /// Dashboard Stats
  Future<Response> getUserStats() async {
    return await _dio.get('/api/users/stats');
  }

  /// Quiz Sessions
  Future<Response> createQuizSession(Map<String, dynamic> quizParams) async {
    return await _dio.post('/api/quizSessions', data: quizParams);
  }

  Future<Response> getQuizSession(String sessionId) async {
    return await _dio.get('/api/quizSessions/$sessionId');
  }
}

