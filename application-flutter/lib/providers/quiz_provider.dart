import 'package:flutter/foundation.dart';
import 'package:reactiquiz/models/question.dart';
import 'package:reactiquiz/services/api_client.dart';
import 'dart:convert';

class QuizSession {
  final List<Question> questions;
  final String topicId;
  final String topicName;
  final String subject;
  final String difficulty;
  final int timeLimit;
  final String? accentColor;

  QuizSession({
    required this.questions,
    required this.topicId,
    required this.topicName,
    required this.subject,
    required this.difficulty,
    required this.timeLimit,
    this.accentColor,
  });
}

class QuizProvider with ChangeNotifier {
  final ApiClient _apiClient = ApiClient();
  
  bool _isLoading = false;
  String? _error;
  QuizSession? _session;
  List<Question> _questions = [];
  Map<String, int> _userAnswers = {}; // questionId -> optionIndex
  int _elapsedTime = 0; // seconds
  bool _timerActive = false;
  bool _isSubmitting = false;
  String? _sessionId;
  
  // Quiz context
  String _topicId = '';
  String _topicName = '';
  String _subject = '';
  String _difficulty = '';
  int _timeLimit = 0;
  String? _accentColor;
  
  bool get isLoading => _isLoading;
  String? get error => _error;
  QuizSession? get session => _session;
  List<Question> get questions => _questions;
  Map<String, int> get userAnswers => _userAnswers;
  int get elapsedTime => _elapsedTime;
  bool get timerActive => _timerActive;
  bool get isSubmitting => _isSubmitting;
  
  String get topicId => _topicId;
  String get topicName => _topicName;
  String get subject => _subject;
  String get difficulty => _difficulty;
  int get timeLimit => _timeLimit;
  String? get accentColor => _accentColor;
  
  /// Create a new quiz session
  Future<String?> createQuizSession({
    required String topicId,
    required String difficulty,
    int numQuestions = 10,
    String? quizClass,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      final response = await _apiClient.createQuizSession({
        'topicId': topicId,
        'difficulty': difficulty,
        'numQuestions': numQuestions,
        if (quizClass != null) 'class': quizClass,
      });
      
      if (response.statusCode == 201) {
        _sessionId = response.data['sessionId'] as String?;
        _isLoading = false;
        notifyListeners();
        return _sessionId;
      } else {
        _error = 'Failed to create quiz session';
        _isLoading = false;
        notifyListeners();
        return null;
      }
    } catch (e) {
      debugPrint('Error creating quiz session: $e');
      _error = 'Failed to create quiz session: ${e.toString()}';
      _isLoading = false;
      notifyListeners();
      return null;
    }
  }
  
