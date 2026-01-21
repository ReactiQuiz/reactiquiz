import 'package:flutter/foundation.dart';
import 'package:reactiquiz/models/quiz_result.dart';
import 'package:reactiquiz/models/subject.dart';
import 'package:reactiquiz/services/api_client.dart';
import 'package:intl/intl.dart';

class ResultsProvider with ChangeNotifier {
  final ApiClient _apiClient = ApiClient();
  
  bool _isLoading = false;
  String? _error;
  List<QuizResult> _results = [];
  List<Subject> _subjects = [];
  
  // Filters
  String _subjectFilter = 'all';
  String _difficultyFilter = 'all';
  String _classFilter = 'all';
  String _genreFilter = 'all';
  
  // Sort order: 'newest', 'oldest', 'score-high', 'score-low'
  String _sortOrder = 'newest';
  
  bool get isLoading => _isLoading;
  String? get error => _error;
  List<QuizResult> get results => _results;
  List<Subject> get subjects => _subjects;
  String get subjectFilter => _subjectFilter;
  String get difficultyFilter => _difficultyFilter;
  String get classFilter => _classFilter;
  String get genreFilter => _genreFilter;
  String get sortOrder => _sortOrder;
  
  List<String> get availableSubjects {
    final subjectKeys = _subjects.map((s) => s.subjectKey).where((key) => key.isNotEmpty).toSet().toList();
    return ['all', ...subjectKeys];
  }
  
  List<String> get availableClasses {
    final classes = _results.map((r) {
      // Try to get class from topic or result metadata
      // For now, we'll use empty as we don't have class in QuizResult model
      return '';
    }).where((c) => c.isNotEmpty).toSet().toList();
    classes.sort();
    return classes;
  }
  
  List<String> get availableGenres {
    final genres = _results.map((r) {
      // Try to get genre from topic or result metadata
      // For now, we'll use empty as we don't have genre in QuizResult model
      return '';
    }).where((g) => g.isNotEmpty).toSet().toList();
    genres.sort();
    return genres;
  }
  
  List<QuizResult> get filteredAndSortedResults {
    var filtered = _results;
    
    // Apply filters
    if (_subjectFilter != 'all') {
      filtered = filtered.where((r) => r.subject == _subjectFilter).toList();
    }
    
    if (_difficultyFilter != 'all') {
      if (_difficultyFilter == 'mixed') {
        // Mixed difficulty is a special case - show all results with mixed difficulty
        // For now, we'll filter by checking if difficulty contains "mixed"
        // This may need to be adjusted based on how the API handles mixed difficulty
        filtered = filtered.where((r) => r.difficulty.toLowerCase() == 'mixed').toList();
      } else {
        filtered = filtered.where((r) => r.difficulty.toLowerCase() == _difficultyFilter.toLowerCase()).toList();
      }
    }
    
    // Note: Class and genre filters would require topic data
    // For now, we'll skip them
    
    // Sort results
    final sorted = List<QuizResult>.from(filtered);
    switch (_sortOrder) {
      case 'newest':
        sorted.sort((a, b) {
          try {
            final dateA = DateTime.parse(a.timestamp);
            final dateB = DateTime.parse(b.timestamp);
            return dateB.compareTo(dateA);
          } catch (e) {
            return 0;
          }
        });
        break;
      case 'oldest':
        sorted.sort((a, b) {
          try {
            final dateA = DateTime.parse(a.timestamp);
            final dateB = DateTime.parse(b.timestamp);
            return dateA.compareTo(dateB);
          } catch (e) {
            return 0;
          }
        });
        break;
      case 'score-high':
        sorted.sort((a, b) => b.percentage.compareTo(a.percentage));
        break;
      case 'score-low':
        sorted.sort((a, b) => a.percentage.compareTo(b.percentage));
        break;
    }
    
    return sorted;
  }
  
  Future<void> loadResults() async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      final resultsResponse = await _apiClient.getResults();
      final subjectsResponse = await _apiClient.get('/api/subjects');
      
