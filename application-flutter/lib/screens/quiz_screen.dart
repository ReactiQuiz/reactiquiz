import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:reactiquiz/providers/quiz_provider.dart';
import 'package:reactiquiz/providers/theme_provider.dart';
import 'package:reactiquiz/providers/auth_provider.dart';
import 'package:reactiquiz/config/theme_system.dart';
import 'package:reactiquiz/widgets/quiz_timer.dart';
import 'package:reactiquiz/widgets/quiz_question_card.dart';
import 'package:reactiquiz/widgets/loading_indicator.dart';

class QuizScreen extends StatefulWidget {
  final String? sessionId;
  final String? topicId;
  final String? difficulty;
  final int? numQuestions;
  
  const QuizScreen({
    super.key,
    this.sessionId,
    this.topicId,
    this.difficulty,
    this.numQuestions,
  });

  @override
  State<QuizScreen> createState() => _QuizScreenState();
}

class _QuizScreenState extends State<QuizScreen> {
  late QuizProvider _quizProvider;
  
  @override
  void initState() {
    super.initState();
    _quizProvider = Provider.of<QuizProvider>(context, listen: false);
    _loadQuiz();
  }

  Future<void> _loadQuiz() async {
    if (widget.sessionId != null) {
      // Load existing session
      await _quizProvider.loadQuizSession(widget.sessionId!);
    } else if (widget.topicId != null) {
      // Create new session
      final sessionId = await _quizProvider.createQuizSession(
        topicId: widget.topicId!,
        difficulty: widget.difficulty ?? 'medium',
        numQuestions: widget.numQuestions ?? 10,
      );
      if (sessionId != null) {
        await _quizProvider.loadQuizSession(sessionId);
      }
    }
    
    // Start timer if quiz is loaded
    if (_quizProvider.questions.isNotEmpty && _quizProvider.timerActive) {
      _startTimer();
    }
  }

  void _startTimer() {
    // Timer updates every second
    Future.delayed(const Duration(seconds: 1), () {
      if (mounted && _quizProvider.timerActive) {
        final newTime = _quizProvider.elapsedTime + 1;
        _quizProvider.updateElapsedTime(newTime);
        
        // Check time limit
        if (_quizProvider.timeLimit > 0) {
          final remaining = _quizProvider.timeLimit - newTime;
          if (remaining <= 0) {
            _handleTimeUp();
            return;
          }
        }
        
        _startTimer(); // Continue timer
      }
    });
  }

  void _handleTimeUp() {
    _quizProvider.stopTimer();
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: const Text('Time\'s Up!'),
        content: const Text('Your time has expired. Would you like to submit your quiz?'),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              _abandonQuiz();
            },
            child: const Text('Abandon'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.of(context).pop();
              _submitQuiz();
            },
            child: const Text('Submit'),
          ),
        ],
      ),
    );
  }

  Future<void> _submitQuiz() async {
    _quizProvider.stopTimer();
    
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final user = authProvider.user;
    final quizClass = user?.className;
    
    final resultId = await _quizProvider.submitQuiz(quizClass: quizClass);
    
    if (resultId != null && mounted) {
      // Navigate to main results page (not specific result detail)
      context.go('/results');
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Failed to submit quiz. Please try again.'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  void _abandonQuiz() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Abandon Quiz?'),
        content: const Text('Are you sure you want to abandon this quiz? Your progress will be lost.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.of(context).pop();
              _quizProvider.reset();
              if (mounted) {
                context.go('/subjects');
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
            ),
            child: const Text('Abandon'),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer3<QuizProvider, ThemeProvider, AuthProvider>(
      builder: (context, quizProvider, themeProvider, authProvider, child) {
        final colors = themeProvider.currentColors;
        
        // Loading state
        if (quizProvider.isLoading) {
          return Scaffold(
            appBar: AppBar(
              title: const Text('Loading Quiz...'),
            ),
            body: const LoadingIndicator(message: 'Loading quiz questions...'),
          );
        }
        
        // Error state
        if (quizProvider.error != null) {
          return Scaffold(
            appBar: AppBar(
              title: const Text('Error'),
            ),
            body: Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.error_outline,
                      size: 64,
                      color: colors['error'],
                    ),
                    const SizedBox(height: 16),
                    Text(
                      quizProvider.error!,
                      style: TextStyle(
                        color: colors['text'],
                        fontSize: 16,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton(
                      onPressed: () => context.go('/subjects'),
                      child: const Text('Go Back'),
                    ),
                  ],
                ),
              ),
            ),
          );
        }
        
        // No questions state
        if (quizProvider.questions.isEmpty) {
          return Scaffold(
            appBar: AppBar(
              title: const Text('Quiz'),
            ),
            body: Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.quiz_outlined,
                      size: 64,
                      color: colors['textSecondary'],
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'No questions available',
                      style: TextStyle(
                        color: colors['text'],
                        fontSize: 18,
                      ),
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton(
                      onPressed: () => context.go('/subjects'),
                      child: const Text('Go Back'),
                    ),
                  ],
                ),
              ),
            ),
          );
        }
        
        // Main quiz UI
        final subjectColor = ThemeSystem.getSubjectColor(quizProvider.subject);
        final accentColor = quizProvider.accentColor != null
            ? Color(int.parse(quizProvider.accentColor!.replaceFirst('#', '0xff')))
            : subjectColor;
        
        return Scaffold(
          appBar: AppBar(
            title: const Text('Quiz'),
            backgroundColor: colors['card'],
            foregroundColor: colors['text'],
            actions: [
              if (quizProvider.timerActive)
                Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: QuizTimer(
                    timeLimit: quizProvider.timeLimit,
                    elapsedTime: quizProvider.elapsedTime,
                    timerActive: quizProvider.timerActive,
                    accentColor: accentColor,
                  ),
                ),
            ],
          ),
          body: Column(
            children: [
              // Quiz Header
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                color: colors['card'],
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                quizProvider.topicName,
                                style: TextStyle(
                                  color: accentColor,
                                  fontSize: 22,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                '${quizProvider.subject.toUpperCase()} • ${quizProvider.difficulty.toUpperCase()}',
                                style: TextStyle(
                                  color: colors['textSecondary'],
                                  fontSize: 14,
                                ),
                              ),
                            ],
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.close),
                          color: colors['error'],
                          onPressed: _abandonQuiz,
                          tooltip: 'Abandon Quiz',
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              
              // Questions List
              Expanded(
                child: ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: quizProvider.questions.length,
                  itemBuilder: (context, index) {
                    final question = quizProvider.questions[index];
                    return QuizQuestionCard(
                      question: question,
                      questionNumber: index + 1,
                      selectedOptionIndex: quizProvider.userAnswers[question.id],
                      onOptionSelect: (questionId, optionIndex) {
                        quizProvider.selectAnswer(questionId, optionIndex);
                      },
                      accentColor: accentColor,
                      colors: colors,
                    );
                  },
                ),
              ),
              
              // Submit Button
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: colors['card'],
                  border: Border(
                    top: BorderSide(
                      color: colors['border']!.withOpacity(0.2),
                      width: 1,
                    ),
                  ),
                ),
                child: SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: quizProvider.isSubmitting ? null : _submitQuiz,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: accentColor,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: quizProvider.isSubmitting
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                            ),
                          )
                        : const Text(
                            'Submit Quiz',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}