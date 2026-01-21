import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:reactiquiz/widgets/app_drawer.dart';
import 'package:reactiquiz/providers/theme_provider.dart';
import 'package:reactiquiz/config/theme_system.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final themeProvider = Provider.of<ThemeProvider>(context);
    final colors = themeProvider.currentColors;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings'),
      ),
      drawer: const AppDrawer(),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Appearance Section
          _buildSectionHeader(
            context: context,
            icon: Icons.palette,
            title: 'Appearance',
            colors: colors,
          ),
          const SizedBox(height: 16),
          _buildThemeSelector(
            context: context,
            themeProvider: themeProvider,
            colors: colors,
          ),
          const SizedBox(height: 32),

          // Additional Settings (for future expansion)
          _buildSectionHeader(
            context: context,
            icon: Icons.tune,
            title: 'General',
            colors: colors,
          ),
          const SizedBox(height: 16),
          _buildSettingsCard(
            context: context,
            colors: colors,
            child: Column(
              children: [
                _buildSettingsTile(
                  context: context,
                  icon: Icons.info_outline,
                  title: 'About',
                  subtitle: 'App version and information',
                  colors: colors,
                  onTap: () {
                    _showAboutDialog(context, colors);
                  },
                ),
                const Divider(height: 1),
                _buildSettingsTile(
                  context: context,
                  icon: Icons.privacy_tip_outlined,
                  title: 'Privacy Policy',
                  subtitle: 'View our privacy policy',
                  colors: colors,
                  onTap: () {
                    context.go('/privacy-policy');
                  },
                ),
                const Divider(height: 1),
                _buildSettingsTile(
                  context: context,
                  icon: Icons.description_outlined,
                  title: 'Terms of Service',
                  subtitle: 'View terms and conditions',
                  colors: colors,
                  onTap: () {
                    context.go('/terms-of-service');
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader({
    required BuildContext context,
    required IconData icon,
    required String title,
    required Map<String, Color> colors,
  }) {
    return Row(
      children: [
        Icon(icon, color: colors['primary'], size: 24),
        const SizedBox(width: 12),
        Text(
          title,
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: colors['text'],
          ),
        ),
      ],
    );
  }

  Widget _buildThemeSelector({
    required BuildContext context,
    required ThemeProvider themeProvider,
    required Map<String, Color> colors,
  }) {
    return _buildSettingsCard(
      context: context,
      colors: colors,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Text(
              'Choose Theme',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: colors['text'],
              ),
            ),
          ),
          const Divider(height: 1),
          _buildThemeOption(
            context: context,
            themeProvider: themeProvider,
            themeMode: AppThemeMode.gray,
            title: 'Gray',
            description: 'Classic gray theme with purple accents',
            previewColors: ThemeSystem.grayColors,
            colors: colors,
          ),
          const Divider(height: 1),
          _buildThemeOption(
            context: context,
            themeProvider: themeProvider,
            themeMode: AppThemeMode.dark,
            title: 'Dark',
            description: 'Deep dark theme with blue accents',
            previewColors: ThemeSystem.darkColors,
            colors: colors,
          ),
          const Divider(height: 1),
          _buildThemeOption(
            context: context,
            themeProvider: themeProvider,
            themeMode: AppThemeMode.neon,
            title: 'Neon',
            description: 'Vibrant neon theme with cyan and purple',
            previewColors: ThemeSystem.neonColors,
            colors: colors,
          ),
        ],
      ),
    );
  }

  Widget _buildThemeOption({
    required BuildContext context,
    required ThemeProvider themeProvider,
    required AppThemeMode themeMode,
    required String title,
    required String description,
    required Map<String, Color> previewColors,
    required Map<String, Color> colors,
  }) {
    final isSelected = themeProvider.currentTheme == themeMode;

    return InkWell(
      onTap: () {
        themeProvider.setTheme(themeMode);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Theme changed to $title',
              style: TextStyle(color: previewColors['text']),
            ),
            backgroundColor: previewColors['card'],
            duration: const Duration(seconds: 1),
          ),
        );
      },
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            // Theme Preview
            Container(
              width: 60,
              height: 60,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: isSelected
                      ? previewColors['primary']!
                      : colors['border']!,
                  width: isSelected ? 3 : 1,
                ),
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(11),
                child: Stack(
                  children: [
                    // Background
                    Container(color: previewColors['background']),
                    // Card preview
                    Positioned(
                      top: 8,
                      left: 8,
                      right: 8,
                      child: Container(
                        height: 12,
                        decoration: BoxDecoration(
                          color: previewColors['card'],
                          borderRadius: BorderRadius.circular(3),
                        ),
                      ),
                    ),
                    // Primary accent
                    Positioned(
                      bottom: 8,
                      left: 8,
                      right: 8,
                      child: Container(
                        height: 8,
                        decoration: BoxDecoration(
                          color: previewColors['primary'],
                          borderRadius: BorderRadius.circular(3),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(width: 16),
            // Theme Info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        title,
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: isSelected
                              ? previewColors['primary']
                              : colors['text'],
                        ),
                      ),
                      if (isSelected) ...[
                        const SizedBox(width: 8),
                        Icon(
                          Icons.check_circle,
                          size: 20,
                          color: previewColors['primary'],
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    description,
                    style: TextStyle(
                      fontSize: 12,
                      color: colors['textSecondary'],
                    ),
                  ),
                ],
              ),
            ),
            // Radio button
            Radio<AppThemeMode>(
              value: themeMode,
              groupValue: themeProvider.currentTheme,
              onChanged: (value) {
                if (value != null) {
                  themeProvider.setTheme(value);
                }
              },
              activeColor: previewColors['primary'],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSettingsCard({
    required BuildContext context,
    required Map<String, Color> colors,
    required Widget child,
  }) {
    return Card(
      color: colors['card'],
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: child,
    );
  }

  Widget _buildSettingsTile({
    required BuildContext context,
    required IconData icon,
    required String title,
    required String subtitle,
    required Map<String, Color> colors,
    required VoidCallback onTap,
  }) {
    return ListTile(
      leading: Icon(icon, color: colors['primary']),
      title: Text(
        title,
        style: TextStyle(
          color: colors['text'],
          fontWeight: FontWeight.w500,
        ),
      ),
      subtitle: Text(
        subtitle,
        style: TextStyle(
          color: colors['textSecondary'],
          fontSize: 12,
        ),
      ),
      trailing: Icon(
        Icons.chevron_right,
        color: colors['textSecondary'],
      ),
      onTap: onTap,
    );
  }

  void _showAboutDialog(BuildContext context, Map<String, Color> colors) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: colors['card'],
        title: Row(
          children: [
            Icon(Icons.quiz, color: colors['primary']),
            const SizedBox(width: 12),
            const Text('ReactiQuiz'),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Version 1.0.0',
              style: TextStyle(
                color: colors['text'],
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 16),
            Text(
              'ReactiQuiz is a comprehensive quiz application designed to help students practice and excel in their studies.',
              style: TextStyle(color: colors['textSecondary']),
            ),
            const SizedBox(height: 16),
            Text(
              'Features:',
              style: TextStyle(
                color: colors['text'],
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 8),
            _buildFeatureItem(colors, 'Multiple subjects and topics'),
            _buildFeatureItem(colors, 'Interactive quizzes'),
            _buildFeatureItem(colors, 'Performance tracking'),
            _buildFeatureItem(colors, 'Flashcards system'),
            _buildFeatureItem(colors, 'Customizable themes'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(
              'Close',
              style: TextStyle(color: colors['primary']),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFeatureItem(Map<String, Color> colors, String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Row(
        children: [
          Icon(
            Icons.check_circle,
            size: 16,
            color: colors['primary'],
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              text,
              style: TextStyle(
                color: colors['textSecondary'],
                fontSize: 14,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
