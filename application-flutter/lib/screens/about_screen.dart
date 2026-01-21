import 'package:flutter/material.dart';
import 'package:reactiquiz/widgets/app_drawer.dart';

class AboutScreen extends StatelessWidget {
  const AboutScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('About'),
      ),
      drawer: const AppDrawer(),
      body: const Center(
        child: Text('About Screen'),
      ),
    );
  }
}

