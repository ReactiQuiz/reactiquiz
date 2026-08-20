import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:reactiquiz/screens/splash_screen.dart';
import 'package:reactiquiz/screens/onboarding_screen.dart';
import 'package:reactiquiz/screens/login_screen.dart';
import 'package:reactiquiz/screens/register_screen.dart';
import 'package:reactiquiz/screens/home_screen.dart';
import 'package:reactiquiz/screens/subjects_screen.dart';
import 'package:reactiquiz/screens/topics_screen.dart';
import 'package:reactiquiz/screens/quiz_screen.dart';
import 'package:reactiquiz/screens/quiz_result_screen.dart';
import 'package:reactiquiz/screens/dashboard_screen.dart';
// Disabled screens for release
// import 'package:reactiquiz/screens/profile_screen.dart';
import 'package:reactiquiz/screens/settings_screen.dart';
// import 'package:reactiquiz/screens/ai_center_screen.dart';
import 'package:reactiquiz/screens/flashcards_screen.dart';
// import 'package:reactiquiz/screens/homibhabha_screen.dart';
// import 'package:reactiquiz/screens/about_screen.dart';
import 'package:reactiquiz/screens/results_screen.dart';
import 'package:reactiquiz/screens/privacy_policy_screen.dart';
import 'package:reactiquiz/screens/terms_of_service_screen.dart';

class AppRouter {
  static final GoRouter router = GoRouter(
    initialLocation: '/splash',
    routes: [
      GoRoute(
        path: '/splash',
        name: 'splash',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: '/onboarding',
        name: 'onboarding',
        builder: (context, state) => const OnboardingScreen(),
      ),
      GoRoute(
        path: '/login',
        name: 'login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/register',
        name: 'register',
        builder: (context, state) => const RegisterScreen(),
      ),
      GoRoute(
        path: '/home',
        name: 'home',
        builder: (context, state) => const HomeScreen(),
      ),
      GoRoute(
        path: '/subjects',
        name: 'subjects',
        builder: (context, state) => const SubjectsScreen(),
      ),
      GoRoute(
        path: '/topics/:subjectKey',
        name: 'topics',
        builder: (context, state) {
          final subjectKey = state.pathParameters['subjectKey']!;
          return TopicsScreen(subjectKey: subjectKey);
        },
      ),
      GoRoute(
        path: '/quiz',
        name: 'quiz',
        builder: (context, state) {
          final uri = state.uri;
          final sessionId = uri.queryParameters['sessionId'];
          final topicId = uri.queryParameters['topicId'];
          final difficulty = uri.queryParameters['difficulty'];
          final numQuestions = uri.queryParameters['numQuestions'];
          
          return QuizScreen(
            sessionId: sessionId,
            topicId: topicId,
            difficulty: difficulty,
            numQuestions: numQuestions != null ? int.tryParse(numQuestions) : null,
          );
        },
      ),
      GoRoute(
        path: '/quiz/:topicId',
        name: 'quiz-by-topic',
        builder: (context, state) {
          final topicId = state.pathParameters['topicId']!;
          final uri = state.uri;
          final difficulty = uri.queryParameters['difficulty'];
          final numQuestions = uri.queryParameters['numQuestions'];
          
          return QuizScreen(
            topicId: topicId,
            difficulty: difficulty,
            numQuestions: numQuestions != null ? int.tryParse(numQuestions) : null,
          );
        },
      ),
      GoRoute(
        path: '/results/:resultId',
        name: 'result-detail',
        builder: (context, state) {
          final resultId = state.pathParameters['resultId']!;
          return QuizResultScreen(quizId: resultId);
        },
      ),
      GoRoute(
        path: '/quiz-result/:quizId',
        name: 'quiz-result',
        builder: (context, state) {
          final quizId = state.pathParameters['quizId']!;
          return QuizResultScreen(quizId: quizId);
        },
      ),
      GoRoute(
        path: '/dashboard',
        name: 'dashboard',
        builder: (context, state) => const DashboardScreen(),
      ),
      // Disabled routes for release
      // GoRoute(
      //   path: '/profile',
      //   name: 'profile',
      //   builder: (context, state) => const ProfileScreen(),
      // ),
      GoRoute(
        path: '/settings',
        name: 'settings',
        builder: (context, state) => const SettingsScreen(),
      ),
      GoRoute(
        path: '/privacy-policy',
        name: 'privacy-policy',
        builder: (context, state) => const PrivacyPolicyScreen(),
      ),
      GoRoute(
        path: '/terms-of-service',
        name: 'terms-of-service',
        builder: (context, state) => const TermsOfServiceScreen(),
      ),
      // GoRoute(
      //   path: '/ai-center',
      //   name: 'ai-center',
      //   builder: (context, state) => const AICenterScreen(),
      // ),
      GoRoute(
        path: '/flashcards/:topicId',
        name: 'flashcards',
        builder: (context, state) {
          final topicId = state.pathParameters['topicId']!;
          return FlashcardsScreen(topicId: topicId);
        },
      ),
      // Disabled routes for release
      // GoRoute(
      //   path: '/homibhabha',
      //   name: 'homibhabha',
      //   builder: (context, state) => const HomiBhabhaScreen(),
      // ),
      // GoRoute(
      //   path: '/about',
      //   name: 'about',
      //   builder: (context, state) => const AboutScreen(),
      // ),
          GoRoute(
            path: '/results',
            name: 'results',
            builder: (context, state) => const ResultsScreen(),
          ),
    ],
    errorBuilder: (context, state) => Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 64, color: Colors.red),
            const SizedBox(height: 16),
            Text(
              '404 - Page Not Found',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: () => context.go('/home'),
              child: const Text('Go Home'),
            ),
          ],
        ),
      ),
    ),
  );
}
