# ReactiQuiz

An open-source, AI-powered quiz platform for students and learners. Built with React, Flutter, Express.js, and a Turso edge database.

## Project Structure

- **`src/`** — the web frontend (React, TypeScript, Material-UI, Tailwind CSS). Builds via the root `package.json`; deploys to Vercel or Firebase Hosting.
- **`api/`** — backend API. Node.js, Express.js, Turso (LibSQL), JWT auth. Deployed on Vercel at `https://reactiquiz.vercel.app/api`.
- **`application-flutter/`** — cross-platform Flutter app (Android, iOS, Web, Windows, Linux, macOS). Provider, GoRouter.

## Quick Start

- Web frontend: `npm install && npm start` from the repo root (see `package.json` scripts).
- Backend API: see `api/` (deployed as Vercel serverless functions from the root `vercel.json`).
- Flutter app: see [application-flutter/README.md](application-flutter/README.md).

## Deployment

- **Web frontend**: Vercel or Firebase Hosting, built from `src/`.
- **Backend API**: Vercel serverless functions.
- **Flutter app**: Google Play Store / Apple App Store.

## License

See [LICENSE](LICENSE) file for details.

## Contributing

Please refer to individual project READMEs for contribution guidelines.