  /// Fetch quiz session data
  Future<bool> loadQuizSession(String sessionId) async {
    _isLoading = true;
    _error = null;
    _sessionId = sessionId;
    notifyListeners();
    
    try {
      final response = await _apiClient.getQuizSession(sessionId);
      
      if (response.statusCode == 200) {
        final data = response.data;
        
        // Parse questions
        final questionsList = data['questions'] as List<dynamic>? ?? [];
        _questions = questionsList.map((q) {
          try {
            // Handle options - can be string or list
            dynamic optionsData = q['options'];
            List<dynamic> optionsList;
            
            if (optionsData is String) {
              try {
                optionsList = jsonDecode(optionsData);
              } catch (e) {
                optionsList = [];
              }
            } else if (optionsData is List) {
              optionsList = optionsData;
            } else {
              optionsList = [];
            }
            
            // Convert options to QuestionOption format
            final options = optionsList.map((opt) {
              if (opt is Map<String, dynamic>) {
                return {'id': opt['id'] ?? '', 'text': opt['text'] ?? ''};
              } else if (opt is String) {
                return {'id': '', 'text': opt};
              }
              return {'id': '', 'text': ''};
            }).toList();
            
            return Question.fromJson({
              'id': q['id']?.toString() ?? '',
              'topicId': q['topicId']?.toString() ?? '',
              'text': q['text']?.toString() ?? '',
              'options': options,
              'correctOptionId': q['correctOptionId']?.toString() ?? '',
              'explanation': q['explanation']?.toString(),
              'difficulty': (q['difficulty'] is int) ? q['difficulty'] : (q['difficulty'] is String ? int.tryParse(q['difficulty']) ?? 15 : 15),
            });
          } catch (e) {
            debugPrint('Error parsing question: $e');
            return null;
          }
        }).whereType<Question>().toList();
        
        // Set quiz context
        _topicId = data['topicId']?.toString() ?? '';
        _topicName = data['topicName']?.toString() ?? data['topicId']?.toString() ?? '';
        _subject = data['subject']?.toString() ?? '';
        _difficulty = data['difficulty']?.toString() ?? 'medium';
        _timeLimit = (data['timeLimit'] is int) ? data['timeLimit'] : ((data['timeLimit'] is String) ? int.tryParse(data['timeLimit']) ?? 0 : 0);
        _accentColor = data['accentColor']?.toString();
        
        _session = QuizSession(
          questions: _questions,
          topicId: _topicId,
          topicName: _topicName,
          subject: _subject,
          difficulty: _difficulty,
          timeLimit: _timeLimit,
          accentColor: _accentColor,
        );
        
        _isLoading = false;
        _timerActive = true;
        _elapsedTime = 0;
        _userAnswers = {};
        notifyListeners();
        return true;
      } else {
        _error = 'Failed to load quiz session';
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      debugPrint('Error loading quiz session: $e');
      _error = 'Failed to load quiz session: ${e.toString()}';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }
  
  /// Select an answer option
  void selectAnswer(String questionId, int optionIndex) {
    _userAnswers[questionId] = optionIndex;
    notifyListeners();
  }
  
  /// Update elapsed time
  void updateElapsedTime(int seconds) {
    _elapsedTime = seconds;
    notifyListeners();
  }
  
  /// Start timer
  void startTimer() {
    _timerActive = true;
    notifyListeners();
  }
  
  /// Stop timer
  void stopTimer() {
    _timerActive = false;
    notifyListeners();
  }
  
  /// Submit quiz result
  Future<String?> submitQuiz({String? quizClass}) async {
    if (_questions.isEmpty || _sessionId == null) {
      return null;
    }
    
    _isSubmitting = true;
    _timerActive = false;
    notifyListeners();
    
    try {
      final response = await _apiClient.submitQuizResult({
        'quizContext': {
          'topicId': _topicId,
          'subject': _subject,
          'difficulty': _difficulty,
          if (quizClass != null) 'quizClass': quizClass,
        },
        'timeTaken': _elapsedTime,
        'questionsActuallyAttemptedIds': _questions.map((q) => q.id).toList(),
        'userAnswersSnapshot': _userAnswers,
      });
      
      if (response.statusCode == 201) {
        final resultId = response.data['resultId']?.toString();
        _isSubmitting = false;
        notifyListeners();
        return resultId;
      } else {
        _error = 'Failed to submit quiz';
        _isSubmitting = false;
        notifyListeners();
        return null;
      }
    } catch (e) {
      debugPrint('Error submitting quiz: $e');
      _error = 'Failed to submit quiz: ${e.toString()}';
      _isSubmitting = false;
      notifyListeners();
      return null;
    }
  }
  
  /// Reset quiz state
  void reset() {
    _questions = [];
    _userAnswers = {};
    _elapsedTime = 0;
    _timerActive = false;
    _isSubmitting = false;
    _sessionId = null;
    _session = null;
    _topicId = '';
    _topicName = '';
    _subject = '';
    _difficulty = '';
    _timeLimit = 0;
    _accentColor = null;
    _error = null;
    _isLoading = false;
    notifyListeners();
  }
  
  /// Clear error
  void clearError() {
    _error = null;
    notifyListeners();
  }
}
