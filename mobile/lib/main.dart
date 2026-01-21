import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:reactiquiz/config/app_router.dart';
import 'package:reactiquiz/providers/auth_provider.dart';
import 'package:reactiquiz/providers/theme_provider.dart';
import 'package:reactiquiz/providers/navigation_provider.dart';
import 'package:reactiquiz/providers/dashboard_provider.dart';
import 'package:reactiquiz/providers/quiz_provider.dart';
import 'package:reactiquiz/providers/subjects_provider.dart';
import 'package:reactiquiz/providers/topics_provider.dart';
import 'package:reactiquiz/providers/results_provider.dart';
import 'package:reactiquiz/providers/flashcards_provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: Colors.white,
      systemNavigationBarIconBrightness: Brightness.dark,
    ),
  );

  runApp(const ReactiQuizApp());
}

class ReactiQuizApp extends StatelessWidget {
  const ReactiQuizApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (context) => AuthProvider()),
        ChangeNotifierProvider(create: (context) => ThemeProvider()),
        ChangeNotifierProvider(create: (context) => NavigationProvider()),
        ChangeNotifierProvider(create: (context) => DashboardProvider()),
        ChangeNotifierProvider(create: (context) => QuizProvider()),
        ChangeNotifierProvider(create: (context) => SubjectsProvider()),
        ChangeNotifierProvider(create: (context) => TopicsProvider()),
        ChangeNotifierProvider(create: (context) => ResultsProvider()),
        ChangeNotifierProvider(create: (context) => FlashcardsProvider()),
      ],
      child: Consumer<ThemeProvider>(
        builder: (context, themeProvider, child) {
          return MaterialApp.router(
            title: 'ReactiQuiz',
            debugShowCheckedModeBanner: false,
            theme: themeProvider.currentThemeData,
            routerConfig: AppRouter.router,
          );
        },
      ),
    );
  }
}
