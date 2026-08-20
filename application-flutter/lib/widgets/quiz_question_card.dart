import 'package:flutter/material.dart';
import 'package:reactiquiz/models/question.dart';

class QuizQuestionCard extends StatelessWidget {
  final Question question;
  final int questionNumber;
  final int? selectedOptionIndex;
  final Function(String questionId, int optionIndex) onOptionSelect;
  final Color accentColor;
  final Map<String, Color> colors;

  const QuizQuestionCard({
    super.key,
    required this.question,
    required this.questionNumber,
    required this.selectedOptionIndex,
    required this.onOptionSelect,
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
          color: colors['border']!.withOpacity(0.2),
          width: 1,
        ),
      ),
      margin: const EdgeInsets.only(bottom: 20),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Question number
            Text(
              'Question $questionNumber:',
              style: TextStyle(
                color: colors['textSecondary'],
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 12),
            
            // Question text
            Text(
              question.text,
              style: TextStyle(
                color: colors['text'],
                fontSize: 16,
                height: 1.5,
              ),
            ),
            const SizedBox(height: 20),
            
            // Options
            ...question.options.asMap().entries.map((entry) {
              final index = entry.key;
              final option = entry.value;
              final isSelected = selectedOptionIndex == index;
              
              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                child: InkWell(
                  onTap: () => onOptionSelect(question.id, index),
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: isSelected 
                          ? accentColor.withOpacity(0.15)
                          : colors['surface']!.withOpacity(0.5),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: isSelected 
                            ? accentColor
                            : colors['border']!.withOpacity(0.3),
                        width: isSelected ? 2 : 1,
                      ),
                    ),
                    child: Row(
                      children: [
                        // Option letter
                        Container(
                          width: 32,
                          height: 32,
                          decoration: BoxDecoration(
                            color: isSelected 
                                ? accentColor
                                : colors['surface'],
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(
                              color: isSelected 
                                  ? accentColor
                                  : colors['border']!,
                              width: 1,
                            ),
                          ),
                          child: Center(
                            child: Text(
                              String.fromCharCode(65 + index), // A, B, C, D
                              style: TextStyle(
                                color: isSelected 
                                    ? Colors.white
                                    : colors['text'],
                                fontSize: 14,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        // Option text
                        Expanded(
                          child: Text(
                            option.text,
                            style: TextStyle(
                              color: isSelected 
                                  ? accentColor
                                  : colors['text'],
                              fontSize: 15,
                              fontWeight: isSelected 
                                  ? FontWeight.w600
                                  : FontWeight.normal,
                            ),
                          ),
                        ),
                        // Selected indicator
                        if (isSelected)
                          Icon(
                            Icons.check_circle,
                            color: accentColor,
                            size: 20,
                          ),
                      ],
                    ),
                  ),
                ),
              );
            }),
          ],
        ),
      ),
    );
  }
}
