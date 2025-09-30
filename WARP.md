# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

ReactiQuiz is a modern quiz application built with React 18 and TypeScript, featuring AI-powered study assistance, comprehensive analytics, and a sophisticated theme system. The application serves both students and educators with a focus on performance and user experience.

## Development Commands

### Core Commands
```powershell
# Start development server (runs on localhost:3000)
npm start

# Build for production
npm run build

# Run tests
npm test

# Run tests with coverage report
npm run test:coverage
```

### Environment Setup
```powershell
# Copy environment template and configure
cp .env.example .env
# Configure required environment variables in .env
```

### TypeScript Commands
The project has been fully converted to TypeScript. All source files are now `.tsx/.ts` with relaxed type checking enabled for gradual typing:

```powershell
# TypeScript compilation is handled by react-scripts
npm start    # Compiles TS automatically in development
npm run build # Compiles TS for production
```

## Architecture Overview

### Application Structure
- **Frontend**: React 18 + TypeScript + Material-UI (MUI) + TanStack Query
- **Backend**: Node.js + Express.js + Vercel Serverless Functions
- **Database**: Turso (libSQL) Edge Database for global performance
- **AI Integration**: Google Gemini API for AI-powered features
- **Deployment**: Vercel with CI/CD

### Core Architecture Patterns

#### 1. Provider Pattern for State Management
The app uses a nested provider pattern in `src/contexts/AppProviders.tsx`:
```
BrowserRouter > AuthProvider > ThemeProvider > NotificationsProvider > SubjectColorsProvider > TopicsProvider
```

#### 2. Route-Based Code Splitting
All pages are lazy-loaded using React.lazy() in `src/components/AppRoutes.tsx` with three main layout patterns:
- **MainLayout**: Authenticated users with full navigation
- **MinimalLayout**: Guest users with minimal UI
- **AdminLayout**: Admin panel with specialized sidebar

#### 3. API Architecture
- **Serverless Functions**: All API routes in `/api` directory deployed as Vercel functions
- **Middleware Pattern**: Authentication, rate limiting, and validation middleware
- **Database Client**: Centralized Turso client in `api/_utils/tursoClient.ts`

#### 4. Component Organization
Components are organized by feature areas:
- `components/core/`: Core app functionality (auth, routing, navigation)
- `components/[feature]/`: Feature-specific components (quiz, dashboard, results)
- `components/layout/`: Layout components for different user contexts
- `components/shared/`: Reusable UI components

### Key Technical Decisions

#### Theme System
- High-contrast dark and light themes with Vercel-inspired design
- Centralized theme management in `src/contexts/ThemeContext.tsx`
- Theme persistence via localStorage

#### Authentication Flow
- JWT-based authentication with secure HTTP-only patterns
- Role-based access control (user/admin)
- Protected routes using `ProtectedRoute` and `AdminRoute` components

#### Data Fetching Strategy
- TanStack Query for efficient caching and state management
- Custom hooks pattern for API interactions (e.g., `useDashboard`, `useAccount`)
- Optimistic updates for better UX

### TypeScript Migration Status
The codebase has been fully converted from JavaScript to TypeScript:
- ✅ All 70+ source files converted to `.tsx/.ts`
- ⚠️ Gradual typing approach with `strict: false` in `tsconfig.json`
- 🔄 Type annotations being added incrementally

**Current TypeScript Configuration:**
- Target: ES2015
- Strict mode: Disabled (temporarily)
- downlevelIteration: Enabled for compatibility

## Environment Variables

### Required Variables
```env
TURSO_DATABASE_URL=libsql://your-db-name.turso.io
TURSO_AUTH_TOKEN=your-turso-auth-token
JWT_SECRET=your-jwt-secret-key
GEMINI_API_KEY=your-gemini-api-key
REACT_APP_API_BASE_URL=https://reactiquiz.vercel.app
```

### Optional Variables
```env
EMAIL_USER=your.gmail.address@gmail.com
EMAIL_PASS=your-google-app-password
CORS_ORIGIN=https://yourdomain.com
```

## Testing Strategy

### Test Configuration
- **Framework**: Jest with React Testing Library
- **Transform Patterns**: Configured for ES modules and markdown processing
- **Coverage**: Available via `npm run test:coverage`

### Test Structure
- `src/App.test.tsx`: Main app component tests
- `src/setupTests.ts`: Jest setup and global test utilities
- `src/test-utils.ts`: Custom testing utilities

## Development Guidelines

### File Naming Conventions
- Components: PascalCase (e.g., `UserProfileCard.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useDashboard.ts`)
- Utils: camelCase (e.g., `quizAssembler.ts`)
- Pages: PascalCase with `Page` suffix (e.g., `DashboardPage.tsx`)

### Component Patterns
- Use functional components with hooks
- Implement proper TypeScript interfaces for props (gradually being added)
- Follow MUI theme system for consistent styling
- Use custom hooks for complex state logic and API calls

### API Development
- All API routes use Express.js with TypeScript
- Middleware for authentication: `api/_middleware/auth.ts`
- Database operations: Use centralized Turso client
- Error handling: Consistent JSON error responses

### State Management
- React Context for global state (auth, theme, notifications)
- TanStack Query for server state and caching
- Local component state for UI-specific state

## Deployment Notes

### Vercel Configuration
- Automatic deployments from main branch
- Serverless functions auto-deployed from `/api` directory
- Environment variables managed in Vercel dashboard
- Edge runtime for optimal performance

### Build Process
1. TypeScript compilation via react-scripts
2. Production bundle optimization
3. Static asset generation
4. Serverless function bundling

## Performance Considerations

- **Code Splitting**: All pages lazy-loaded
- **Caching**: TanStack Query with intelligent cache invalidation
- **Database**: Edge database (Turso) for global low latency
- **Bundle Optimization**: Automatic via react-scripts
- **Rate Limiting**: API protection against abuse

## AI Integration

The application integrates Google Gemini API for:
- Question generation and validation
- Subjective answer grading
- Study assistance in the AI Center
- Content analysis and recommendations

AI features are centralized in `api/routes/ai.ts` and accessed via custom hooks like `useAICenter`.

## Admin Panel Architecture

Admin functionality is role-gated and uses a separate layout:
- Route protection via `AdminRoute` component
- Dedicated `AdminLayout` with specialized sidebar
- Admin-specific pages in `src/pages/admin/`
- Admin API routes with additional authentication middleware

## Key Dependencies

### Frontend Core
- React 18 with modern hooks
- Material-UI v5 for design system
- TanStack Query v5 for data fetching
- React Router v6 for navigation

### Backend Core
- Express.js with TypeScript
- Turso (@libsql/client) for database
- JWT for authentication
- Express validator for input validation

### Development Tools
- TypeScript with relaxed configuration
- Jest + React Testing Library
- ESLint for code quality