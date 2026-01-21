# ReactiQuiz Backend API

Backend API server for ReactiQuiz application. This API handles all server-side logic, database operations, and business logic.

## Deployment

This API is deployed on Vercel at: `https://reactiquiz.vercel.app/api`

## Tech Stack

- **Runtime**: Node.js 22.x
- **Framework**: Express.js
- **Database**: Turso (LibSQL)
- **Authentication**: JWT (JSON Web Tokens)
- **Deployment**: Vercel Serverless Functions

## API Routes

- `/api/users` - User authentication and management
- `/api/subjects` - Subject data
- `/api/topics` - Topic data
- `/api/questions` - Question data
- `/api/quizSessions` - Quiz session management
- `/api/results` - Quiz results
- `/api/admin` - Admin operations
- `/api/ai` - AI-powered features
- `/api/challenges` - Challenge system
- `/api/pdf` - PDF generation
- `/api/contact` - Contact form handling

## Environment Variables

Required environment variables:
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `TURSO_DATABASE_URL` - Turso database URL
- `TURSO_AUTH_TOKEN` - Turso authentication token
- `JWT_SECRET` - JWT secret for token signing
- `GEMINI_API_KEY` - Google Gemini API key (for AI features)
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS` - Email configuration

## Local Development

```bash
npm install
npm run dev
```

## Production Deployment

Deploy to Vercel:
```bash
vercel --prod
```

