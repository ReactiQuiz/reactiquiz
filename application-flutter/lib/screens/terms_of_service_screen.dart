import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:reactiquiz/widgets/app_drawer.dart';
import 'package:reactiquiz/providers/theme_provider.dart';

class TermsOfServiceScreen extends StatelessWidget {
  const TermsOfServiceScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final themeProvider = Provider.of<ThemeProvider>(context, listen: false);
    final colors = themeProvider.currentColors;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Terms of Service'),
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
                'Terms of Service',
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
            // Acceptance of Terms
            _buildSection(
              title: 'Acceptance of Terms',
              content: 'By accessing and using ReactiQuiz, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.',
              colors: colors,
            ),
            const SizedBox(height: 24),
            // Use License
            _buildSection(
              title: 'Use License',
              content: 'Permission is granted to temporarily use ReactiQuiz for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:',
              colors: colors,
            ),
            _buildBulletList(
              items: [
                'Modify or copy the materials',
                'Use the materials for any commercial purpose or for any public display',
                'Attempt to reverse engineer any software contained on the website',
                'Remove any copyright or other proprietary notations from the materials',
              ],
              colors: colors,
            ),
            const SizedBox(height: 24),
            // User Accounts
            _buildSection(
              title: 'User Accounts',
              content: 'When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.',
              colors: colors,
            ),
            const SizedBox(height: 24),
            // Prohibited Uses
            _buildSection(
              title: 'Prohibited Uses',
              content: 'You may not use our service:',
              colors: colors,
            ),
            _buildBulletList(
              items: [
                'For any unlawful purpose or to solicit others to perform unlawful acts',
                'To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances',
                'To infringe upon or violate our intellectual property rights or the intellectual property rights of others',
                'To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate',
                'To submit false or misleading information',
              ],
              colors: colors,
            ),
            const SizedBox(height: 24),
            // Content
            _buildSection(
              title: 'Content',
              content: 'Our service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material. You are responsible for the content that you post to the service, including its legality, reliability, and appropriateness.',
              colors: colors,
            ),
            const SizedBox(height: 24),
            // Disclaimer
            _buildSection(
              title: 'Disclaimer',
              content: 'The information on this website is provided on an "as is" basis. To the fullest extent permitted by law, this Company excludes all representations, warranties, conditions and terms relating to our website and the use of this website.',
              colors: colors,
            ),
            const SizedBox(height: 24),
            // Contact Information
            _buildSection(
              title: 'Contact Information',
              content: 'If you have any questions about these Terms of Service, please contact us at:',
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

