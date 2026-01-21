import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:reactiquiz/providers/subjects_provider.dart';
import 'package:reactiquiz/providers/theme_provider.dart';
import 'package:reactiquiz/widgets/app_drawer.dart';
import 'package:reactiquiz/widgets/subject_card.dart';
import 'package:reactiquiz/widgets/loading_indicator.dart';

class SubjectsScreen extends StatefulWidget {
  const SubjectsScreen({super.key});

  @override
  State<SubjectsScreen> createState() => _SubjectsScreenState();
}

class _SubjectsScreenState extends State<SubjectsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final provider = Provider.of<SubjectsProvider>(context, listen: false);
      if (provider.subjects.isEmpty && !provider.isLoading) {
        provider.loadSubjects();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Subjects'),
      ),
      drawer: const AppDrawer(),
      body: Consumer2<SubjectsProvider, ThemeProvider>(
        builder: (context, subjectsProvider, themeProvider, child) {
          final colors = themeProvider.currentColors;

          if (subjectsProvider.isLoading) {
            return const LoadingIndicator(message: 'Loading subjects...');
          }

          if (subjectsProvider.error != null) {
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
                      subjectsProvider.error!,
                      style: TextStyle(
                        color: colors['text'],
                        fontSize: 16,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton(
                      onPressed: () => subjectsProvider.loadSubjects(),
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              ),
            );
          }

          final filteredSubjects = subjectsProvider.filteredSubjects;

          return Column(
            children: [
              // Search bar
              Padding(
                padding: const EdgeInsets.all(16),
                child: TextField(
                  onChanged: (value) => subjectsProvider.setSearchTerm(value),
                  decoration: InputDecoration(
                    labelText: 'Search Subjects',
                    hintText: 'Enter subject name...',
                    prefixIcon: const Icon(Icons.search),
                    suffixIcon: subjectsProvider.searchTerm.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear),
                            onPressed: () => subjectsProvider.setSearchTerm(''),
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
                      borderSide: BorderSide(color: colors['primary']!, width: 2),
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
              ),

              // Subjects grid
              Expanded(
                child: filteredSubjects.isEmpty
                    ? Center(
                        child: Padding(
                          padding: const EdgeInsets.all(24),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                Icons.menu_book_outlined,
                                size: 64,
                                color: colors['textSecondary'],
                              ),
                              const SizedBox(height: 16),
                              Text(
                                subjectsProvider.searchTerm.isNotEmpty
                                    ? 'No subjects found matching "${subjectsProvider.searchTerm}"'
                                    : 'No subjects available',
                                style: TextStyle(
                                  color: colors['text'],
                                  fontSize: 16,
                                ),
                                textAlign: TextAlign.center,
                              ),
                              if (subjectsProvider.searchTerm.isNotEmpty) ...[
                                const SizedBox(height: 24),
                                TextButton(
                                  onPressed: () => subjectsProvider.setSearchTerm(''),
                                  child: const Text('Clear Search'),
                                ),
                              ],
                            ],
                          ),
                        ),
                      )
                    : GridView.builder(
                        padding: const EdgeInsets.all(16),
                        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 2,
                          crossAxisSpacing: 16,
                          mainAxisSpacing: 16,
                          childAspectRatio: 0.75, // Reduced to give more vertical space
                        ),
                        itemCount: filteredSubjects.length,
                        itemBuilder: (context, index) {
                          final subject = filteredSubjects[index];
                          return SubjectCard(
                            subject: subject,
                            onTap: (subjectKey) {
                              context.go('/topics/$subjectKey');
                            },
                            colors: colors,
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

