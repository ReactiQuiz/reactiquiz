import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:reactiquiz/widgets/app_drawer.dart';
import 'package:reactiquiz/models/quiz_result.dart';
import 'package:reactiquiz/models/question.dart';
import 'package:reactiquiz/services/api_client.dart';
import 'package:reactiquiz/config/theme_system.dart';
import 'package:reactiquiz/providers/theme_provider.dart';
import 'package:intl/intl.dart';
import 'dart:convert';

class QuizResultScreen extends StatefulWidget {
  final String quizId;
  
  const QuizResultScreen({super.key, required this.quizId});

  @override
  State<QuizResultScreen> createState() => _QuizResultScreenState();
}

class _QuizResultScreenState extends State<QuizResultScreen> {
  final ApiClient _apiClient = ApiClient();
  bool _isLoading = true;
  String? _error;
  QuizResult? _quizResult;
  List<Question> _questions = [];

  @override
  void initState() {
    super.initState();
    _loadQuizResult();
  }

  Future<void> _loadQuizResult() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      // Fetch quiz result
      final response = await _apiClient.get('/api/results/${widget.quizId}');
      final resultData = response.data;

      if (resultData == null) {
        setState(() {
          _error = 'Quiz result not found';
          _isLoading = false;
        });
        return;
      }

      // Parse quiz result
      final quizResult = QuizResult.fromJson(resultData);

