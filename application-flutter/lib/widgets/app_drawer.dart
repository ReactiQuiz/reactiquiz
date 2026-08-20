import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:reactiquiz/providers/auth_provider.dart';
import 'package:reactiquiz/providers/theme_provider.dart';

class AppDrawer extends StatelessWidget {
  const AppDrawer({super.key});

  @override
  Widget build(BuildContext context) {
    final themeProvider = Provider.of<ThemeProvider>(context);
    final authProvider = Provider.of<AuthProvider>(context);
    final colors = themeProvider.currentColors;
    final user = authProvider.user;

    return Drawer(
      backgroundColor: colors['drawer'],
      child: SafeArea(
        child: Column(
          children: [
            // Drawer Header
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: colors['drawerHeader'] ?? colors['primary'],
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    colors['primary']!,
                    colors['primary']!.withOpacity(0.7),
                  ],
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 60,
                    height: 60,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.2),
                          blurRadius: 10,
                          offset: const Offset(0, 5),
                        ),
                      ],
                    ),
                    child: const Icon(
                      Icons.quiz,
                      size: 35,
                      color: Color(0xFF667eea),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'ReactiQuiz',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  if (user != null)
                    Text(
                      user.username,
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.9),
                        fontSize: 14,
                      ),
                    )
                  else
                    Text(
                      'Guest',
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.9),
                        fontSize: 14,
                      ),
                    ),
                ],
              ),
            ),

            // Navigation Items
            Expanded(
              child: ListView(
                padding: EdgeInsets.zero,
                children: [
                  _DrawerTile(
                    icon: Icons.home,
                    title: 'Home',
                    route: '/home',
                    colors: colors,
                    iconColor: Colors.blueAccent,
                  ),
                  _DrawerTile(
                    icon: Icons.dashboard,
                    title: 'Dashboard',
                    route: '/dashboard',
                    colors: colors,
                    iconColor: Colors.green,
                  ),
                  _DrawerTile(
                    icon: Icons.menu_book,
                    title: 'Subjects',
                    route: '/subjects',
                    colors: colors,
                    iconColor: Colors.orange,
                  ),
                  _DrawerTile(
                    icon: Icons.quiz,
                    title: 'Quiz Results',
                    route: '/results',
                    colors: colors,
                    iconColor: Colors.purple,
                  ),
                  // Disabled for release
                  // _DrawerTile(
                  //   icon: Icons.smart_toy,
                  //   title: 'AI Center',
                  //   route: '/ai-center',
                  //   colors: colors,
                  //   iconColor: Colors.teal,
                  // ),
                  // _DrawerTile(
                  //   icon: Icons.school,
                  //   title: 'Homi Bhabha',
                  //   route: '/homibhabha',
                  //   colors: colors,
                  //   iconColor: Colors.redAccent,
                  // ),
                  const Divider(),
                  _DrawerTile(
                    icon: Icons.settings,
                    title: 'Settings',
                    route: '/settings',
                    colors: colors,
                    iconColor: Colors.grey,
                  ),
                  // Disabled for release
                  // _DrawerTile(
                  //   icon: Icons.person,
                  //   title: 'Profile',
                  //   route: '/profile',
                  //   colors: colors,
                  //   iconColor: Colors.indigo,
                  // ),
                  // _DrawerTile(
                  //   icon: Icons.info,
                  //   title: 'About',
                  //   route: '/about',
                  //   colors: colors,
                  //   iconColor: Colors.brown,
                  // ),
                ],
              ),
            ),

            // Footer - Logout
            if (user != null)
              Padding(
                padding: const EdgeInsets.all(16),
                child: ListTile(
                  leading: Icon(Icons.logout, color: colors['error']),
                  title: Text(
                    'Logout',
                    style: TextStyle(color: colors['error']),
                  ),
                  onTap: () async {
                    Navigator.pop(context); // Close drawer
                    await authProvider.logout();
                    if (context.mounted) {
                      context.go('/login');
                    }
                  },
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _DrawerTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String route;
  final Map<String, Color> colors;
  final Color? iconColor;

  const _DrawerTile({
    required this.icon,
    required this.title,
    required this.route,
    required this.colors,
    this.iconColor,
  });

  @override
  Widget build(BuildContext context) {
    final router = GoRouter.of(context);
    final currentLocation = router.routerDelegate.currentConfiguration;
    final currentPath = currentLocation.uri.path;
    
    // Handle route matching
    bool isActive = false;
    if (route == '/subjects') {
      // Subjects is active only if we're exactly on /subjects (not /topics/:subjectKey)
      isActive = currentPath == '/subjects';
    } else {
      // For other routes, check exact path match
      isActive = currentPath == route;
    }

    // Use colorful icon if provided, otherwise use theme colors
    final effectiveIconColor = isActive
        ? colors['primary']
        : (iconColor ?? colors['textSecondary']);

    return ListTile(
      leading: Icon(
        icon,
        color: effectiveIconColor,
      ),
      title: Text(
        title,
        style: TextStyle(
          color: isActive ? colors['primary'] : colors['text'],
          fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
        ),
      ),
      selected: isActive,
      selectedTileColor: colors['selectedItem']?.withOpacity(0.3),
      onTap: () {
        Navigator.pop(context); // Close drawer
        router.go(route);
      },
    );
  }
}

