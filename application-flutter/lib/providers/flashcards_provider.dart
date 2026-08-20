import 'dart:math';
import 'package:flutter/foundation.dart';
import 'package:reactiquiz/models/question.dart';
import 'package:reactiquiz/services/api_client.dart';
import 'dart:convert';

class FlashcardsProvider with ChangeNotifier {
  final ApiClient _apiClient = ApiClient();
  
  bool _isLoading = false;
  String? _error;
  List<Question> _questions = [];
  List<Question> _flashcards = [];
  int _currentIndex = 0;
  String _topicId = '';
  String _topicName = '';
  
  bool get isLoading => _isLoading;
  String? get error => _error;
  List<Question> get flashcards => _flashcards;
  int get currentIndex => _currentIndex;
  Question? get currentCard => _flashcards.isNotEmpty && _currentIndex >= 0 && _currentIndex < _flashcards.length
      ? _flashcards[_currentIndex]
      : null;
  String get topicId => _topicId;
  String get topicName => _topicName;
  int get totalCards => _flashcards.length;
  
  Future<void> loadFlashcards(String topicId, String topicName) async {
    if (_topicId == topicId && _flashcards.isNotEmpty && !_isLoading) {
      return; // Already loaded
    }
    
    _isLoading = true;
    _error = null;
    _topicId = topicId;
    _topicName = topicName;
    notifyListeners();
    
    try {
      // Fetch questions for the topic
      final response = await _apiClient.get('/api/questions', queryParameters: {
        'topicId': topicId,
      });
      
      final questionsData = response.data;
      List<Question> questions = [];
      
      if (questionsData != null) {
        if (questionsData is List) {
          questions = questionsData.map((q) {
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
                'topicId': q['topicId']?.toString() ?? topicId,
                'text': q['text']?.toString() ?? q['question_text']?.toString() ?? '',
                'options': options,
                'correctOptionId': q['correctOptionId']?.toString() ?? q['correct_answer']?.toString() ?? '',
                'explanation': q['explanation']?.toString(),
                'difficulty': _parseDifficulty(q['difficulty']),
              });
            } catch (e) {
              debugPrint('Error parsing question: $e');
              return null;
            }
          }).whereType<Question>().toList();
        } else if (questionsData is Map<String, dynamic>) {
          final data = questionsData['data'];
          if (data is List) {
            questions = data.map((q) {
              try {
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
                  'topicId': q['topicId']?.toString() ?? topicId,
                  'text': q['text']?.toString() ?? q['question_text']?.toString() ?? '',
                  'options': options,
                  'correctOptionId': q['correctOptionId']?.toString() ?? q['correct_answer']?.toString() ?? '',
                  'explanation': q['explanation']?.toString(),
                  'difficulty': _parseDifficulty(q['difficulty']),
                });
              } catch (e) {
                debugPrint('Error parsing question: $e');
                return null;
              }
            }).whereType<Question>().toList();
          }
        }
      }
      
      _questions = questions;
      _flashcards = _shuffleList(List<Question>.from(questions));
      _currentIndex = 0;
      
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      debugPrint('Error loading flashcards: $e');
      _error = 'Failed to load flashcards: ${e.toString()}';
      _isLoading = false;
      notifyListeners();
    }
  }
  
  void nextCard() {
    if (_flashcards.isEmpty) return;
    _currentIndex = (_currentIndex + 1) % _flashcards.length;
    notifyListeners();
  }
  
  void previousCard() {
    if (_flashcards.isEmpty) return;
    _currentIndex = (_currentIndex - 1 + _flashcards.length) % _flashcards.length;
    notifyListeners();
  }
  
  void shuffleCards() {
    if (_questions.isEmpty) return;
    _flashcards = _shuffleList(List<Question>.from(_questions));
    _currentIndex = 0;
    notifyListeners();
  }
  
  List<Question> _shuffleList(List<Question> list) {
    final shuffled = List<Question>.from(list);
    final random = Random();
    for (int i = shuffled.length - 1; i > 0; i--) {
      final j = random.nextInt(i + 1);
      final temp = shuffled[i];
      shuffled[i] = shuffled[j];
      shuffled[j] = temp;
    }
    return shuffled;
  }
  
  void reset() {
    _flashcards = [];
    _questions = [];
    _currentIndex = 0;
    _topicId = '';
    _topicName = '';
    _error = null;
    _isLoading = false;
    notifyListeners();
  }

  /// Parse difficulty value from API response
  /// Handles various formats: int, String, null, etc.
  /// Returns a valid difficulty value between 10-20 (defaults to 15 if invalid)
  /// The API uses difficulty range 10-20:
  /// - Easy: 10-13
  /// - Medium: 14-17
  /// - Hard: 18-20
  int _parseDifficulty(dynamic difficultyValue) {
    if (difficultyValue == null) {
      debugPrint('FlashcardsProvider: Difficulty is null, defaulting to Medium (15)');
      return 15; // Default to Medium (middle of range 10-20)
    }
    
    if (difficultyValue is int) {
      // Ensure value is within valid range (10-20)
      int normalizedValue = difficultyValue;
      if (normalizedValue < 10) {
        debugPrint('FlashcardsProvider: Difficulty $normalizedValue < 10, defaulting to Easy (11)');
        return 11; // Map values < 10 to Easy range
      }
      if (normalizedValue > 20) {
        debugPrint('FlashcardsProvider: Difficulty $normalizedValue > 20, defaulting to Hard (20)');
        return 20; // Clamp to max Hard
      }
      // Return the raw value within 10-20 range
      debugPrint('FlashcardsProvider: Difficulty $normalizedValue parsed successfully (in range 10-20)');
      return normalizedValue;
    }
    
    if (difficultyValue is String) {
      final trimmed = difficultyValue.trim();
      
      // First try to parse as integer
      final parsed = int.tryParse(trimmed);
      if (parsed != null) {
        // Recursively call with the parsed integer
        return _parseDifficulty(parsed);
      }
      
      // Try to map string values to difficulty (case-insensitive)
      final lower = trimmed.toLowerCase();
      if (lower == 'easy' || lower.contains('easy')) {
        debugPrint('FlashcardsProvider: Difficulty string "$difficultyValue" mapped to Easy (11)');
        return 11; // Map to Easy range (10-13)
      }
      if (lower == 'medium' || lower.contains('medium')) {
        debugPrint('FlashcardsProvider: Difficulty string "$difficultyValue" mapped to Medium (15)');
        return 15; // Map to Medium range (14-17)
      }
      if (lower == 'hard' || lower.contains('hard')) {
        debugPrint('FlashcardsProvider: Difficulty string "$difficultyValue" mapped to Hard (19)');
        return 19; // Map to Hard range (18-20)
      }
      
      // Default to Medium if string doesn't match
      debugPrint('FlashcardsProvider: Unknown difficulty string "$difficultyValue", defaulting to Medium (15)');
      return 15;
    }
    
    // Default fallback
    debugPrint('FlashcardsProvider: Unknown difficulty type ${difficultyValue.runtimeType}, defaulting to Medium (15)');
    return 15;
  }
}
