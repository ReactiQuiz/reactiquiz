import 'package:flutter/material.dart';
import 'package:reactiquiz/widgets/app_drawer.dart';

class HomiBhabhaScreen extends StatelessWidget {
  const HomiBhabhaScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Homi Bhabha'),
      ),
      drawer: const AppDrawer(),
      body: const Center(
        child: Text('Homi Bhabha Screen'),
      ),
    );
  }
}

