import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:reactiquiz/models/subject.dart';
import 'package:reactiquiz/config/theme_system.dart';

class SubjectCard extends StatelessWidget {
  final Subject subject;
  final Function(String subjectKey) onTap;
  final Map<String, Color> colors;

  const SubjectCard({
    super.key,
    required this.subject,
    required this.onTap,
    required this.colors,
  });

  IconData _getIconData(String iconName) {
    switch (iconName.toLowerCase()) {
      case 'physics':
      case 'science':
        return Icons.science;
      case 'chemistry':
        return Icons.biotech;
      case 'biology':
        return Icons.eco;
      case 'mathematics':
      case 'math':
        return Icons.calculate;
      case 'gk':
      case 'general knowledge':
        return Icons.menu_book;
      case 'english':
        return Icons.language;
      default:
        return Icons.subject;
    }
  }

  @override
  Widget build(BuildContext context) {
    final subjectColor = ThemeSystem.getSubjectColor(subject.subjectKey);
    
    return Card(
      elevation: 3,
      color: colors['card'],
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(
          color: subjectColor.withOpacity(0.3),
          width: 1.5,
        ),
      ),
      child: InkWell(
        onTap: () => onTap(subject.subjectKey),
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: subjectColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  _getIconData(subject.iconName),
                  color: subjectColor,
                  size: 32,
                ),
              ),
              const SizedBox(height: 12),
              Flexible(
                child: Text(
                  subject.name,
                  style: TextStyle(
                    color: subjectColor,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              if (subject.description.isNotEmpty) ...[
                const SizedBox(height: 6),
                Flexible(
                  child: Text(
                    subject.description,
                    style: TextStyle(
                      color: colors['textSecondary'],
                      fontSize: 11,
                    ),
                    textAlign: TextAlign.center,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Flexible(
                    child: Text(
                      'Explore',
                      style: TextStyle(
                        color: subjectColor,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const SizedBox(width: 4),
                  Icon(
                    Icons.arrow_forward,
                    color: subjectColor,
                    size: 14,
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