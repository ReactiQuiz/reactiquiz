import 'package:flutter/foundation.dart';
import 'package:reactiquiz/models/quiz_result.dart';
import 'package:reactiquiz/models/subject.dart';
import 'package:reactiquiz/services/api_client.dart';

class DashboardStats {
  final int totalQuizzes;
  final double overallAverageScore;
  final int totalQuestions;
  final int correctAnswers;
  final double accuracy;
  final Map<String, SubjectStats> subjectBreakdowns;
  final Map<String, DifficultyStats> overallDifficultyPerformance;
  final List<RollingAverageData> rollingAverageData;

  DashboardStats({
    required this.totalQuizzes,
    required this.overallAverageScore,
    required this.totalQuestions,
    required this.correctAnswers,
    required this.accuracy,
    required this.subjectBreakdowns,
    required this.overallDifficultyPerformance,
    required this.rollingAverageData,
  });
}

class SubjectStats {
  final String name;
  final int count;
  final double average;
  final int totalQuestions;
  final int totalCorrect;
  final Map<String, DifficultyStats> difficultyPerformance;

  SubjectStats({
    required this.name,
    required this.count,
    required this.average,
    required this.totalQuestions,
    required this.totalCorrect,
    required this.difficultyPerformance,
  });
}

class DifficultyStats {
  final int correct;
  final int total;
  final double percentage;

  DifficultyStats({
    required this.correct,
    required this.total,
    required this.percentage,
  });
}

class RollingAverageData {
  final String date;
  final double averageScore;

  RollingAverageData({
    required this.date,
    required this.averageScore,
  });
}

class DashboardProvider with ChangeNotifier {
  final ApiClient _apiClient = ApiClient();
  
  bool _isLoading = false;
  String? _error;
  DashboardStats? _stats;
  List<QuizResult> _results = [];
  List<Subject> _subjects = [];
  
  // Filters
  String _timeFilter = 'month'; // week, month, quarter, year, all
  String _subjectFilter = 'all';
  
  bool get isLoading => _isLoading;
  String? get error => _error;
  DashboardStats? get stats => _stats;
  List<QuizResult> get results => _results;
  List<Subject> get subjects => _subjects;
  String get timeFilter => _timeFilter;
  String get subjectFilter => _subjectFilter;
  List<String> get availableSubjects {
    // Always include 'all' option
    final subjectKeys = _subjects.map((s) => s.subjectKey).where((key) => key.isNotEmpty).toSet().toList();
    // If no subjects, still show 'all' option for filtering
    return ['all', ...subjectKeys];
  }
  
  DashboardProvider() {
    loadDashboardData();
  }
  
  Future<void> loadDashboardData() async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      final resultsResponse = await _apiClient.get('/api/results');
      final subjectsResponse = await _apiClient.get('/api/subjects');
      
      // Debug: Print response structure
      debugPrint('Results response status: ${resultsResponse.statusCode}');
      debugPrint('Results response data type: ${resultsResponse.data.runtimeType}');
      debugPrint('Results data: ${resultsResponse.data}');
      
      debugPrint('Subjects response status: ${subjectsResponse.statusCode}');
      debugPrint('Subjects response data type: ${subjectsResponse.data.runtimeType}');
      debugPrint('Subjects data: ${subjectsResponse.data}');
      
      // Parse results - handle different response formats
      final resultsData = resultsResponse.data;
      if (resultsData != null) {
        if (resultsData is List) {
          debugPrint('Results is a List with ${resultsData.length} items');
          _results = resultsData.map((r) {
            try {
              if (r is Map<String, dynamic>) {
                return QuizResult.fromJson(r);
              }
              debugPrint('Result item is not Map: ${r.runtimeType}');
              return null;
            } catch (e) {
              debugPrint('Error parsing result: $e');
              return null;
            }
          }).whereType<QuizResult>().toList();
          debugPrint('Parsed ${_results.length} results');
        } else if (resultsData is Map<String, dynamic>) {
          // Handle wrapped response
          final data = resultsData['data'];
          if (data is List) {
            debugPrint('Results wrapped in data object, ${data.length} items');
            _results = data.map((r) {
              try {
                if (r is Map<String, dynamic>) {
                  return QuizResult.fromJson(r);
                }
                return null;
              } catch (e) {
                debugPrint('Error parsing result: $e');
                return null;
              }
            }).whereType<QuizResult>().toList();
          } else {
            debugPrint('Results data is Map but no data key with List');
          }
        } else {
          debugPrint('Results data is unexpected type: ${resultsData.runtimeType}');
        }
      } else {
        debugPrint('Results data is null');
      }
      
