import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:reactiquiz/widgets/app_drawer.dart';
import 'package:reactiquiz/providers/theme_provider.dart';

class PrivacyPolicyScreen extends StatelessWidget {
  const PrivacyPolicyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final themeProvider = Provider.of<ThemeProvider>(context, listen: false);
    final colors = themeProvider.currentColors;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Privacy Policy'),
      ),
      drawer: const AppDrawer(),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Title
            Center(
              child: Text(
                'Privacy Policy',
                style: TextStyle(
                  color: colors['text'],
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            const SizedBox(height: 8),
            // Last updated
            Center(
              child: Text(
                'Last updated: ${DateFormat('MMM dd, yyyy').format(DateTime.now())}',
                style: TextStyle(
                  color: colors['textSecondary'],
                  fontSize: 12,
                ),
              ),
            ),
            const SizedBox(height: 32),
            // Introduction
            _buildSection(
              title: 'Introduction',
              content: 'ReactiQuiz ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our educational quiz platform.',
              colors: colors,
            ),
            const SizedBox(height: 24),
            // Information We Collect
            _buildSection(
              title: 'Information We Collect',
              content: 'We collect information you provide directly to us, such as when you create an account, take quizzes, or contact us for support. This may include:',
              colors: colors,
            ),
            _buildBulletList(
              items: [
                'Name and email address',
                'Quiz responses and performance data',
                'Account preferences and settings',
                'Communication records',
              ],
              colors: colors,
            ),
            const SizedBox(height: 24),
            // How We Use Your Information
            _buildSection(
              title: 'How We Use Your Information',
              content: 'We use the information we collect to:',
              colors: colors,
            ),
            _buildBulletList(
              items: [
                'Provide and maintain our educational services',
                'Track your learning progress and performance',
                'Improve our platform and develop new features',
                'Send you important updates about our services',
                'Respond to your inquiries and provide support',
              ],
              colors: colors,
            ),
            const SizedBox(height: 24),
            // Third-Party Services
            _buildSection(
              title: 'Third-Party Services',
              content: 'We use Google AdSense to display advertisements on our platform. AdSense may use cookies and similar technologies to provide personalized ads based on your interests. You can opt out of personalized advertising by visiting Google\'s Ad Settings.',
              colors: colors,
            ),
            const SizedBox(height: 24),
            // Data Security
            _buildSection(
              title: 'Data Security',
              content: 'We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.',
              colors: colors,
            ),
            const SizedBox(height: 24),
            // Contact Us
            _buildSection(
              title: 'Contact Us',
              content: 'If you have any questions about this Privacy Policy, please contact us at:',
              colors: colors,
            ),
            const SizedBox(height: 8),
            Text(
              'Email: reactiquiz@gmail.com\nWebsite: https://reactiquiz.web.app',
              style: TextStyle(
                color: colors['text'],
                fontSize: 14,
                height: 1.7,
              ),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildSection({
    required String title,
    required String content,
    required Map<String, Color> colors,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: TextStyle(
            color: colors['text'],
            fontSize: 20,
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 12),
        Text(
          content,
          style: TextStyle(
            color: colors['text'],
            fontSize: 14,
            height: 1.7,
          ),
        ),
      ],
    );
  }

  Widget _buildBulletList({
    required List<String> items,
    required Map<String, Color> colors,
  }) {
    return Padding(
      padding: const EdgeInsets.only(left: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: items.map((item) {
          return Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '• ',
                  style: TextStyle(
                    color: colors['text'],
                    fontSize: 14,
                    height: 1.7,
                  ),
                ),
                Expanded(
                  child: Text(
                    item,
                    style: TextStyle(
                      color: colors['text'],
                      fontSize: 14,
                      height: 1.7,
                    ),
                  ),
                ),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }
}

