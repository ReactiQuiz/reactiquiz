import 'package:flutter/foundation.dart';
import 'package:reactiquiz/models/topic.dart';
import 'package:reactiquiz/services/api_client.dart';

class TopicsProvider with ChangeNotifier {
  final ApiClient _apiClient = ApiClient();
  
  bool _isLoading = false;
  String? _error;
  List<Topic> _topics = [];
  String _subjectId = '';
  String _subjectKey = '';
  String _searchTerm = '';
  String _selectedClass = '';
  String _selectedGenre = '';
  
  bool get isLoading => _isLoading;
  String? get error => _error;
  List<Topic> get topics => _topics;
  String get subjectId => _subjectId;
  String get subjectKey => _subjectKey;
  String get searchTerm => _searchTerm;
  String get selectedClass => _selectedClass;
  String get selectedGenre => _selectedGenre;
  
  List<String> get availableClasses {
    final classes = _topics.map((t) => t.className).where((c) => c.isNotEmpty).toSet().toList();
    classes.sort();
    return classes;
  }
  
  List<String> get availableGenres {
    final genres = _topics.map((t) => t.genre).where((g) => g.isNotEmpty).toSet().toList();
    genres.sort();
    return genres;
  }
  
  List<Topic> get filteredTopics {
    var filtered = _topics;
    
    // Filter by search term
    if (_searchTerm.isNotEmpty) {
      final term = _searchTerm.toLowerCase();
      filtered = filtered.where((topic) {
        return topic.name.toLowerCase().contains(term) ||
               topic.description.toLowerCase().contains(term);
      }).toList();
    }
    
    // Filter by class
    if (_selectedClass.isNotEmpty) {
      filtered = filtered.where((topic) => topic.className == _selectedClass).toList();
    }
    
    // Filter by genre
    if (_selectedGenre.isNotEmpty) {
      filtered = filtered.where((topic) => topic.genre == _selectedGenre).toList();
    }
    
    return filtered;
  }
  
  Future<void> loadTopics({required String subjectId, required String subjectKey}) async {
    if (_subjectId == subjectId && _topics.isNotEmpty && !_isLoading) {
      return; // Already loaded
    }
    
    _isLoading = true;
    _error = null;
    _subjectId = subjectId;
    _subjectKey = subjectKey;
    notifyListeners();
    
    try {
      // API supports /topics/:subjectKey endpoint
      final response = await _apiClient.get('/api/topics/$subjectKey');
      
      // Handle different response formats
      final topicsData = response.data;
      if (topicsData != null) {
        if (topicsData is List) {
          _topics = topicsData.map((t) {
            try {
              if (t is Map<String, dynamic>) {
                return Topic.fromJson(t);
              }
              return null;
            } catch (e) {
              debugPrint('Error parsing topic: $e');
              return null;
            }
          }).whereType<Topic>().toList();
        } else if (topicsData is Map<String, dynamic>) {
          final data = topicsData['data'];
          if (data is List) {
            _topics = data.map((t) {
              try {
                if (t is Map<String, dynamic>) {
                  return Topic.fromJson(t);
                }
                return null;
              } catch (e) {
                debugPrint('Error parsing topic: $e');
                return null;
              }
            }).whereType<Topic>().toList();
          }
        }
      }
      
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      debugPrint('Error loading topics: $e');
      _error = 'Failed to load topics: ${e.toString()}';
      _isLoading = false;
      notifyListeners();
    }
  }
  
  void setSearchTerm(String term) {
    if (_searchTerm != term) {
      _searchTerm = term;
      notifyListeners();
    }
  }
  
  void setSelectedClass(String className) {
    if (_selectedClass != className) {
      _selectedClass = className;
      notifyListeners();
    }
  }
  
  void setSelectedGenre(String genre) {
    if (_selectedGenre != genre) {
      _selectedGenre = genre;
      notifyListeners();
    }
  }
  
  void clearFilters() {
    _searchTerm = '';
    _selectedClass = '';
    _selectedGenre = '';
    notifyListeners();
  }
  
  void clearError() {
    _error = null;
    notifyListeners();
  }
  
  void reset() {
    _topics = [];
    _subjectId = '';
    _subjectKey = '';
    _searchTerm = '';
    _selectedClass = '';
    _selectedGenre = '';
    _error = null;
    _isLoading = false;
    notifyListeners();
  }
}
