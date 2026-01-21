import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:reactiquiz/providers/auth_provider.dart';
import 'package:reactiquiz/providers/dashboard_provider.dart';
import 'package:reactiquiz/providers/theme_provider.dart';
import 'package:reactiquiz/widgets/app_drawer.dart';
import 'package:reactiquiz/config/theme_system.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final dashboardProvider = Provider.of<DashboardProvider>(context, listen: false);
      if (dashboardProvider.stats == null && !dashboardProvider.isLoading) {
        dashboardProvider.loadDashboardData();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('ReactiQuiz'),
      ),
      drawer: const AppDrawer(),
      body: Consumer3<AuthProvider, DashboardProvider, ThemeProvider>(
        builder: (context, authProvider, dashboardProvider, themeProvider, child) {
          final colors = themeProvider.currentColors;
          final user = authProvider.user;
          final stats = dashboardProvider.stats;
          
          return RefreshIndicator(
            onRefresh: () => dashboardProvider.loadDashboardData(),
            color: colors['primary'],
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Welcome Section
                  _buildWelcomeSection(context, user, colors),
                  const SizedBox(height: 24),
                  
                  // User Score Card
                  if (stats != null) ...[
                    _buildScoreCard(context, stats, colors),
                    const SizedBox(height: 24),
                  ],
                  
                  // Announcements Section
                  _buildAnnouncementsSection(context, colors),
                  const SizedBox(height: 24),
                  
                  // Quick Actions
                  _buildQuickActions(context, colors),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildWelcomeSection(
    BuildContext context,
    dynamic user,
    Map<String, Color> colors,
  ) {
    final username = user?.username ?? 'Guest';
    final greeting = _getGreeting();
    
    return Card(
      elevation: 2,
      color: colors['card'],
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(
          color: colors['border']!.withOpacity(0.3),
          width: 1,
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  Icons.waving_hand,
                  color: colors['primary'],
                  size: 28,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '$greeting,',
                        style: TextStyle(
                          color: colors['textSecondary'],
                          fontSize: 16,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        username,
                        style: TextStyle(
                          color: colors['text'],
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildScoreCard(
    BuildContext context,
    dynamic stats,
    Map<String, Color> colors,
  ) {
    return Card(
      elevation: 2,
      color: colors['card'],
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(
          color: colors['border']!.withOpacity(0.3),
          width: 1,
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  Icons.emoji_events,
                  color: Colors.amber,
                  size: 28,
                ),
                const SizedBox(width: 12),
                Text(
                  'Your Score',
                  style: TextStyle(
                    color: colors['text'],
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildStatItem(
                  context,
                  'Average Score',
                  '${stats.overallAverageScore.toStringAsFixed(1)}%',
                  Icons.trending_up,
                  Colors.green,
                  colors,
                ),
                Container(
                  width: 1,
                  height: 50,
                  color: colors['border']!.withOpacity(0.3),
                ),
                _buildStatItem(
                  context,
                  'Total Quizzes',
                  stats.totalQuizzes.toString(),
                  Icons.quiz,
                  Colors.blue,
                  colors,
                ),
                Container(
                  width: 1,
                  height: 50,
                  color: colors['border']!.withOpacity(0.3),
                ),
                _buildStatItem(
                  context,
                  'Accuracy',
                  '${stats.accuracy.toStringAsFixed(1)}%',
                  Icons.check_circle,
                  Colors.purple,
                  colors,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatItem(
    BuildContext context,
    String label,
    String value,
    IconData icon,
    Color iconColor,
    Map<String, Color> colors,
  ) {
    return Expanded(
      child: Column(
        children: [
          Icon(icon, color: iconColor, size: 24),
          const SizedBox(height: 8),
          Text(
            value,
            style: TextStyle(
              color: colors['text'],
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: TextStyle(
              color: colors['textSecondary'],
              fontSize: 12,
            ),
            textAlign: TextAlign.center,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _buildAnnouncementsSection(
    BuildContext context,
    Map<String, Color> colors,
  ) {
    return Card(
      elevation: 2,
      color: colors['card'],
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(
          color: colors['border']!.withOpacity(0.3),
          width: 1,
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  Icons.campaign,
                  color: colors['primary'],
                  size: 28,
                ),
                const SizedBox(width: 12),
                Text(
                  'Announcements',
                  style: TextStyle(
                    color: colors['text'],
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: colors['surface'],
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: colors['border']!.withOpacity(0.3),
                  width: 1,
                ),
              ),
              child: Row(
                children: [
                  Icon(
                    Icons.info_outline,
                    color: colors['primary'],
                    size: 24,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'All upcoming events, updates, and contests will be announced here.',
                      style: TextStyle(
                        color: colors['text'],
                        fontSize: 14,
                        height: 1.5,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickActions(
    BuildContext context,
    Map<String, Color> colors,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Quick Actions',
          style: TextStyle(
            color: colors['text'],
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              child: _buildQuickActionCard(
                context,
                'Start Quiz',
                Icons.quiz,
                Colors.blue,
                () => context.go('/subjects'),
                colors,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildQuickActionCard(
                context,
                'View Results',
                Icons.assessment,
                Colors.green,
                () => context.go('/results'),
                colors,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _buildQuickActionCard(
                context,
                'Dashboard',
                Icons.dashboard,
                Colors.purple,
                () => context.go('/dashboard'),
                colors,
              ),
            ),
            const SizedBox(width: 12),
            // Disabled for release
            // Expanded(
            //   child: _buildQuickActionCard(
            //     context,
            //     'AI Center',
            //     Icons.smart_toy,
            //     Colors.teal,
            //     () => context.go('/ai-center'),
            //     colors,
            //   ),
            // ),
            Expanded(
              child: Container(), // Empty space to maintain layout
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildQuickActionCard(
    BuildContext context,
    String title,
    IconData icon,
    Color iconColor,
    VoidCallback onTap,
    Map<String, Color> colors,
  ) {
    return Card(
      elevation: 2,
      color: colors['card'],
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(
          color: colors['border']!.withOpacity(0.3),
          width: 1,
        ),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              Icon(icon, color: iconColor, size: 32),
              const SizedBox(height: 8),
              Text(
                title,
                style: TextStyle(
                  color: colors['text'],
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _getGreeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) {
      return 'Good Morning';
    } else if (hour < 17) {
      return 'Good Afternoon';
    } else {
      return 'Good Evening';
    }
  }
}