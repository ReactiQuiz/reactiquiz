import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:reactiquiz/providers/flashcards_provider.dart';
import 'package:reactiquiz/providers/theme_provider.dart';
import 'package:reactiquiz/providers/topics_provider.dart';
import 'package:reactiquiz/widgets/app_drawer.dart';
import 'package:reactiquiz/widgets/flashcard_widget.dart';
import 'package:reactiquiz/widgets/loading_indicator.dart';
import 'package:reactiquiz/config/theme_system.dart';

class FlashcardsScreen extends StatefulWidget {
  final String topicId;
  
  const FlashcardsScreen({super.key, required this.topicId});

  @override
  State<FlashcardsScreen> createState() => _FlashcardsScreenState();
}

class _FlashcardsScreenState extends State<FlashcardsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadFlashcards();
    });
  }

  void _loadFlashcards() {
    final flashcardsProvider = Provider.of<FlashcardsProvider>(context, listen: false);
    final topicsProvider = Provider.of<TopicsProvider>(context, listen: false);
    
    // Find topic name from topics provider
    String topicName = widget.topicId;
    try {
      final topic = topicsProvider.topics.firstWhere(
        (t) => t.id == widget.topicId,
      );
      topicName = topic.name;
    } catch (e) {
      // Topic not found, use topicId as name
    }
    
    flashcardsProvider.loadFlashcards(widget.topicId, topicName);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Consumer<FlashcardsProvider>(
          builder: (context, provider, _) {
            return Text(provider.topicName.isNotEmpty 
                ? 'Flashcards: ${provider.topicName}'
                : 'Flashcards');
          },
        ),
      ),
      drawer: const AppDrawer(),
      body: Consumer2<FlashcardsProvider, ThemeProvider>(
        builder: (context, flashcardsProvider, themeProvider, child) {
          final colors = themeProvider.currentColors;
          
          if (flashcardsProvider.isLoading) {
            return const LoadingIndicator(message: 'Loading flashcards...');
          }
          
          if (flashcardsProvider.error != null) {
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
                      flashcardsProvider.error!,
                      style: TextStyle(
                        color: colors['text'],
                        fontSize: 16,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton(
                      onPressed: () => _loadFlashcards(),
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              ),
            );
          }
          
          if (flashcardsProvider.flashcards.isEmpty) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.style_outlined,
                      size: 64,
                      color: colors['textSecondary'],
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'No flashcards available',
                      style: TextStyle(
                        color: colors['text'],
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'No questions found for this topic',
                      style: TextStyle(
                        color: colors['textSecondary'],
                        fontSize: 14,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton.icon(
                      onPressed: () => context.go('/subjects'),
                      icon: const Icon(Icons.arrow_back),
                      label: const Text('Back to Subjects'),
                    ),
                  ],
                ),
              ),
            );
          }
          
          final currentCard = flashcardsProvider.currentCard;
          if (currentCard == null) {
            return const Center(child: Text('No card to display'));
          }
          
          // Get subject color for accent
          final topicsProvider = Provider.of<TopicsProvider>(context, listen: false);
          String subjectKey = '';
          try {
            final topic = topicsProvider.topics.firstWhere(
              (t) => t.id == widget.topicId,
            );
            subjectKey = topic.subjectKey ?? topicsProvider.subjectKey;
          } catch (e) {
            subjectKey = topicsProvider.subjectKey;
          }
          final accentColor = ThemeSystem.getSubjectColor(subjectKey);
          
          return Column(
            children: [
              // Card counter
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                color: colors['card'],
                child: Text(
                  'Card ${flashcardsProvider.currentIndex + 1} of ${flashcardsProvider.totalCards}',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: colors['textSecondary'],
                    fontSize: 14,
                  ),
                ),
              ),
              
              // Flashcard
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: FlashcardWidget(
                    question: currentCard,
                    accentColor: accentColor,
                    colors: colors,
                    cardNumber: flashcardsProvider.currentIndex + 1,
                    totalCards: flashcardsProvider.totalCards,
                  ),
                ),
              ),
              
              // Navigation controls
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
                child: Column(
                  children: [
                    // Navigation buttons
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        IconButton(
                          onPressed: flashcardsProvider.totalCards <= 1
                              ? null
                              : () => flashcardsProvider.previousCard(),
                          icon: const Icon(Icons.arrow_back_ios),
                          style: IconButton.styleFrom(
                            backgroundColor: colors['surface'],
                            foregroundColor: accentColor,
                            padding: const EdgeInsets.all(16),
                          ),
                        ),
                        const SizedBox(width: 24),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                          decoration: BoxDecoration(
                            color: colors['surface'],
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            '${flashcardsProvider.currentIndex + 1} / ${flashcardsProvider.totalCards}',
                            style: TextStyle(
                              color: colors['text'],
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        const SizedBox(width: 24),
                        IconButton(
                          onPressed: flashcardsProvider.totalCards <= 1
                              ? null
                              : () => flashcardsProvider.nextCard(),
                          icon: const Icon(Icons.arrow_forward_ios),
                          style: IconButton.styleFrom(
                            backgroundColor: colors['surface'],
                            foregroundColor: accentColor,
                            padding: const EdgeInsets.all(16),
                          ),
                        ),
                      ],
                    ),
                    
                    const SizedBox(height: 16),
                    
                    // Shuffle button
                    if (flashcardsProvider.totalCards > 1)
                      OutlinedButton.icon(
                        onPressed: () => flashcardsProvider.shuffleCards(),
                        icon: const Icon(Icons.shuffle),
                        label: const Text('Shuffle Cards'),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: accentColor,
                          side: BorderSide(color: accentColor),
                          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                        ),
                      ),
                    
                    const SizedBox(height: 12),
                    
                    // Back button
                    OutlinedButton.icon(
                      onPressed: () => context.go('/subjects'),
                      icon: const Icon(Icons.arrow_back),
                      label: const Text('Back to Subjects'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: colors['textSecondary'],
                        side: BorderSide(color: colors['border']!),
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

