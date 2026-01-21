import 'package:flutter/material.dart';

class QuizTimer extends StatelessWidget {
  final int timeLimit; // in seconds, 0 if no limit
  final int elapsedTime; // in seconds
  final bool timerActive;
  final Color accentColor;

  const QuizTimer({
    super.key,
    required this.timeLimit,
    required this.elapsedTime,
    required this.timerActive,
    required this.accentColor,
  });

  String _formatTime(int totalSeconds) {
    if (totalSeconds < 0) return '00 : 00';
    final minutes = totalSeconds ~/ 60;
    final seconds = totalSeconds % 60;
    return '${minutes.toString().padLeft(2, '0')} : ${seconds.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    final displayTime = timeLimit > 0 ? (timeLimit - elapsedTime).clamp(0, timeLimit) : elapsedTime;
    final isLowTime = timeLimit > 0 && displayTime < 600; // Less than 10 minutes
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: isLowTime ? Colors.red.withOpacity(0.1) : accentColor.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isLowTime ? Colors.red.withOpacity(0.3) : accentColor.withOpacity(0.3),
          width: 1,
        ),
      ),
      child: Text(
        _formatTime(displayTime),
        style: TextStyle(
          fontSize: 18,
          fontWeight: FontWeight.bold,
          fontFamily: 'monospace',
          color: isLowTime ? Colors.red : accentColor,
        ),
      ),
    );
  }
}
