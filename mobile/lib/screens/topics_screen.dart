import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:reactiquiz/models/topic.dart';
import 'package:reactiquiz/models/subject.dart';
import 'package:reactiquiz/providers/subjects_provider.dart';
import 'package:reactiquiz/providers/topics_provider.dart';
import 'package:reactiquiz/providers/theme_provider.dart';
import 'package:reactiquiz/providers/quiz_provider.dart';
import 'package:reactiquiz/services/api_client.dart';
import 'package:reactiquiz/config/theme_system.dart';
import 'package:reactiquiz/widgets/app_drawer.dart';
import 'package:reactiquiz/widgets/topic_card.dart';
import 'package:reactiquiz/widgets/loading_indicator.dart';

class TopicsScreen extends StatefulWidget {
  final String subjectKey;
  
  const TopicsScreen({super.key, required this.subjectKey});

  @override
  State<TopicsScreen> createState() => _TopicsScreenState();
}

class _TopicsScreenState extends State<TopicsScreen> {
  String? _subjectId;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadData();
    });
  }

  void _loadData() {
    final subjectsProvider = Provider.of<SubjectsProvider>(context, listen: false);
    final topicsProvider = Provider.of<TopicsProvider>(context, listen: false);
    
    // Load subjects if not loaded
    if (subjectsProvider.subjects.isEmpty && !subjectsProvider.isLoading) {
      subjectsProvider.loadSubjects().then((_) {
        // After subjects load, find and load topics
        _findSubjectAndLoadTopics();
      });
    } else {
      // Subjects already loaded, find and load topics
      _findSubjectAndLoadTopics();
    }
  }
  
  void _findSubjectAndLoadTopics() {
    final subjectsProvider = Provider.of<SubjectsProvider>(context, listen: false);
    final topicsProvider = Provider.of<TopicsProvider>(context, listen: false);
    
    if (subjectsProvider.subjects.isEmpty) {
      return; // Wait for subjects to load
    }
    
    try {
      // Find subject and load topics
      final subject = subjectsProvider.subjects.firstWhere(
        (s) => s.subjectKey.toLowerCase() == widget.subjectKey.toLowerCase(),
      );
      
      if (subject.id != _subjectId) {
        _subjectId = subject.id;
        topicsProvider.loadTopics(subjectId: subject.id, subjectKey: widget.subjectKey);
      }
    } catch (e) {
      // Subject not found - will be handled in build method
    }
  }

  void _showQuizDialog(Topic topic) {
    final colors = Provider.of<ThemeProvider>(context, listen: false).currentColors;
    final subjectColor = ThemeSystem.getSubjectColor(widget.subjectKey);
    final accentColor = subjectColor;
    
    String selectedDifficulty = 'medium';
    final numQuestionsController = TextEditingController(text: '10');

    showDialog(
      context: context,
      builder: (dialogContext) => StatefulBuilder(
        builder: (context, setState) {
          return AlertDialog(
            backgroundColor: colors['card'],
            title: Text(
              'Start Quiz',
              style: TextStyle(
                color: accentColor,
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            content: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    topic.name,
                    style: TextStyle(
                      color: colors['textSecondary'],
                      fontSize: 14,
                    ),
                  ),
                  const SizedBox(height: 20),
                  DropdownButtonFormField<String>(
                    decoration: InputDecoration(
                      labelText: 'Difficulty',
                      filled: true,
                      fillColor: colors['surface'],
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(color: colors['border']!),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(color: colors['border']!),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(color: accentColor, width: 2),
                      ),
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 12,
                      ),
                      labelStyle: TextStyle(color: colors['textSecondary']),
                    ),
                    style: TextStyle(color: colors['text']),
                    dropdownColor: colors['card'],
                    icon: Icon(Icons.arrow_drop_down, color: colors['textSecondary']),
                    value: selectedDifficulty,
                    items: const [
                      DropdownMenuItem(value: 'easy', child: Text('Easy')),
                      DropdownMenuItem(value: 'medium', child: Text('Medium')),
                      DropdownMenuItem(value: 'hard', child: Text('Hard')),
                    ],
                    onChanged: (value) {
                      if (value != null) {
                        setState(() {
                          selectedDifficulty = value;
                        });
                      }
                    },
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: numQuestionsController,
                    decoration: InputDecoration(
                      labelText: 'Number of Questions',
                      filled: true,
                      fillColor: colors['surface'],
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(color: colors['border']!),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(color: colors['border']!),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(color: accentColor, width: 2),
                      ),
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 12,
                      ),
                      labelStyle: TextStyle(color: colors['textSecondary']),
                    ),
                    style: TextStyle(color: colors['text']),
                    keyboardType: TextInputType.number,
                  ),
                ],
              ),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(dialogContext),
                style: TextButton.styleFrom(
                  foregroundColor: colors['textSecondary'],
                ),
                child: const Text('Cancel'),
              ),
              ElevatedButton(
                onPressed: () {
                  final parsed = int.tryParse(numQuestionsController.text) ?? 10;
                  final numQuestions = parsed.clamp(1, 100);
                  Navigator.pop(dialogContext);
                  _startQuiz(topic, selectedDifficulty, numQuestions);
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: accentColor,
                  foregroundColor: Colors.white,
                ),
                child: const Text('Start Quiz'),
              ),
            ],
          );
        },
      ),
    );
  }

  Future<void> _startQuiz(Topic topic, String difficulty, int numQuestions) async {
    final quizProvider = Provider.of<QuizProvider>(context, listen: false);
    
    final sessionId = await quizProvider.createQuizSession(
      topicId: topic.id,
      difficulty: difficulty,
      numQuestions: numQuestions,
    );
    
    if (sessionId != null && mounted) {
      context.go('/quiz?sessionId=$sessionId');
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Failed to create quiz session. Please try again.'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  void _studyFlashcards(Topic topic) {
    context.go('/flashcards/${topic.id}');
  }

  Future<void> _downloadPdf(Topic topic) async {
    // Show loading indicator
    if (!mounted) return;
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(
        child: CircularProgressIndicator(),
      ),
    );

    try {
      final apiClient = ApiClient();
      final response = await apiClient.get('/pdf/questions/${topic.id}');
      
      // Close loading dialog
      if (mounted) Navigator.pop(context);
      
      // TODO: Handle PDF download - this depends on how the API returns PDF
      // For now, show a success message
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('PDF download started for ${topic.name}'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      // Close loading dialog
      if (mounted) Navigator.pop(context);
      
      // Show error message
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to download PDF: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Topics'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/subjects'),
        ),
      ),
      drawer: const AppDrawer(),
      body: Consumer3<SubjectsProvider, TopicsProvider, ThemeProvider>(
        builder: (context, subjectsProvider, topicsProvider, themeProvider, child) {
          final colors = themeProvider.currentColors;

          // Find current subject
          Subject? currentSubject;
          try {
            currentSubject = subjectsProvider.subjects.firstWhere(
              (s) => s.subjectKey.toLowerCase() == widget.subjectKey.toLowerCase(),
            );
          } catch (e) {
            // Subject not found
          }

          // Loading state
          if (topicsProvider.isLoading || subjectsProvider.isLoading) {
            return const LoadingIndicator(message: 'Loading topics...');
          }

          // Error state
          if (topicsProvider.error != null) {
            return Center(
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
                      topicsProvider.error!,
                      style: TextStyle(
                        color: colors['text'],
                        fontSize: 16,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton(
                      onPressed: () {
                        if (currentSubject != null) {
                          topicsProvider.loadTopics(
                            subjectId: currentSubject.id,
                            subjectKey: widget.subjectKey,
                          );
                        }
                      },
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              ),
            );
          }

          // Subject not found
          if (currentSubject == null) {
            return Center(
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
                      'Subject not found',
                      style: TextStyle(
                        color: colors['text'],
                        fontSize: 16,
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
            );
          }

          final subjectColor = ThemeSystem.getSubjectColor(widget.subjectKey);
          final accentColor = subjectColor;
          final filteredTopics = topicsProvider.filteredTopics;

          return Column(
            children: [
              // Subject header
              Container(
                padding: const EdgeInsets.all(16),
                color: colors['card'],
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: accentColor.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(
                        Icons.menu_book,
                        color: accentColor,
                        size: 24,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            currentSubject.name,
                            style: TextStyle(
                              color: accentColor,
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          if (currentSubject.description.isNotEmpty)
                            Text(
                              currentSubject.description,
                              style: TextStyle(
                                color: colors['textSecondary'],
                                fontSize: 13,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              // Filters
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: colors['card'],
                  border: Border(
                    bottom: BorderSide(
                      color: colors['border']!.withOpacity(0.2),
                      width: 1,
                    ),
                  ),
                ),
                child: Column(
                  children: [
                    // Search bar
                    TextField(
                      onChanged: (value) => topicsProvider.setSearchTerm(value),
                      decoration: InputDecoration(
                        labelText: 'Search Topics',
                        hintText: 'Enter topic name...',
                        prefixIcon: const Icon(Icons.search),
                        suffixIcon: topicsProvider.searchTerm.isNotEmpty
                            ? IconButton(
                                icon: const Icon(Icons.clear),
                                onPressed: () => topicsProvider.setSearchTerm(''),
                              )
                            : null,
                        filled: true,
                        fillColor: colors['surface'],
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide(color: colors['border']!),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide(color: colors['border']!),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide(color: accentColor, width: 2),
                        ),
                        labelStyle: TextStyle(color: colors['textSecondary']),
                        hintStyle: TextStyle(color: colors['textSecondary']),
                        contentPadding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 12,
                        ),
                      ),
                      style: TextStyle(color: colors['text']),
                    ),
                    const SizedBox(height: 12),
                    
                    // Class and Genre filters
                    Row(
                      children: [
                        Expanded(
                          child: DropdownButtonFormField<String>(
                            value: topicsProvider.selectedClass.isEmpty
                                ? null
                                : topicsProvider.selectedClass,
                            decoration: InputDecoration(
                              labelText: 'Class',
                              filled: true,
                              fillColor: colors['surface'],
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: BorderSide(color: colors['border']!),
                              ),
                              enabledBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: BorderSide(color: colors['border']!),
                              ),
                              focusedBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: BorderSide(color: accentColor, width: 2),
                              ),
                              contentPadding: const EdgeInsets.symmetric(
                                horizontal: 16,
                                vertical: 12,
                              ),
                            ),
                            style: TextStyle(color: colors['text'], fontSize: 14),
                            dropdownColor: colors['card'],
                            icon: Icon(Icons.arrow_drop_down, color: colors['textSecondary']),
                            items: [
                              const DropdownMenuItem<String>(
                                value: null,
                                child: Text('All Classes'),
                              ),
                              ...topicsProvider.availableClasses.map((className) {
                                return DropdownMenuItem<String>(
                                  value: className,
                                  child: Text('Class $className'),
                                );
                              }),
                            ],
                            onChanged: (value) {
                              topicsProvider.setSelectedClass(value ?? '');
                            },
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: DropdownButtonFormField<String>(
                            value: topicsProvider.selectedGenre.isEmpty
                                ? null
                                : topicsProvider.selectedGenre,
                            decoration: InputDecoration(
                              labelText: 'Genre',
                              filled: true,
                              fillColor: colors['surface'],
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: BorderSide(color: colors['border']!),
                              ),
                              enabledBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: BorderSide(color: colors['border']!),
                              ),
                              focusedBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: BorderSide(color: accentColor, width: 2),
                              ),
                              contentPadding: const EdgeInsets.symmetric(
                                horizontal: 16,
                                vertical: 12,
                              ),
                            ),
                            style: TextStyle(color: colors['text'], fontSize: 14),
                            dropdownColor: colors['card'],
                            icon: Icon(Icons.arrow_drop_down, color: colors['textSecondary']),
                            items: [
                              const DropdownMenuItem<String>(
                                value: null,
                                child: Text('All Genres'),
                              ),
                              ...topicsProvider.availableGenres.map((genre) {
                                return DropdownMenuItem<String>(
                                  value: genre,
                                  child: Text(genre),
                                );
                              }),
                            ],
                            onChanged: (value) {
                              topicsProvider.setSelectedGenre(value ?? '');
                            },
                          ),
                        ),
                      ],
                    ),
                    
                    // Clear filters button
                    if (topicsProvider.searchTerm.isNotEmpty ||
                        topicsProvider.selectedClass.isNotEmpty ||
                        topicsProvider.selectedGenre.isNotEmpty)
                      Padding(
                        padding: const EdgeInsets.only(top: 8),
                        child: Align(
                          alignment: Alignment.centerRight,
                          child: TextButton.icon(
                            onPressed: () => topicsProvider.clearFilters(),
                            icon: const Icon(Icons.clear_all, size: 18),
                            label: const Text('Clear Filters'),
                            style: TextButton.styleFrom(
                              foregroundColor: accentColor,
                            ),
                          ),
                        ),
                      ),
                  ],
                ),
              ),

              // Topics grid
              Expanded(
                child: filteredTopics.isEmpty
                    ? Center(
                        child: Padding(
                          padding: const EdgeInsets.all(24),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                Icons.topic_outlined,
                                size: 64,
                                color: colors['textSecondary'],
                              ),
                              const SizedBox(height: 16),
                              Text(
                                topicsProvider.searchTerm.isNotEmpty ||
                                        topicsProvider.selectedClass.isNotEmpty ||
                                        topicsProvider.selectedGenre.isNotEmpty
                                    ? 'No topics found matching your filters'
                                    : 'No topics available for this subject',
                                style: TextStyle(
                                  color: colors['text'],
                                  fontSize: 16,
                                ),
                                textAlign: TextAlign.center,
                              ),
                              if (topicsProvider.searchTerm.isNotEmpty ||
                                  topicsProvider.selectedClass.isNotEmpty ||
                                  topicsProvider.selectedGenre.isNotEmpty) ...[
                                const SizedBox(height: 24),
                                TextButton(
                                  onPressed: () => topicsProvider.clearFilters(),
                                  child: const Text('Clear Filters'),
                                ),
                              ],
                            ],
                          ),
                        ),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: filteredTopics.length,
                        itemBuilder: (context, index) {
                          final topic = filteredTopics[index];
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 16),
                            child: TopicCard(
                              topic: topic,
                              onStartQuiz: _showQuizDialog,
                              onStudyFlashcards: _studyFlashcards,
                              onDownloadPdf: _downloadPdf,
                              accentColor: accentColor,
                              colors: colors,
                            ),
                          );
                        },
                      ),
              ),
            ],
          );
        },
      ),
    );
  }
}

