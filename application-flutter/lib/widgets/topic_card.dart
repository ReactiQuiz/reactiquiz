import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:reactiquiz/models/topic.dart';
import 'package:reactiquiz/config/theme_system.dart';

class TopicCard extends StatelessWidget {
  final Topic topic;
  final Function(Topic topic) onStartQuiz;
  final Function(Topic topic) onStudyFlashcards;
  final Function(Topic topic) onDownloadPdf;
  final Color accentColor;
  final Map<String, Color> colors;

  const TopicCard({
    super.key,
    required this.topic,
    required this.onStartQuiz,
    required this.onStudyFlashcards,
    required this.onDownloadPdf,
    required this.accentColor,
    required this.colors,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      color: colors['card'],
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(
          color: accentColor.withOpacity(0.3),
          width: 1,
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            // Topic name
            Text(
              topic.name,
              style: TextStyle(
                color: accentColor,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 8),
            
            // Metadata chips - use Wrap to prevent overflow
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                if (topic.className.isNotEmpty)
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
                      'Class ${topic.className}',
                      style: TextStyle(
                        color: colors['text'],
                        fontSize: 12,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                if (topic.genre.isNotEmpty)
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
                      topic.genre,
                      style: TextStyle(
                        color: colors['text'],
                        fontSize: 12,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
              ],
            ),
            
            // Description
            if (topic.description.isNotEmpty) ...[
              const SizedBox(height: 12),
              Text(
                topic.description,
                style: TextStyle(
                  color: colors['textSecondary'],
                  fontSize: 14,
                ),
                maxLines: 3,
                overflow: TextOverflow.ellipsis,
              ),
            ],
            
            const SizedBox(height: 16),
            const Divider(height: 1),
            const SizedBox(height: 12),
            
            // Action buttons - use Flexible to prevent overflow
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () => onStartQuiz(topic),
                    icon: const Icon(Icons.play_circle_outline, size: 18),
                    label: const Text('Quiz', style: TextStyle(fontSize: 13)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: accentColor,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      minimumSize: const Size(0, 40), // Fixed height
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => onStudyFlashcards(topic),
                    icon: const Icon(Icons.style, size: 18),
                    label: const Text('Cards', style: TextStyle(fontSize: 13)),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: accentColor,
                      side: BorderSide(color: accentColor),
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      minimumSize: const Size(0, 40), // Fixed height
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            // Download PDF button - full width
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: () => onDownloadPdf(topic),
                icon: const Icon(Icons.download, size: 18),
                label: const Text('Download PDF', style: TextStyle(fontSize: 13)),
                style: OutlinedButton.styleFrom(
                  foregroundColor: colors['textSecondary'],
                  side: BorderSide(color: colors['border']!),
                  padding: const EdgeInsets.symmetric(vertical: 10),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  minimumSize: const Size(0, 40), // Fixed height
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}