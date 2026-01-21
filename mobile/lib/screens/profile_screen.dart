import 'package:flutter/material.dart';
import 'package:reactiquiz/widgets/app_drawer.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
      ),
      drawer: const AppDrawer(),
      body: const Center(
        child: Text('Profile Screen'),
      ),
    );
  }
}

