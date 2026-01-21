import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:reactiquiz/providers/dashboard_provider.dart';
import 'package:reactiquiz/providers/theme_provider.dart';
import 'package:reactiquiz/widgets/loading_indicator.dart';
import 'package:reactiquiz/widgets/app_drawer.dart';
import 'package:reactiquiz/config/theme_system.dart';
import 'package:fl_chart/fl_chart.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );
    _fadeAnimation = CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeIn,
    );
    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard'),
        actions: [
          Consumer<DashboardProvider>(
            builder: (context, provider, _) {
              if (provider.isLoading) {
                return const Padding(
                  padding: EdgeInsets.all(16.0),
                  child: SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  ),
                );
              }
              return IconButton(
                icon: const Icon(Icons.refresh),
                onPressed: () => provider.loadDashboardData(),
                tooltip: 'Refresh',
              );
            },
          ),
        ],
      ),
      drawer: const AppDrawer(),
      body: Consumer2<DashboardProvider, ThemeProvider>(
        builder: (context, dashboardProvider, themeProvider, child) {
          if (dashboardProvider.isLoading) {
            return const LoadingIndicator(message: 'Loading dashboard data...');
          }

          if (dashboardProvider.error != null) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.error_outline, size: 64, color: Colors.red),
                  const SizedBox(height: 16),
                  Text(
                    dashboardProvider.error!,
                    style: const TextStyle(color: Colors.red),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () => dashboardProvider.loadDashboardData(),
                    child: const Text('Retry'),
                  ),
                ],
              ),
            );
          }

          final stats = dashboardProvider.stats;
          final colors = themeProvider.currentColors;

          return RefreshIndicator(
            onRefresh: () => dashboardProvider.loadDashboardData(),
            color: colors['primary'],
            child: FadeTransition(
              opacity: _fadeAnimation,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Header Section
                    _buildHeaderSection(context, colors),
                    const SizedBox(height: 20),
                    
                    // Filters - Always show
                    _buildFiltersSection(context, dashboardProvider, colors),
                    const SizedBox(height: 24),
                    
                    // Statistics Cards - Show if data exists, otherwise show empty state
                    if (stats != null) ...[
                      _buildStatisticsCards(context, stats, colors),
                      const SizedBox(height: 24),
                      
                      // Overall Performance Chart
                      _buildPerformanceChart(context, stats, colors),
                      const SizedBox(height: 24),
                      
                      // Subject Breakdown
                      _buildSubjectBreakdown(context, stats, colors),
                      const SizedBox(height: 24),
                      
                      // Difficulty Performance
                      _buildDifficultyPerformance(context, stats, colors),
                    ] else ...[
                      _buildEmptyState(context, colors),
                    ],
                    const SizedBox(height: 24),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildHeaderSection(
    BuildContext context,
    Map<String, Color> colors,
  ) {
    return Row(
      children: [
        Icon(
          Icons.analytics_outlined,
          color: colors['primary'],
          size: 28,
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            'Dashboard Summary',
            style: TextStyle(
              color: colors['text'],
              fontSize: 22,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildFiltersSection(
    BuildContext context,
    DashboardProvider provider,
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
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Expanded(
              child: DropdownButtonFormField<String>(
                value: provider.timeFilter,
                decoration: InputDecoration(
                  labelText: 'Time Period',
                  labelStyle: TextStyle(
                    color: colors['textSecondary'],
                    fontSize: 14,
                  ),
                  filled: true,
                  fillColor: colors['surface'],
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: colors['border']!),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: colors['border']!),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: colors['primary']!, width: 2),
                  ),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                ),
                style: TextStyle(color: colors['text'], fontSize: 14),
                dropdownColor: colors['card'],
                icon: Icon(Icons.arrow_drop_down, color: colors['textSecondary']),
                items: const [
                  DropdownMenuItem(value: 'week', child: Text('Last 7 Days')),
                  DropdownMenuItem(value: 'month', child: Text('Last 30 Days')),
                  DropdownMenuItem(value: 'quarter', child: Text('Last 90 Days')),
                  DropdownMenuItem(value: 'year', child: Text('Last Year')),
                  DropdownMenuItem(value: 'all', child: Text('All Time')),
                ],
                onChanged: (value) {
                  if (value != null) provider.setTimeFilter(value);
                },
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: DropdownButtonFormField<String>(
                value: provider.subjectFilter,
                decoration: InputDecoration(
                  labelText: 'Subject',
                  labelStyle: TextStyle(
                    color: colors['textSecondary'],
                    fontSize: 14,
                  ),
                  filled: true,
                  fillColor: colors['surface'],
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: colors['border']!),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: colors['border']!),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: colors['primary']!, width: 2),
                  ),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                ),
                style: TextStyle(color: colors['text'], fontSize: 14),
                dropdownColor: colors['card'],
                icon: Icon(Icons.arrow_drop_down, color: colors['textSecondary']),
                items: provider.availableSubjects.map((subject) {
                  return DropdownMenuItem(
                    value: subject,
                    child: Text(subject == 'all' ? 'All Subjects' : subject.toUpperCase()),
                  );
                }).toList(),
                onChanged: (value) {
                  if (value != null) provider.setSubjectFilter(value);
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatisticsCards(
    BuildContext context,
    DashboardStats stats,
    Map<String, Color> colors,
  ) {
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 2,
      crossAxisSpacing: 16,
      mainAxisSpacing: 16,
      childAspectRatio: 1.3,
      children: [
        _buildStatCard(
          context,
          'Total Quizzes',
          stats.totalQuizzes.toString(),
          Icons.quiz,
          Colors.blue,
          colors,
        ),
        _buildStatCard(
          context,
          'Average Score',
          '${stats.overallAverageScore.toStringAsFixed(1)}%',
          Icons.trending_up,
          Colors.green,
          colors,
        ),
        _buildStatCard(
          context,
          'Total Questions',
          stats.totalQuestions.toString(),
          Icons.help_outline,
          Colors.orange,
          colors,
        ),
        _buildStatCard(
          context,
          'Accuracy',
          '${stats.accuracy.toStringAsFixed(1)}%',
          Icons.check_circle,
          Colors.purple,
          colors,
        ),
      ],
    );
  }

  Widget _buildStatCard(
    BuildContext context,
    String title,
    String value,
    IconData icon,
    Color iconColor,
    Map<String, Color> colors,
  ) {
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0.0, end: 1.0),
      duration: const Duration(milliseconds: 600),
      curve: Curves.easeOut,
      builder: (context, opacity, child) {
        return Opacity(
          opacity: opacity,
          child: Transform.translate(
            offset: Offset(0, 10 * (1 - opacity)),
            child: Card(
              elevation: 3,
              color: colors['card'],
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
                side: BorderSide(
                  color: colors['border']!.withOpacity(0.2),
                  width: 1,
                ),
              ),
              child: Padding(
                padding: const EdgeInsets.all(14),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: iconColor.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Icon(icon, color: iconColor, size: 20),
                    ),
                    const SizedBox(height: 10),
                    Flexible(
                      child: Text(
                        title,
                        style: TextStyle(
                          color: colors['textSecondary'],
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Flexible(
                      child: Text(
                        value,
                        style: TextStyle(
                          color: colors['text'],
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildPerformanceChart(
    BuildContext context,
    DashboardStats stats,
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
                  Icons.trending_up,
                  color: colors['primary'],
                  size: 20,
                ),
                const SizedBox(width: 8),
                Text(
                  '30-Day Performance Trend',
                  style: TextStyle(
                    color: colors['text'],
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            SizedBox(
              height: 200,
              child: LineChart(
                LineChartData(
                  gridData: FlGridData(
                    show: true,
                    drawVerticalLine: false,
                    horizontalInterval: 20,
                    getDrawingHorizontalLine: (value) {
                      return FlLine(
                        color: colors['border']!.withOpacity(0.2),
                        strokeWidth: 1,
                      );
                    },
                  ),
                  titlesData: FlTitlesData(
                    show: true,
                    rightTitles: AxisTitles(
                      sideTitles: SideTitles(showTitles: false),
                    ),
                    topTitles: AxisTitles(
                      sideTitles: SideTitles(showTitles: false),
                    ),
                    bottomTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        reservedSize: 30,
                        getTitlesWidget: (value, meta) {
                          if (stats.rollingAverageData.isEmpty) return const Text('');
                          final index = value.toInt();
                          if (index < 0 || index >= stats.rollingAverageData.length) {
                            return const Text('');
                          }
                          final date = stats.rollingAverageData[index].date;
                          final day = date.substring(8);
                          return Text(
                            day,
                            style: TextStyle(
                              color: colors['text']!,
                              fontSize: 11,
                              fontWeight: FontWeight.w500,
                            ),
                          );
                        },
                      ),
                    ),
                    leftTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        reservedSize: 40,
                        getTitlesWidget: (value, meta) {
                          return Text(
                            value.toInt().toString(),
                            style: TextStyle(
                              color: colors['text']!,
                              fontSize: 11,
                              fontWeight: FontWeight.w500,
                            ),
                          );
                        },
                      ),
                    ),
                  ),
                  lineTouchData: LineTouchData(
                    getTouchedSpotIndicator: (barData, spotIndexes) {
                      return spotIndexes.map((index) {
                        return TouchedSpotIndicatorData(
                          FlLine(
                            color: colors['primary']!.withOpacity(0.7),
                            strokeWidth: 2,
                            dashArray: [4, 4],
                          ),
                          FlDotData(
                            getDotPainter: (spot, percent, barData, index) {
                              return FlDotCirclePainter(
                                radius: 6,
                                color: colors['primary']!,
                                strokeWidth: 3,
                                strokeColor: colors['card']!,
                              );
                            },
                          ),
                        );
                      }).toList();
                    },
                    touchTooltipData: LineTouchTooltipData(
                      tooltipBgColor: colors['card']!,
                      tooltipRoundedRadius: 8,
                      tooltipPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      tooltipMargin: 8,
                      tooltipBorder: BorderSide(
                        color: colors['primary']!,
                        width: 2,
                      ),
                      getTooltipItems: (List<LineBarSpot> touchedBarSpots) {
                        return touchedBarSpots.map((barSpot) {
                          return LineTooltipItem(
                            '${barSpot.y.toStringAsFixed(1)}%',
                            TextStyle(
                              color: colors['text']!,
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              shadows: [
                                Shadow(
                                  color: colors['background']!.withOpacity(0.8),
                                  blurRadius: 4,
                                  offset: const Offset(1, 1),
                                ),
                              ],
                            ),
                          );
                        }).toList();
                      },
                    ),
                  ),
                  borderData: FlBorderData(
                    show: true,
                    border: Border.all(
                      color: colors['border']!.withOpacity(0.2),
                    ),
                  ),
                  minX: 0,
                  maxX: stats.rollingAverageData.length.toDouble() - 1,
                  minY: 0,
                  maxY: 100,
                    lineBarsData: [
                    LineChartBarData(
                      spots: stats.rollingAverageData.asMap().entries.map((entry) {
                        return FlSpot(
                          entry.key.toDouble(),
                          entry.value.averageScore,
                        );
                      }).toList(),
                      isCurved: true,
                      color: colors['primary']!,
                      barWidth: 3,
                      dotData: FlDotData(
                        show: true,
                        getDotPainter: (spot, percent, barData, index) {
                          return FlDotCirclePainter(
                            radius: 4,
                            color: colors['primary']!,
                            strokeWidth: 2,
                            strokeColor: colors['card']!,
                          );
                        },
                      ),
                      belowBarData: BarAreaData(
                        show: true,
                        color: colors['primary']!.withOpacity(0.1),
                      ),
                      showingIndicators: [0, 5, 10, 15, 20, 25, 29],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSubjectBreakdown(
    BuildContext context,
    DashboardStats stats,
    Map<String, Color> colors,
  ) {
    if (stats.subjectBreakdowns.isEmpty) {
      return const SizedBox.shrink();
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(
              Icons.subject,
              color: colors['primary'],
              size: 20,
            ),
            const SizedBox(width: 8),
            Text(
              'Subject Performance',
              style: TextStyle(
                color: colors['text'],
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        SizedBox(
          height: 220,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: stats.subjectBreakdowns.length,
            itemBuilder: (context, index) {
              final entry = stats.subjectBreakdowns.entries.elementAt(index);
              final subjectStats = entry.value;
              // Use ThemeSystem to get correct subject colors
              final subjectColor = ThemeSystem.getSubjectColor(entry.key.toLowerCase());

              return TweenAnimationBuilder<double>(
                tween: Tween(begin: 0.0, end: 1.0),
                duration: Duration(milliseconds: 400 + (index * 100)),
                curve: Curves.easeOut,
                builder: (context, opacity, child) {
                  return Opacity(
                    opacity: opacity,
                    child: Transform.scale(
                      scale: 0.9 + (opacity * 0.1),
                      child: SizedBox(
                        width: 170,
                        child: Card(
                          elevation: 3,
                          color: colors['card'],
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                            side: BorderSide(
                              color: subjectColor.withOpacity(0.3),
                              width: 1.5,
                            ),
                          ),
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Container(
                                      width: 4,
                                      height: 20,
                                      decoration: BoxDecoration(
                                        color: subjectColor,
                                        borderRadius: BorderRadius.circular(2),
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Expanded(
                                      child: Text(
                                        _getSubjectDisplayName(entry.key),
                                        style: TextStyle(
                                          color: subjectColor,
                                          fontSize: 16,
                                          fontWeight: FontWeight.bold,
                                        ),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 12),
                                Text(
                                  '${subjectStats.average.toStringAsFixed(1)}% avg',
                                  style: TextStyle(
                                    color: colors['textSecondary'],
                                    fontSize: 13,
                                  ),
                                ),
                                Text(
                                  '${subjectStats.count} quiz${subjectStats.count != 1 ? 'zes' : ''}',
                                  style: TextStyle(
                                    color: colors['textSecondary'],
                                    fontSize: 13,
                                  ),
                                ),
                                const SizedBox(height: 12),
                                // Difficulty breakdown - use flexible sizing
                                Flexible(
                                  child: Column(
                                    mainAxisSize: MainAxisSize.min,
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      _buildDifficultyBar('Easy', subjectStats.difficultyPerformance['easy']!, subjectColor, colors),
                                      const SizedBox(height: 8),
                                      _buildDifficultyBar('Medium', subjectStats.difficultyPerformance['medium']!, subjectColor, colors),
                                      const SizedBox(height: 8),
                                      _buildDifficultyBar('Hard', subjectStats.difficultyPerformance['hard']!, subjectColor, colors),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ),
                  );
                },
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildDifficultyBar(
    String label,
    DifficultyStats stats,
    Color color,
    Map<String, Color> colors,
  ) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Flexible(
              child: Text(
                label,
                style: TextStyle(
                  color: colors['textSecondary'],
                  fontSize: 11,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
            Text(
              '${stats.percentage.toStringAsFixed(0)}%',
              style: TextStyle(
                color: colors['text'],
                fontSize: 11,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
        const SizedBox(height: 4),
        ClipRRect(
          borderRadius: BorderRadius.circular(4),
          child: LinearProgressIndicator(
            value: stats.percentage / 100,
            backgroundColor: colors['border']!.withOpacity(0.2),
            valueColor: AlwaysStoppedAnimation<Color>(color),
            minHeight: 6,
          ),
        ),
      ],
    );
  }

  Widget _buildEmptyState(
    BuildContext context,
    Map<String, Color> colors,
  ) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.bar_chart_outlined,
              size: 80,
              color: colors['textSecondary']!.withOpacity(0.5),
            ),
            const SizedBox(height: 24),
            Text(
              'No Data Available Yet',
              style: TextStyle(
                color: colors['text'],
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              'Take some quizzes to see your statistics here',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: colors['textSecondary'],
                fontSize: 14,
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _getSubjectDisplayName(String subjectKey) {
    // Map subject keys to display names
    final displayNames = {
      'physics': 'PHYSICS',
      'chemistry': 'CHEMISTRY',
      'biology': 'BIOLOGY',
      'mathematics': 'MATHEMATICS',
      'math': 'MATHEMATICS',
      'general knowledge': 'GENERAL KNOWLEDGE',
      'gk': 'GENERAL KNOWLEDGE',
      'general': 'GENERAL',
    };
    return displayNames[subjectKey.toLowerCase()] ?? subjectKey.toUpperCase();
  }

  Widget _buildDifficultyPerformance(
    BuildContext context,
    DashboardStats stats,
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
                  Icons.assessment,
                  color: colors['primary'],
                  size: 20,
                ),
                const SizedBox(width: 8),
                Text(
                  'Overall Difficulty Performance',
                  style: TextStyle(
                    color: colors['text'],
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            _buildDifficultyBar(
              'Easy',
              stats.overallDifficultyPerformance['easy']!,
              Colors.green,
              colors,
            ),
            const SizedBox(height: 12),
            _buildDifficultyBar(
              'Medium',
              stats.overallDifficultyPerformance['medium']!,
              Colors.orange,
              colors,
            ),
            const SizedBox(height: 12),
            _buildDifficultyBar(
              'Hard',
              stats.overallDifficultyPerformance['hard']!,
              Colors.red,
              colors,
            ),
          ],
        ),
      ),
    );
  }
}
