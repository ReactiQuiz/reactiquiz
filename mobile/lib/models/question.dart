class QuestionOption {
  final String id;
  final String text;

  QuestionOption({
    required this.id,
    required this.text,
  });

  factory QuestionOption.fromJson(Map<String, dynamic> json) {
    return QuestionOption(
      id: json['id'] as String,
      text: json['text'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'text': text,
    };
  }
}

class Question {
  final String id;
  final String topicId;
  final String text;
  final List<QuestionOption> options;
  final String correctOptionId;
  final String? explanation;
  final int difficulty;

  Question({
    required this.id,
    required this.topicId,
    required this.text,
    required this.options,
    required this.correctOptionId,
    this.explanation,
    required this.difficulty,
  });

  factory Question.fromJson(Map<String, dynamic> json) {
    final optionsList = json['options'] as List<dynamic>?;
    final options = optionsList
            ?.map((opt) => QuestionOption.fromJson(opt as Map<String, dynamic>))
            .toList() ??
        [];

    return Question(
      id: json['id'] as String,
      topicId: json['topicId'] as String,
      text: json['text'] as String,
      options: options,
      correctOptionId: json['correctOptionId'] as String,
      explanation: json['explanation'] as String?,
      difficulty: json['difficulty'] as int? ?? 1,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'topicId': topicId,
      'text': text,
      'options': options.map((opt) => opt.toJson()).toList(),
      'correctOptionId': correctOptionId,
      'explanation': explanation,
      'difficulty': difficulty,
    };
  }

  bool isCorrectAnswer(String optionId) {
    return optionId == correctOptionId;
  }

  String getDifficultyText() {
    // Handle edge cases: values < 10 default to Easy
    final effectiveDifficulty = difficulty < 10 ? 11 : difficulty;
    
    // API uses difficulty range 10-20:
    // Easy: 10-13
    // Medium: 14-17
    // Hard: 18-20
    if (effectiveDifficulty >= 10 && effectiveDifficulty <= 13) return 'Easy';
    if (effectiveDifficulty >= 14 && effectiveDifficulty <= 17) return 'Medium';
    if (effectiveDifficulty >= 18 && effectiveDifficulty <= 20) return 'Hard';
    
    // For values > 20, treat as Hard
    if (effectiveDifficulty > 20) return 'Hard';
    
    // For values < 10, treat as Easy (fallback for old data)
    if (effectiveDifficulty < 10) return 'Easy';
    
    // Fallback (shouldn't reach here, but just in case)
    return 'Medium';
  }
}

