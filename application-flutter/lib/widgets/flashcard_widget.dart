import 'package:flutter/material.dart';
import 'package:reactiquiz/models/question.dart';
import 'package:reactiquiz/config/theme_system.dart';

class FlashcardWidget extends StatefulWidget {
  final Question question;
  final Color accentColor;
  final Map<String, Color> colors;
  final int cardNumber;
  final int totalCards;

  const FlashcardWidget({
    super.key,
    required this.question,
    required this.accentColor,
    required this.colors,
    required this.cardNumber,
    required this.totalCards,
  });

  @override
  State<FlashcardWidget> createState() => _FlashcardWidgetState();
}

class _FlashcardWidgetState extends State<FlashcardWidget>
    with SingleTickerProviderStateMixin {
  bool _isFlipped = false;
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );
    _animation = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _toggleFlip() {
    setState(() {
      _isFlipped = !_isFlipped;
      if (_isFlipped) {
        _controller.forward();
      } else {
        _controller.reverse();
      }
    });
  }

  QuestionOption _getCorrectOption() {
    try {
      return widget.question.options.firstWhere(
        (opt) => opt.id == widget.question.correctOptionId,
      );
    } catch (e) {
      // If not found, return first option or default
      if (widget.question.options.isNotEmpty) {
        return widget.question.options[0];
      }
      return QuestionOption(id: '', text: 'No answer available');
    }
  }

  String _getDifficultyText() {
    return widget.question.getDifficultyText();
  }

  Color _getDifficultyColor() {
    return ThemeSystem.getDifficultyColor(_getDifficultyText().toLowerCase());
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: _toggleFlip,
      child: Container(
        width: double.infinity,
        height: 500,
        child: Stack(
          children: [
            // Front of card
            AnimatedSwitcher(
              duration: const Duration(milliseconds: 300),
              child: _isFlipped
                  ? const SizedBox.shrink()
                  : _buildFrontCard(),
            ),
            // Back of card
            AnimatedSwitcher(
              duration: const Duration(milliseconds: 300),
              child: _isFlipped
                  ? _buildBackCard()
                  : const SizedBox.shrink(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFrontCard() {
    return Card(
      key: const ValueKey('front'),
      elevation: 8,
      color: widget.colors['card'],
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
        side: BorderSide(
          color: widget.accentColor.withOpacity(0.5),
          width: 2,
        ),
      ),
      child: Container(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: widget.accentColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    'Question ${widget.cardNumber}',
                    style: TextStyle(
                      color: widget.accentColor,
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: _getDifficultyColor().withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    _getDifficultyText(),
                    style: TextStyle(
                      color: _getDifficultyColor(),
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            Expanded(
              child: SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      widget.question.text,
                      style: TextStyle(
                        color: widget.colors['text'],
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                        height: 1.5,
                      ),
                    ),
                    const SizedBox(height: 24),
                    const Divider(),
                    const SizedBox(height: 16),
                    Text(
                      'Options:',
                      style: TextStyle(
                        color: widget.colors['textSecondary'],
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 12),
                    ...widget.question.options.asMap().entries.map((entry) {
                      final index = entry.key;
                      final option = entry.value;
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: widget.colors['surface'],
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(
                              color: widget.colors['border']!,
                              width: 1,
                            ),
                          ),
                          child: Row(
                            children: [
                              Container(
                                width: 24,
                                height: 24,
                                decoration: BoxDecoration(
                                  color: widget.accentColor.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Center(
                                  child: Text(
                                    option.id.isEmpty ? String.fromCharCode(65 + index) : option.id.toUpperCase(),
                                    style: TextStyle(
                                      color: widget.accentColor,
                                      fontSize: 12,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Text(
                                  option.text,
                                  style: TextStyle(
                                    color: widget.colors['text'],
                                    fontSize: 14,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    }),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.touch_app,
                  color: widget.colors['textSecondary'],
                  size: 16,
                ),
                const SizedBox(width: 8),
                Text(
                  'Tap to flip',
                  style: TextStyle(
                    color: widget.colors['textSecondary'],
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBackCard() {
    final correctOption = _getCorrectOption();
    
    return Card(
      key: const ValueKey('back'),
      elevation: 8,
      color: widget.colors['card'],
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
        side: BorderSide(
          color: Colors.green.withOpacity(0.5),
          width: 2,
        ),
      ),
      child: Container(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.green.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.check_circle, color: Colors.green, size: 16),
                      SizedBox(width: 6),
                      Text(
                        'Correct Answer',
                        style: TextStyle(
                          color: Colors.green,
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            Expanded(
              child: SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.green.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: Colors.green.withOpacity(0.3),
                          width: 1,
                        ),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Container(
                                width: 28,
                                height: 28,
                                decoration: BoxDecoration(
                                  color: Colors.green,
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Center(
                                  child: Text(
                                    correctOption.id.isEmpty ? 'A' : correctOption.id.toUpperCase(),
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 14,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Text(
                                  correctOption.text,
                                  style: TextStyle(
                                    color: widget.colors['text'],
                                    fontSize: 16,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    if (widget.question.explanation != null &&
                        widget.question.explanation!.isNotEmpty) ...[
                      const SizedBox(height: 24),
                      const Divider(),
                      const SizedBox(height: 16),
                      Text(
                        'Explanation:',
                        style: TextStyle(
                          color: widget.colors['textSecondary'],
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: widget.colors['surface'],
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: widget.colors['border']!,
                            width: 1,
                          ),
                        ),
                        child: Text(
                          widget.question.explanation!,
                          style: TextStyle(
                            color: widget.colors['text'],
                            fontSize: 14,
                            height: 1.5,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.touch_app,
                  color: widget.colors['textSecondary'],
                  size: 16,
                ),
                const SizedBox(width: 8),
                Text(
                  'Tap to flip back',
                  style: TextStyle(
                    color: widget.colors['textSecondary'],
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
