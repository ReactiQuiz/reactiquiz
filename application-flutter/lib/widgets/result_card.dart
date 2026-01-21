import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:reactiquiz/models/quiz_result.dart';
import 'package:reactiquiz/config/theme_system.dart';
import 'package:intl/intl.dart';

class ResultCard extends StatelessWidget {
  final QuizResult result;
  final Map<String, Color> colors;

  const ResultCard({
    super.key,
    required this.result,
    required this.colors,
  });

  Color _getScoreColor(double percentage) {
    if (percentage >= 70) return Colors.green;
    if (percentage >= 40) return Colors.orange;
    return Colors.red;
  }

  String _formatTimestamp(String timestamp) {
    try {
      final date = DateTime.parse(timestamp);
      final now = DateTime.now();
      final difference = now.difference(date);
      
      if (difference.inDays == 0) {
        if (difference.inHours == 0) {
          if (difference.inMinutes == 0) {
            return 'Just now';
          }
          return '${difference.inMinutes}m ago';
        }
        return '${difference.inHours}h ago';
      } else if (difference.inDays < 7) {
        return '${difference.inDays}d ago';
      } else {
        return DateFormat('MMM dd, yyyy').format(date);
      }
    } catch (e) {
      return timestamp;
    }
  }

  String _formatTimeSpent(int seconds) {
    if (seconds < 60) {
      return '${seconds}s';
    } else if (seconds < 3600) {
      final minutes = seconds ~/ 60;
      final remainingSeconds = seconds % 60;
      return '${minutes}m ${remainingSeconds}s';
    } else {
      final hours = seconds ~/ 3600;
      final minutes = (seconds % 3600) ~/ 60;
      return '${hours}h ${minutes}m';
    }
  }

  String _getSubjectKey(String subject) {
    // If subject is empty, try to derive from topic name or return default
    if (subject.isEmpty || subject.trim().isEmpty) {
      // Try to extract subject from topic name if possible
      // For now, return 'physics' as default
      return 'physics';
    }
    return subject.toLowerCase();
  }

  @override
  Widget build(BuildContext context) {
    // Ensure we have a subject - use default if empty
    final effectiveSubject = result.subject.isNotEmpty ? result.subject : 'physics';
    final subjectColor = ThemeSystem.getSubjectColor(_getSubjectKey(effectiveSubject));
    final scoreColor = _getScoreColor(result.percentage);
    
    return Card(
      elevation: 2,
      color: colors['card'],
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(
          color: subjectColor.withOpacity(0.3),
          width: 1,
        ),
      ),
      child: InkWell(
        onTap: () => context.go('/results/${result.id}'),
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header with topic name and subject
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          result.topicName,
                          style: TextStyle(
                            color: subjectColor,
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            // Always show subject chip
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: colors['surface'],
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(
                                  color: colors['border']!,
                                  width: 1,
                                ),
                              ),
                              child: Text(
                                effectiveSubject.toUpperCase(),
                                style: TextStyle(
                                  color: colors['textSecondary'],
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: colors['surface'],
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(
                                  color: colors['border']!,
                                  width: 1,
                                ),
                              ),
                              child: Text(
                                result.difficulty.toUpperCase(),
                                style: TextStyle(
                                  color: colors['textSecondary'],
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  // Percentage chip
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: scoreColor,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      '${result.percentage.toStringAsFixed(0)}%',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
              
              const SizedBox(height: 16),
              const Divider(height: 1),
              const SizedBox(height: 12),
              
              // Score and progress
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Score',
                        style: TextStyle(
                          color: colors['textSecondary'],
                          fontSize: 12,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '${result.correctAnswers}/${result.totalQuestions}',
                        style: TextStyle(
                          color: colors['text'],
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        'Time',
                        style: TextStyle(
                          color: colors['textSecondary'],
                          fontSize: 12,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        _formatTimeSpent(result.timeSpent),
                        style: TextStyle(
                          color: colors['text'],
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              
              const SizedBox(height: 12),
              
              // Progress bar
              ClipRRect(
                borderRadius: BorderRadius.circular(4),
                child: LinearProgressIndicator(
                  value: result.percentage / 100,
                  backgroundColor: colors['border']!.withOpacity(0.2),
                  valueColor: AlwaysStoppedAnimation<Color>(subjectColor),
                  minHeight: 8,
                ),
              ),
              
              const SizedBox(height: 12),
              
              // Footer with timestamp
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    _formatTimestamp(result.timestamp),
                    style: TextStyle(
                      color: colors['textSecondary'],
                      fontSize: 12,
                    ),
                  ),
                  Icon(
                    Icons.arrow_forward_ios,
                    size: 14,
                    color: colors['textSecondary'],
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
