import 'package:flutter/material.dart';
import 'package:reactiquiz/widgets/app_drawer.dart';

class AICenterScreen extends StatelessWidget {
  const AICenterScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('AI Center'),
      ),
      drawer: const AppDrawer(),
      body: const Center(
        child: Text('AI Center Screen'),
      ),
    );
  }
}

