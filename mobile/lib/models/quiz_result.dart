import 'dart:convert';

class QuizResult {
  final String id;
  final String userId;
  final String topicId;
  final String topicName;
  final String subject;
  final String difficulty;
  final int totalQuestions;
  final int correctAnswers;
  final double score;
  final double percentage;
  final int timeSpent;
  final String timestamp;
  final List<String> questionsActuallyAttemptedIds;
  final Map<String, int> userAnswersSnapshot;
  final List<dynamic>? questions;

  QuizResult({
    required this.id,
    required this.userId,
    required this.topicId,
    required this.topicName,
    required this.subject,
    required this.difficulty,
    required this.totalQuestions,
    required this.correctAnswers,
    required this.score,
    required this.percentage,
    required this.timeSpent,
    required this.timestamp,
    required this.questionsActuallyAttemptedIds,
    required this.userAnswersSnapshot,
    this.questions,
  });

  static int _toInt(dynamic value) {
    if (value is int) return value;
    if (value is double) return value.toInt();
    if (value is String) return int.tryParse(value) ?? 0;
    return 0;
  }

  static double _toDouble(dynamic value) {
    if (value is double) return value;
    if (value is int) return value.toDouble();
    if (value is String) return double.tryParse(value) ?? 0.0;
    return 0.0;
  }

  static List<String> _toStringList(dynamic value) {
    if (value == null) return [];
    if (value is List) {
      return value.map((e) => e.toString()).toList();
    }
    if (value is String) {
      // Handle comma-separated string or empty string
      if (value.isEmpty) return [];
      // Try parsing as JSON array first
      try {
        // If it looks like JSON array, try parsing
        if (value.trim().startsWith('[') && value.trim().endsWith(']')) {
          // This is likely a JSON string, but we'll handle it as comma-separated for now
          return value.split(',').map((e) => e.trim().replaceAll(RegExp(r'[\[\]"]'), '')).where((e) => e.isNotEmpty).toList();
        }
        // Handle comma-separated string
        return value.split(',').map((e) => e.trim()).where((e) => e.isNotEmpty).toList();
      } catch (e) {
        return [];
      }
    }
    return [];
  }

  factory QuizResult.fromJson(Map<String, dynamic> json) {
    // Handle both camelCase (from transformed data) and snake_case (from DB)
    // Database fields from quiz_results table use snake_case
    
    // Parse timestamp - could be DateTime or String
    String timestampStr = '';
    if (json['timestamp'] is DateTime) {
      timestampStr = (json['timestamp'] as DateTime).toIso8601String();
    } else {
      timestampStr = json['timestamp']?.toString() ?? 
                    json['completed_at']?.toString() ?? 
                    DateTime.now().toIso8601String();
    }
    
    // Parse questionsActuallyAttemptedIds - could be JSON string or array
    dynamic questionsIds = json['questionsActuallyAttemptedIds'] ?? 
                           json['questions_actually_attempted_ids'];
    if (questionsIds is String) {
      try {
        // Try parsing as JSON string
        final parsed = jsonDecode(questionsIds);
        questionsIds = parsed;
      } catch (e) {
        // Keep as string, _toStringList will handle it
      }
    }
    
    // Parse userAnswersSnapshot - could be JSON string or Map
    dynamic userAnswers = json['userAnswersSnapshot'] ?? 
                         json['user_answers_snapshot'];
    Map<String, dynamic> userAnswersMap = {};
    if (userAnswers is String) {
      try {
        // Try parsing JSON string
        final parsed = jsonDecode(userAnswers);
        if (parsed is Map) {
          userAnswersMap = Map<String, dynamic>.from(parsed);
        }
      } catch (e) {
        userAnswersMap = {};
      }
    } else if (userAnswers is Map) {
      userAnswersMap = Map<String, dynamic>.from(userAnswers);
    }
    
    // Get topic name from topicId - may need to be fetched separately
    String topicName = json['topicName']?.toString() ?? 
                      json['topic_name']?.toString() ?? 
                      json['topicId']?.toString() ?? 
                      '';
    
    return QuizResult(
      id: json['id']?.toString() ?? '',
      userId: json['userId']?.toString() ?? 
              json['user_id']?.toString() ?? '',
      topicId: json['topicId']?.toString() ?? 
               json['topicId']?.toString() ?? 
               json['topic_id']?.toString() ?? '',
      topicName: topicName,
      subject: json['subject']?.toString() ?? 
               json['subjectKey']?.toString() ?? 
               json['subject_key']?.toString() ?? 
               '',
      difficulty: json['difficulty']?.toString() ?? 'medium',
      totalQuestions: _toInt(json['totalQuestions'] ?? 
                             json['total_questions'] ?? 
                             0),
      correctAnswers: _toInt(json['correctAnswers'] ?? 
                             json['correct_answers'] ?? 
                             json['score'] ?? 
                             0), // score in DB might be correctAnswers
      score: _toDouble(json['score'] ?? 
                      json['total_score'] ?? 
                      0),
      percentage: _toDouble(json['percentage'] ?? 0),
      timeSpent: _toInt(json['timeSpent'] ?? 
                       json['time_spent'] ?? 
                       json['timeTaken'] ?? 
                       json['time_taken'] ?? 
                       0),
      timestamp: timestampStr,
      questionsActuallyAttemptedIds: _toStringList(questionsIds),
      userAnswersSnapshot: {
        for (var entry in userAnswersMap.entries)
          entry.key.toString(): (entry.value is int
              ? entry.value as int
              : (entry.value is String
                  ? (int.tryParse(entry.value as String) ?? 0)
                  : (entry.value is num
                      ? (entry.value as num).toInt()
                      : 0)))
      },
      questions: json['questions'] as List<dynamic>?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'topicId': topicId,
      'topicName': topicName,
      'subject': subject,
      'difficulty': difficulty,
      'totalQuestions': totalQuestions,
      'correctAnswers': correctAnswers,
      'score': score,
      'percentage': percentage,
      'timeSpent': timeSpent,
      'timestamp': timestamp,
      'questionsActuallyAttemptedIds': questionsActuallyAttemptedIds,
      'userAnswersSnapshot': userAnswersSnapshot,
      if (questions != null) 'questions': questions,
    };
  }
}