      // Fetch questions if we have question IDs
      List<Question> questions = [];
      if (quizResult.questionsActuallyAttemptedIds.isNotEmpty) {
        try {
          // Fetch questions by IDs
          final questionsResponse = await _apiClient.get('/api/questions', queryParameters: {
            'ids': quizResult.questionsActuallyAttemptedIds.join(','),
          });

          final questionsData = questionsResponse.data;
          if (questionsData is List) {
            questions = questionsData.map((q) {
              try {
                // Parse options
                dynamic optionsData = q['options'];
                List<dynamic> optionsList = [];
                
                if (optionsData is String) {
                  try {
                    optionsList = jsonDecode(optionsData);
                  } catch (e) {
                    optionsList = [];
                  }
                } else if (optionsData is List) {
                  optionsList = optionsData;
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
                  'topicId': q['topicId']?.toString() ?? '',
                  'text': q['text']?.toString() ?? q['question_text']?.toString() ?? '',
                  'options': options,
                  'correctOptionId': q['correctOptionId']?.toString() ?? q['correct_answer']?.toString() ?? '',
                  'explanation': q['explanation']?.toString(),
                  'difficulty': q['difficulty'] is int ? q['difficulty'] : (q['difficulty'] is String ? int.tryParse(q['difficulty']) ?? 15 : 15),
                });
              } catch (e) {
                return null;
              }
            }).whereType<Question>().toList();
          }
        } catch (e) {
          debugPrint('Error loading questions: $e');
        }
      }

      setState(() {
        _quizResult = quizResult;
        _questions = questions;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Failed to load quiz result: ${e.toString()}';
        _isLoading = false;
      });
    }
  }

  String _formatTime(int seconds) {
    final minutes = seconds ~/ 60;
    final secs = seconds % 60;
    if (minutes > 0) {
      return '${minutes}m ${secs}s';
    }
    return '${secs}s';
  }

  String _formatTimestamp(String timestamp) {
    try {
      final date = DateTime.parse(timestamp);
      final formatter = DateFormat('MMM dd, yyyy • hh:mm a');
      return formatter.format(date);
    } catch (e) {
      return timestamp;
    }
  }

  Color _getScoreColor(double percentage) {
    if (percentage >= 80) return Colors.green;
    if (percentage >= 60) return Colors.orange;
    return Colors.red;
  }

  @override
  Widget build(BuildContext context) {
    final themeProvider = Provider.of<ThemeProvider>(context, listen: false);
    final colors = themeProvider.currentColors;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Quiz Result'),
      ),
      drawer: const AppDrawer(),
      body: _isLoading
          ? Center(
              child: CircularProgressIndicator(
                color: colors['primary'],
              ),
            )
          : _error != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.error_outline, size: 64, color: colors['error']),
                      const SizedBox(height: 16),
                      Text(
                        _error!,
                        style: TextStyle(color: colors['text']),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 24),
                      ElevatedButton(
                        onPressed: () => context.go('/results'),
                        child: const Text('Back to Results'),
                      ),
                    ],
                  ),
                )
              : _quizResult == null
                  ? Center(
                      child: Text(
                        'Quiz result not found',
                        style: TextStyle(color: colors['text']),
                      ),
                    )
                  : _buildResultContent(context, colors),
    );
  }

  Widget _buildResultContent(BuildContext context, Map<String, Color> colors) {
    final result = _quizResult!;
    final scoreColor = _getScoreColor(result.percentage);
    final subjectColor = ThemeSystem.getSubjectColor(result.subject);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Summary Card
          Card(
            color: colors['card'],
            elevation: 4,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                  // Topic Name
                  Text(
                    result.topicName,
                    style: TextStyle(
                      color: colors['text'],
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 8),
                  // Subject and Difficulty
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      if (result.subject.isNotEmpty)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: subjectColor.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            result.subject.toUpperCase(),
                            style: TextStyle(
                              color: subjectColor,
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      if (result.subject.isNotEmpty && result.difficulty.isNotEmpty)
                        const SizedBox(width: 8),
                      if (result.difficulty.isNotEmpty)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: ThemeSystem.getDifficultyColor(result.difficulty).withOpacity(0.2),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            result.difficulty.toUpperCase(),
                            style: TextStyle(
                              color: ThemeSystem.getDifficultyColor(result.difficulty),
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  // Score Circle
                  Container(
                    width: 120,
                    height: 120,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: scoreColor.withOpacity(0.1),
                      border: Border.all(
                        color: scoreColor,
                        width: 4,
                      ),
                    ),
                    child: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            '${result.correctAnswers}/${result.totalQuestions}',
                            style: TextStyle(
                              color: scoreColor,
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          Text(
                            '${result.percentage.toStringAsFixed(1)}%',
                            style: TextStyle(
                              color: scoreColor,
                              fontSize: 18,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  // Time and Date
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      _buildInfoItem(
                        icon: Icons.timer,
                        label: 'Time',
                        value: _formatTime(result.timeSpent),
                        colors: colors,
                      ),
                      _buildInfoItem(
                        icon: Icons.calendar_today,
                        label: 'Date',
                        value: _formatTimestamp(result.timestamp),
                        colors: colors,
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),
          // Questions Breakdown
          Text(
            'Question Breakdown',
            style: TextStyle(
              color: colors['text'],
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          // Questions List
          if (_questions.isEmpty)
            Card(
              color: colors['card'],
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Text(
                  'Question details are not available',
                  style: TextStyle(color: colors['textSecondary']),
                ),
              ),
            )
          else
            ..._questions.asMap().entries.map((entry) {
              final index = entry.key;
              final question = entry.value;
              final userAnswerIndex = result.userAnswersSnapshot[question.id];
              final userAnswer = userAnswerIndex != null && userAnswerIndex < question.options.length
                  ? question.options[userAnswerIndex]
                  : null;
              final correctAnswer = question.options.firstWhere(
                (opt) => opt.id == question.correctOptionId,
                orElse: () => question.options.isNotEmpty ? question.options[0] : QuestionOption(id: '', text: ''),
              );
              final isCorrect = userAnswer != null && userAnswer.id == question.correctOptionId;

              return Card(
                color: colors['card'],
                margin: const EdgeInsets.only(bottom: 12),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Question Header
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                            decoration: BoxDecoration(
                              color: isCorrect ? Colors.green.withOpacity(0.2) : Colors.red.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(
                                  isCorrect ? Icons.check_circle : Icons.cancel,
                                  size: 16,
                                  color: isCorrect ? Colors.green : Colors.red,
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  'Question ${index + 1}',
                                  style: TextStyle(
                                    color: isCorrect ? Colors.green : Colors.red,
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const Spacer(),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                            decoration: BoxDecoration(
                              color: ThemeSystem.getDifficultyColor(question.getDifficultyText()).withOpacity(0.2),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              question.getDifficultyText(),
                              style: TextStyle(
                                color: ThemeSystem.getDifficultyColor(question.getDifficultyText()),
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      // Question Text
                      Text(
                        question.text,
                        style: TextStyle(
                          color: colors['text'],
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 16),
                      // User Answer
                      if (userAnswer != null)
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: isCorrect ? Colors.green.withOpacity(0.1) : Colors.red.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(
                              color: isCorrect ? Colors.green : Colors.red,
                              width: 1,
                            ),
                          ),
                          child: Row(
                            children: [
                              Icon(
                                Icons.person,
                                size: 16,
                                color: isCorrect ? Colors.green : Colors.red,
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  'Your Answer: ${userAnswer.text}',
                                  style: TextStyle(
                                    color: colors['text'],
                                    fontSize: 14,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      const SizedBox(height: 8),
                      // Correct Answer
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.green.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: Colors.green,
                            width: 1,
                          ),
                        ),
                        child: Row(
                          children: [
                            const Icon(
                              Icons.check_circle,
                              size: 16,
                              color: Colors.green,
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                'Correct Answer: ${correctAnswer.text}',
                                style: TextStyle(
                                  color: colors['text'],
                                  fontSize: 14,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      // Explanation
                      if (question.explanation != null && question.explanation!.isNotEmpty) ...[
                        const SizedBox(height: 12),
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: colors['surface'],
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Explanation:',
                                style: TextStyle(
                                  color: colors['textSecondary'],
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                question.explanation!,
                                style: TextStyle(
                                  color: colors['text'],
                                  fontSize: 14,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              );
            }),
          const SizedBox(height: 24),
          // Action Buttons
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () => context.go('/results'),
                  icon: const Icon(Icons.list),
                  label: const Text('Back to Results'),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () => context.go('/home'),
                  icon: const Icon(Icons.home),
                  label: const Text('Home'),
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildInfoItem({
    required IconData icon,
    required String label,
    required String value,
    required Map<String, Color> colors,
  }) {
    return Column(
      children: [
        Icon(icon, color: colors['primary'], size: 24),
        const SizedBox(height: 8),
        Text(
          label,
          style: TextStyle(
            color: colors['textSecondary'],
            fontSize: 12,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: TextStyle(
            color: colors['text'],
            fontSize: 14,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }
}