      // Parse subjects - handle different response formats
      final subjectsData = subjectsResponse.data;
      if (subjectsData != null) {
        if (subjectsData is List) {
          debugPrint('Subjects is a List with ${subjectsData.length} items');
          _subjects = subjectsData.map((s) {
            try {
              if (s is Map<String, dynamic>) {
                return Subject.fromJson(s);
              }
              debugPrint('Subject item is not Map: ${s.runtimeType}');
              return null;
            } catch (e) {
              debugPrint('Error parsing subject: $e');
              return null;
            }
          }).whereType<Subject>().toList();
          debugPrint('Parsed ${_subjects.length} subjects');
        } else if (subjectsData is Map<String, dynamic>) {
          // Handle wrapped response
          final data = subjectsData['data'];
          if (data is List) {
            debugPrint('Subjects wrapped in data object, ${data.length} items');
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
          } else {
            debugPrint('Subjects data is Map but no data key with List');
          }
        } else {
          debugPrint('Subjects data is unexpected type: ${subjectsData.runtimeType}');
        }
      } else {
        debugPrint('Subjects data is null');
      }
      
      debugPrint('Final results count: ${_results.length}, subjects count: ${_subjects.length}');
      
      _calculateStats();
      
      _isLoading = false;
      notifyListeners();
    } catch (e, stackTrace) {
      debugPrint('Dashboard load error: $e');
      debugPrint('Stack trace: $stackTrace');
      _error = 'Failed to load dashboard data: ${e.toString()}';
      _isLoading = false;
      notifyListeners();
    }
  }
  
  void setTimeFilter(String filter) {
    if (_timeFilter != filter) {
      _timeFilter = filter;
      _calculateStats();
      notifyListeners();
    }
  }
  
  void setSubjectFilter(String filter) {
    if (_subjectFilter != filter) {
      _subjectFilter = filter;
      _calculateStats();
      notifyListeners();
    }
  }
  
  void _calculateStats() {
    // Always calculate stats, even if empty - filters should work regardless
    // Filter by time
    List<QuizResult> filtered = _filterByTime(_results);
    
    // Filter by subject
    if (_subjectFilter != 'all') {
      filtered = filtered.where((r) => r.subject == _subjectFilter).toList();
    }
    
    // If no results after filtering, show empty stats
    if (filtered.isEmpty) {
      _stats = DashboardStats(
        totalQuizzes: 0,
        overallAverageScore: 0.0,
        totalQuestions: 0,
        correctAnswers: 0,
        accuracy: 0.0,
        subjectBreakdowns: {},
        overallDifficultyPerformance: {
          'easy': DifficultyStats(correct: 0, total: 0, percentage: 0.0),
          'medium': DifficultyStats(correct: 0, total: 0, percentage: 0.0),
          'hard': DifficultyStats(correct: 0, total: 0, percentage: 0.0),
        },
        rollingAverageData: _calculateRollingAverages(filtered),
      );
      return;
    }
    
    // Calculate overall stats
    final totalQuizzes = filtered.length;
    final overallAverageScore = totalQuizzes > 0
        ? filtered.map((r) => r.percentage).reduce((a, b) => a + b) / totalQuizzes
        : 0.0;
    
    final totalQuestions = filtered.map((r) => r.totalQuestions).fold(0, (a, b) => a + b);
    final correctAnswers = filtered.map((r) => r.correctAnswers).fold(0, (a, b) => a + b);
    final accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0.0;
    
    // Subject breakdowns
    final subjectBreakdowns = <String, SubjectStats>{};
    final subjectResults = <String, List<QuizResult>>{};
    
    // Helper to normalize subject key
    String _normalizeSubjectKey(String subject) {
      if (subject.isEmpty) return 'general';
      final normalized = subject.toLowerCase().trim();
      // Map common variations
      if (normalized == 'physics' || normalized.contains('physics')) return 'physics';
      if (normalized == 'chemistry' || normalized.contains('chemistry')) return 'chemistry';
      if (normalized == 'biology' || normalized.contains('biology')) return 'biology';
      if (normalized == 'mathematics' || normalized == 'math' || normalized.contains('math')) return 'mathematics';
      if (normalized == 'gk' || normalized == 'general knowledge' || normalized.contains('general knowledge')) return 'general knowledge';
      if (normalized == 'general') return 'general';
      return normalized;
    }
    
    for (final result in filtered) {
      // Normalize subject key to ensure consistent grouping
      final normalizedSubject = _normalizeSubjectKey(result.subject);
      if (!subjectResults.containsKey(normalizedSubject)) {
        subjectResults[normalizedSubject] = [];
      }
      subjectResults[normalizedSubject]!.add(result);
    }
    
    for (final entry in subjectResults.entries) {
      final subjectKey = entry.key;
      final results = entry.value;
      final count = results.length;
      final average = count > 0
          ? results.map((r) => r.percentage).reduce((a, b) => a + b) / count
          : 0.0;
      final totalQuestions = results.map((r) => r.totalQuestions).fold(0, (a, b) => a + b);
      final totalCorrect = results.map((r) => r.correctAnswers).fold(0, (a, b) => a + b);
      
      // Calculate difficulty performance for this subject
      final difficultyPerformance = _calculateDifficultyStats(results);
      
      subjectBreakdowns[subjectKey] = SubjectStats(
        name: subjectKey,
        count: count,
        average: average,
        totalQuestions: totalQuestions,
        totalCorrect: totalCorrect,
        difficultyPerformance: difficultyPerformance,
      );
    }
    
    // Sort subject breakdowns by name for consistent display
    final sortedBreakdowns = Map.fromEntries(
      subjectBreakdowns.entries.toList()..sort((a, b) => a.key.compareTo(b.key))
    );
    
    // Overall difficulty performance
    final overallDifficultyPerformance = _calculateDifficultyStats(filtered);
    
    // Rolling average (30 days)
    final rollingAverageData = _calculateRollingAverages(filtered);
    
    _stats = DashboardStats(
      totalQuizzes: totalQuizzes,
      overallAverageScore: overallAverageScore,
      totalQuestions: totalQuestions,
      correctAnswers: correctAnswers,
      accuracy: accuracy,
      subjectBreakdowns: sortedBreakdowns,
      overallDifficultyPerformance: overallDifficultyPerformance,
      rollingAverageData: rollingAverageData,
    );
  }
  
  List<QuizResult> _filterByTime(List<QuizResult> results) {
    final now = DateTime.now();
    DateTime? startDate;
    
    switch (_timeFilter) {
      case 'week':
        startDate = now.subtract(const Duration(days: 7));
        break;
      case 'month':
        startDate = now.subtract(const Duration(days: 30));
        break;
      case 'quarter':
        startDate = now.subtract(const Duration(days: 90));
        break;
      case 'year':
        startDate = now.subtract(const Duration(days: 365));
        break;
      case 'all':
      default:
        startDate = null;
    }
    
    if (startDate == null) {
      return results;
    }
    
    return results.where((result) {
      try {
        final timestamp = DateTime.parse(result.timestamp);
        return timestamp.isAfter(startDate!) || timestamp.isAtSameMomentAs(startDate!);
      } catch (e) {
        return false;
      }
    }).toList();
  }
  
  Map<String, DifficultyStats> _calculateDifficultyStats(List<QuizResult> results) {
    final easy = <String, int>{'correct': 0, 'total': 0};
    final medium = <String, int>{'correct': 0, 'total': 0};
    final hard = <String, int>{'correct': 0, 'total': 0};
    
    for (final result in results) {
      final difficulty = result.difficulty.toLowerCase();
      final stats = difficulty == 'easy'
          ? easy
          : (difficulty == 'hard' ? hard : medium);
      
      stats['total'] = (stats['total'] ?? 0) + result.totalQuestions;
      stats['correct'] = (stats['correct'] ?? 0) + result.correctAnswers;
    }
    
    final easyCorrect = easy['correct'] ?? 0;
    final easyTotal = easy['total'] ?? 0;
    final mediumCorrect = medium['correct'] ?? 0;
    final mediumTotal = medium['total'] ?? 0;
    final hardCorrect = hard['correct'] ?? 0;
    final hardTotal = hard['total'] ?? 0;
    
    return {
      'easy': DifficultyStats(
        correct: easyCorrect,
        total: easyTotal,
        percentage: easyTotal > 0 ? (easyCorrect / easyTotal) * 100 : 0.0,
      ),
      'medium': DifficultyStats(
        correct: mediumCorrect,
        total: mediumTotal,
        percentage: mediumTotal > 0 ? (mediumCorrect / mediumTotal) * 100 : 0.0,
      ),
      'hard': DifficultyStats(
        correct: hardCorrect,
        total: hardTotal,
        percentage: hardTotal > 0 ? (hardCorrect / hardTotal) * 100 : 0.0,
      ),
    };
  }
  
  List<RollingAverageData> _calculateRollingAverages(List<QuizResult> results) {
    final averages = <RollingAverageData>[];
    final now = DateTime.now();
    
    for (int i = 29; i >= 0; i--) {
      final date = now.subtract(Duration(days: i));
      final dateStr = '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
      
      final dayResults = results.where((r) {
        try {
          final timestamp = DateTime.parse(r.timestamp);
          final resultDate = '${timestamp.year}-${timestamp.month.toString().padLeft(2, '0')}-${timestamp.day.toString().padLeft(2, '0')}';
          return resultDate == dateStr;
        } catch (e) {
          return false;
        }
      }).toList();
      
      final average = dayResults.isEmpty
          ? 0.0
          : dayResults.map((r) => r.percentage).reduce((a, b) => a + b) / dayResults.length;
      
      averages.add(RollingAverageData(
        date: dateStr,
        averageScore: average,
      ));
    }
    
    return averages;
  }
  
  void clearError() {
    _error = null;
    notifyListeners();
  }
}

