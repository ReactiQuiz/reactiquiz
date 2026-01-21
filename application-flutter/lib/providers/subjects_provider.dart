import 'package:flutter/foundation.dart';
import 'package:reactiquiz/models/subject.dart';
import 'package:reactiquiz/services/api_client.dart';

class SubjectsProvider with ChangeNotifier {
  final ApiClient _apiClient = ApiClient();
  
  bool _isLoading = false;
  String? _error;
  List<Subject> _subjects = [];
  String _searchTerm = '';
  
  bool get isLoading => _isLoading;
  String? get error => _error;
  List<Subject> get subjects => _subjects;
  String get searchTerm => _searchTerm;
  
  List<Subject> get filteredSubjects {
    if (_searchTerm.isEmpty) return _subjects;
    final term = _searchTerm.toLowerCase();
    return _subjects.where((subject) {
      return subject.name.toLowerCase().contains(term) ||
             subject.subjectKey.toLowerCase().contains(term) ||
             subject.description.toLowerCase().contains(term);
    }).toList();
  }
  
  Future<bool> loadSubjects() async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      final response = await _apiClient.get('/api/subjects');
      
      // Handle different response formats
      final subjectsData = response.data;
      if (subjectsData != null) {
        if (subjectsData is List) {
          _subjects = subjectsData.map((s) {
            try {
              if (s is Map<String, dynamic>) {
                return Subject.fromJson(s);
              }
              return null;
            } catch (e) {
              debugPrint('Error parsing subject: $e');
              return null;
            }
          }).whereType<Subject>().toList();
        } else if (subjectsData is Map<String, dynamic>) {
          final data = subjectsData['data'];
          if (data is List) {
            _subjects = data.map((s) {
              try {
                if (s is Map<String, dynamic>) {
                  return Subject.fromJson(s);
                }
                return null;
              } catch (e) {
                debugPrint('Error parsing subject: $e');
                return null;
              }
            }).whereType<Subject>().toList();
          }
        }
      }
      
      // Sort by displayOrder
      _subjects.sort((a, b) => a.displayOrder.compareTo(b.displayOrder));
      
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      debugPrint('Error loading subjects: $e');
      _error = 'Failed to load subjects: ${e.toString()}';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }
  
  void setSearchTerm(String term) {
    if (_searchTerm != term) {
      _searchTerm = term;
      notifyListeners();
    }
  }
  
  void clearError() {
    _error = null;
    notifyListeners();
  }
}
