# ReactiQuiz

An open-source, AI-powered quiz platform for students and learners. Built with React, Flutter, Express.js, and a Turso edge database.

## Project Structure

This repository has been organized into three separate projects for independent deployment:

### 📁 backend-api
Backend API server deployed on Vercel. Contains all API routes and server-side logic.

**Tech Stack**: Node.js, Express.js, Turso (LibSQL), JWT Authentication

**Deployment**: `https://reactiquiz.vercel.app/api`

### 📁 frontend-web
React-based web application for the main ReactiQuiz website.

**Tech Stack**: React, TypeScript, Material-UI, Tailwind CSS

**Deployment**: Vercel / Firebase Hosting

### 📁 application-flutter
Cross-platform Flutter mobile application for Android, iOS, and other platforms.

**Tech Stack**: Flutter, Dart, Provider, GoRouter

**Platforms**: Android, iOS, Web, Windows, Linux, macOS

## Quick Start

Each folder contains its own README with specific setup instructions:

- [Backend API README](backend-api/README.md)
- [Frontend Web README](frontend-web/README.md)
- [Flutter Application README](application-flutter/README.md)

## Deployment

Each project can be deployed independently:

- **Backend API**: Deploy to Vercel as a serverless function
- **Frontend Web**: Deploy to Vercel or Firebase Hosting
- **Flutter App**: Build and publish to Google Play Store / Apple App Store

## License

See [LICENSE](LICENSE) file for details.

## Contributing

Please refer to individual project READMEs for contribution guidelines.
