# ReactiQuiz Frontend Web

React-based web application for ReactiQuiz. This is the main web interface for the quiz platform.

## Tech Stack

- **Framework**: React 18.3.1
- **Language**: TypeScript
- **UI Library**: Material-UI (MUI) 5.15.20
- **Routing**: React Router DOM 6.23.0
- **State Management**: React Query (TanStack Query)
- **Styling**: Tailwind CSS + Emotion
- **Build Tool**: React Scripts
- **Deployment**: Vercel / Firebase Hosting

## Features

- User authentication and registration
- Subject and topic browsing
- Interactive quiz taking
- Performance dashboard
- Results tracking and analysis
- Flashcards system
- AI-powered features
- Responsive design
- Multiple themes (Dark, Light, Neon)

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm start
```

Runs the app on `http://localhost:3001`

### Building

```bash
npm run build
```

Builds the app for production to the `build` folder.

## Deployment

### Vercel
```bash
vercel --prod
```

### Firebase
```bash
npm run firebase:deploy
```

## Environment Variables

- `REACT_APP_API_BASE_URL` - API base URL (default: http://localhost:3000)
- `REACT_APP_VERCEL_API_URL` - Production API URL (default: https://reactiquiz.vercel.app)

## Project Structure

- `src/` - Source code
  - `components/` - React components
  - `pages/` - Page components
  - `hooks/` - Custom React hooks
  - `contexts/` - React contexts
  - `api/` - API client configuration
  - `utils/` - Utility functions
  - `types/` - TypeScript type definitions
- `public/` - Static assets
- `build/` - Production build output