      // Parse results
      final resultsData = resultsResponse.data;
      if (resultsData != null) {
        if (resultsData is List) {
          _results = resultsData.map((r) {
            try {
              if (r is Map<String, dynamic>) {
                final result = QuizResult.fromJson(r);
                // If subject is missing, try to enrich it
                if (result.subject.isEmpty) {
                  // Try to get subject from topic name or use default
                  // This is a fallback - ideally the API should provide subject
                  return QuizResult(
                    id: result.id,
                    userId: result.userId,
                    topicId: result.topicId,
                    topicName: result.topicName,
                    subject: _deriveSubjectFromTopicName(result.topicName),
                    difficulty: result.difficulty,
                    totalQuestions: result.totalQuestions,
                    correctAnswers: result.correctAnswers,
                    score: result.score,
                    percentage: result.percentage,
                    timeSpent: result.timeSpent,
                    timestamp: result.timestamp,
                    questionsActuallyAttemptedIds: result.questionsActuallyAttemptedIds,
                    userAnswersSnapshot: result.userAnswersSnapshot,
                    questions: result.questions,
                  );
                }
                return result;
              }
              return null;
            } catch (e) {
              debugPrint('Error parsing result: $e');
              return null;
            }
          }).whereType<QuizResult>().toList();
        } else if (resultsData is Map<String, dynamic>) {
          final data = resultsData['data'];
          if (data is List) {
            _results = data.map((r) {
              try {
                if (r is Map<String, dynamic>) {
                  final result = QuizResult.fromJson(r);
                  // If subject is missing, try to enrich it
                  if (result.subject.isEmpty) {
                    return QuizResult(
                      id: result.id,
                      userId: result.userId,
                      topicId: result.topicId,
                      topicName: result.topicName,
                      subject: _deriveSubjectFromTopicName(result.topicName),
                      difficulty: result.difficulty,
                      totalQuestions: result.totalQuestions,
                      correctAnswers: result.correctAnswers,
                      score: result.score,
                      percentage: result.percentage,
                      timeSpent: result.timeSpent,
                      timestamp: result.timestamp,
                      questionsActuallyAttemptedIds: result.questionsActuallyAttemptedIds,
                      userAnswersSnapshot: result.userAnswersSnapshot,
                      questions: result.questions,
                    );
                  }
                  return result;
                }
                return null;
              } catch (e) {
                debugPrint('Error parsing result: $e');
                return null;
              }
            }).whereType<QuizResult>().toList();
          }
        }
      }
      
      // Parse subjects
      final subjectsData = subjectsResponse.data;
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
      
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      debugPrint('Error loading results: $e');
      _error = 'Failed to load results: ${e.toString()}';
      _isLoading = false;
      notifyListeners();
    }
  }
  
  void setSubjectFilter(String value) {
    if (_subjectFilter != value) {
      _subjectFilter = value;
      notifyListeners();
    }
  }
  
  void setDifficultyFilter(String value) {
    if (_difficultyFilter != value) {
      _difficultyFilter = value;
      notifyListeners();
    }
  }
  
  void setClassFilter(String value) {
    if (_classFilter != value) {
      _classFilter = value;
      notifyListeners();
    }
  }
  
  void setGenreFilter(String value) {
    if (_genreFilter != value) {
      _genreFilter = value;
      notifyListeners();
    }
  }
  
  void setSortOrder(String value) {
    if (_sortOrder != value) {
      _sortOrder = value;
      notifyListeners();
    }
  }
  
  void clearFilters() {
    _subjectFilter = 'all';
    _difficultyFilter = 'all';
    _classFilter = 'all';
    _genreFilter = 'all';
    _sortOrder = 'newest';
    notifyListeners();
  }
  
  String formatTimestamp(String timestamp) {
    try {
      final date = DateTime.parse(timestamp);
      final now = DateTime.now();
      final difference = now.difference(date);
      
      if (difference.inDays == 0) {
        if (difference.inHours == 0) {
          if (difference.inMinutes == 0) {
            return 'Just now';
          }
          return '${difference.inMinutes}m ago';
        }
        return '${difference.inHours}h ago';
      } else if (difference.inDays < 7) {
        return '${difference.inDays}d ago';
      } else {
        return DateFormat('MMM dd, yyyy').format(date);
      }
    } catch (e) {
      return timestamp;
    }
  }
  
  // Helper method to derive subject from topic name
  String _deriveSubjectFromTopicName(String topicName) {
    final lowerTopicName = topicName.toLowerCase();
    // Try to match topic name patterns to subject
    if (lowerTopicName.contains('electricity') || lowerTopicName.contains('magnetism') || 
        lowerTopicName.contains('physics') || lowerTopicName.contains('force') ||
        lowerTopicName.contains('motion') || lowerTopicName.contains('energy')) {
      return 'physics';
    } else if (lowerTopicName.contains('chemistry') || lowerTopicName.contains('compound') ||
               lowerTopicName.contains('reaction') || lowerTopicName.contains('molecule')) {
      return 'chemistry';
    } else if (lowerTopicName.contains('biology') || lowerTopicName.contains('cell') ||
               lowerTopicName.contains('nutrition') || lowerTopicName.contains('diet') ||
               lowerTopicName.contains('organism')) {
      return 'biology';
    } else if (lowerTopicName.contains('math') || lowerTopicName.contains('algebra') ||
               lowerTopicName.contains('geometry') || lowerTopicName.contains('calculus')) {
      return 'mathematics';
    }
    // Default to physics if cannot determine
    return 'physics';
  }
}
