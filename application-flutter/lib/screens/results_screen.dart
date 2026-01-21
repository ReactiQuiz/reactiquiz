import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:reactiquiz/providers/results_provider.dart';
import 'package:reactiquiz/providers/theme_provider.dart';
import 'package:reactiquiz/widgets/app_drawer.dart';
import 'package:reactiquiz/widgets/result_card.dart';
import 'package:reactiquiz/widgets/loading_indicator.dart';

class ResultsScreen extends StatefulWidget {
  const ResultsScreen({super.key});

  @override
  State<ResultsScreen> createState() => _ResultsScreenState();
}

class _ResultsScreenState extends State<ResultsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final provider = Provider.of<ResultsProvider>(context, listen: false);
      if (provider.results.isEmpty && !provider.isLoading) {
        provider.loadResults();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Quiz Results'),
        actions: [
          Consumer<ResultsProvider>(
            builder: (context, provider, _) {
              if (provider.isLoading) {
                return const Padding(
                  padding: EdgeInsets.all(16.0),
                  child: SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  ),
                );
              }
              return IconButton(
                icon: const Icon(Icons.refresh),
                onPressed: () => provider.loadResults(),
                tooltip: 'Refresh',
              );
            },
          ),
        ],
      ),
      drawer: const AppDrawer(),
      body: Consumer2<ResultsProvider, ThemeProvider>(
        builder: (context, resultsProvider, themeProvider, child) {
          final colors = themeProvider.currentColors;
          final filteredResults = resultsProvider.filteredAndSortedResults;

          if (resultsProvider.isLoading) {
            return const LoadingIndicator(message: 'Loading results...');
          }

          if (resultsProvider.error != null) {
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
                      resultsProvider.error!,
                      style: TextStyle(
                        color: colors['text'],
                        fontSize: 16,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton(
                      onPressed: () => resultsProvider.loadResults(),
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              ),
            );
          }

          return Column(
            children: [
              // Filters Section
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
                    // Sort Order
                    Row(
                      children: [
                        Expanded(
                          child: DropdownButtonFormField<String>(
                            value: resultsProvider.sortOrder,
                            decoration: InputDecoration(
                              labelText: 'Sort By',
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
                                borderSide: BorderSide(color: colors['primary']!, width: 2),
                              ),
                              contentPadding: const EdgeInsets.symmetric(
                                horizontal: 16,
                                vertical: 12,
                              ),
                            ),
                            style: TextStyle(color: colors['text'], fontSize: 14),
                            dropdownColor: colors['card'],
                            icon: Icon(Icons.arrow_drop_down, color: colors['textSecondary']),
                            items: const [
                              DropdownMenuItem(value: 'newest', child: Text('Most Recent')),
                              DropdownMenuItem(value: 'oldest', child: Text('Oldest First')),
                              DropdownMenuItem(value: 'score-high', child: Text('Score (High-Low)')),
                              DropdownMenuItem(value: 'score-low', child: Text('Score (Low-High)')),
                            ],
                            onChanged: (value) {
                              if (value != null) resultsProvider.setSortOrder(value);
                            },
                          ),
                        ),
                      ],
                    ),
                    
                    const SizedBox(height: 12),
                    
                    // Subject and Difficulty Filters
                    Row(
                      children: [
                        Expanded(
                          child: DropdownButtonFormField<String>(
                            value: resultsProvider.subjectFilter,
                            decoration: InputDecoration(
                              labelText: 'Subject',
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
                                borderSide: BorderSide(color: colors['primary']!, width: 2),
                              ),
                              contentPadding: const EdgeInsets.symmetric(
                                horizontal: 16,
                                vertical: 12,
                              ),
                            ),
                            style: TextStyle(color: colors['text'], fontSize: 14),
                            dropdownColor: colors['card'],
                            icon: Icon(Icons.arrow_drop_down, color: colors['textSecondary']),
                            items: resultsProvider.availableSubjects.map((subject) {
                              return DropdownMenuItem(
                                value: subject,
                                child: Text(subject == 'all' ? 'All Subjects' : subject.toUpperCase()),
                              );
                            }).toList(),
                            onChanged: (value) {
                              if (value != null) resultsProvider.setSubjectFilter(value);
                            },
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: DropdownButtonFormField<String>(
                            value: resultsProvider.difficultyFilter,
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
                                borderSide: BorderSide(color: colors['primary']!, width: 2),
                              ),
                              contentPadding: const EdgeInsets.symmetric(
                                horizontal: 16,
                                vertical: 12,
                              ),
                            ),
                            style: TextStyle(color: colors['text'], fontSize: 14),
                            dropdownColor: colors['card'],
                            icon: Icon(Icons.arrow_drop_down, color: colors['textSecondary']),
                            items: const [
                              DropdownMenuItem(value: 'all', child: Text('All Difficulties')),
                              DropdownMenuItem(value: 'easy', child: Text('Easy')),
                              DropdownMenuItem(value: 'medium', child: Text('Medium')),
                              DropdownMenuItem(value: 'hard', child: Text('Hard')),
                              DropdownMenuItem(value: 'mixed', child: Text('Mixed')),
                            ],
                            onChanged: (value) {
                              if (value != null) resultsProvider.setDifficultyFilter(value);
                            },
                          ),
                        ),
                      ],
                    ),
                    
                    // Clear Filters Button
                    if (resultsProvider.subjectFilter != 'all' ||
                        resultsProvider.difficultyFilter != 'all')
                      Padding(
                        padding: const EdgeInsets.only(top: 8),
                        child: Align(
                          alignment: Alignment.centerRight,
                          child: TextButton.icon(
                            onPressed: () => resultsProvider.clearFilters(),
                            icon: const Icon(Icons.clear_all, size: 18),
                            label: const Text('Clear Filters'),
                            style: TextButton.styleFrom(
                              foregroundColor: colors['primary'],
                            ),
                          ),
                        ),
                      ),
                  ],
                ),
              ),

              // Results List
              Expanded(
                child: filteredResults.isEmpty
                    ? Center(
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
                                resultsProvider.results.isEmpty
                                    ? 'No quiz results yet'
                                    : 'No results match your filters',
                                style: TextStyle(
                                  color: colors['text'],
                                  fontSize: 16,
                                ),
                                textAlign: TextAlign.center,
                              ),
                              if (resultsProvider.results.isNotEmpty &&
                                  (resultsProvider.subjectFilter != 'all' ||
                                   resultsProvider.difficultyFilter != 'all')) ...[
                                const SizedBox(height: 24),
                                TextButton(
                                  onPressed: () => resultsProvider.clearFilters(),
                                  child: const Text('Clear Filters'),
                                ),
                              ] else if (resultsProvider.results.isEmpty) ...[
                                const SizedBox(height: 24),
                                ElevatedButton.icon(
                                  onPressed: () => context.go('/subjects'),
                                  icon: const Icon(Icons.quiz),
                                  label: const Text('Start a Quiz'),
                                ),
                              ],
                            ],
                          ),
                        ),
                      )
                    : RefreshIndicator(
                        onRefresh: () => resultsProvider.loadResults(),
                        color: colors['primary'],
                        child: ListView.builder(
                          padding: const EdgeInsets.all(16),
                          itemCount: filteredResults.length,
                          itemBuilder: (context, index) {
                            final result = filteredResults[index];
                            return Padding(
                              padding: const EdgeInsets.only(bottom: 16),
                              child: ResultCard(
                                result: result,
                                colors: colors,
                              ),
                            );
                          },
                        ),
                      ),
              ),
            ],
          );
        },
      ),
    );
  }
}

