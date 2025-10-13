# Hybrid Deployment Guide: Firebase Hosting + Vercel Backend

This guide will help you deploy your ReactiQuiz application using Firebase for frontend hosting and Vercel for backend API, with Turso as your database.

## Architecture Overview

```
Frontend (React) → Firebase Hosting (Free)
Backend (Express API) → Vercel Functions (Free)
Database → Turso (Free tier available)
```

## Prerequisites

1. **Firebase CLI**: `npm install -g firebase-tools`
2. **Vercel CLI**: `npm install -g vercel`
3. **Firebase Project**: Create at [Firebase Console](https://console.firebase.google.com/)
4. **Vercel Account**: Sign up at [Vercel](https://vercel.com/)

## Setup Steps

### 1. Firebase Setup (Frontend Hosting)

#### Login to Firebase
```bash
npm run firebase:login
```

#### Deploy Frontend to Firebase Hosting
```bash
npm run build
npm run firebase:deploy
```

Your frontend will be available at: `https://your-project-id.web.app`

### 2. Vercel Setup (Backend API)

#### Login to Vercel
```bash
vercel login
```

#### Set Environment Variables in Vercel
```bash
vercel env add TURSO_DATABASE_URL
vercel env add TURSO_AUTH_TOKEN
vercel env add JWT_SECRET
```

Or set them in Vercel Dashboard:
1. Go to your project in Vercel Dashboard
2. Go to Settings → Environment Variables
3. Add:
   - `TURSO_DATABASE_URL` = your Turso database URL
   - `TURSO_AUTH_TOKEN` = your Turso auth token
   - `JWT_SECRET` = your JWT secret

#### Deploy Backend to Vercel
```bash
npm run vercel:deploy
```

Your API will be available at: `https://your-project.vercel.app/api/`

### 3. Update Frontend API URL

Update your frontend to use the Vercel API URL. In your React app, update the API base URL:

```typescript
// In your axios instance or API configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-project.vercel.app/api' 
  : 'http://localhost:3000/api';
```

## Project Structure

```
reactiquiz/
├── api/                      # Vercel Functions (Backend API)
│   ├── index.js             # Main API entry point
│   ├── routes/              # API routes
│   └── _utils/              # Utilities (including tursoClient.js)
├── src/                     # React frontend
├── build/                   # Built React app (for Firebase hosting)
├── firebase.json            # Firebase hosting config only
├── vercel.json              # Vercel configuration
└── package.json             # Project dependencies
```

## Deployment Commands

### Frontend (Firebase Hosting)
```bash
# Build and deploy frontend
npm run build
npm run firebase:deploy

# Local development with Firebase emulator
npm run firebase:serve
```

### Backend (Vercel Functions)
```bash
# Deploy backend
npm run vercel:deploy

# Local development
npm run vercel:dev
```

### Full Deployment
```bash
# Deploy both
npm run build
npm run firebase:deploy
npm run vercel:deploy
```

## Environment Variables

### Vercel (Backend)
Set these in Vercel Dashboard or CLI:
- `TURSO_DATABASE_URL`: Your Turso database URL
- `TURSO_AUTH_TOKEN`: Your Turso auth token
- `JWT_SECRET`: Your JWT secret

### Firebase (Frontend)
Set these in your React app's build process:
- `REACT_APP_API_BASE_URL`: Your Vercel API URL

## Cost Breakdown

### Firebase Hosting
- ✅ **Free**: 10GB storage, 10GB transfer/month
- ✅ **Perfect for**: Static React apps

### Vercel Functions
- ✅ **Free**: 100GB-hours execution time/month
- ✅ **Perfect for**: API endpoints, serverless functions

### Turso Database
- ✅ **Free**: 500MB storage, 1 billion row reads/month
- ✅ **Perfect for**: Small to medium applications

## Benefits of This Setup

1. **Cost Effective**: All services have generous free tiers
2. **Performance**: Firebase CDN for frontend, Vercel edge functions for API
3. **Scalability**: Both platforms auto-scale
4. **Developer Experience**: Easy deployment and local development
5. **Reliability**: Both platforms have excellent uptime

## Troubleshooting

### Common Issues:

1. **CORS Issues**: Vercel automatically handles CORS for your API
2. **Environment Variables**: Make sure they're set in Vercel Dashboard
3. **API Not Found**: Check that your Vercel deployment URL is correct
4. **Build Failures**: Ensure all dependencies are in package.json

### Useful Commands:

```bash
# Check Vercel deployment status
vercel ls

# View Vercel function logs
vercel logs

# Check Firebase hosting
firebase hosting:channel:list

# Local development
npm start                    # Frontend on localhost:3001
npm run vercel:dev          # Backend on localhost:3000
```

## Next Steps

1. **Set up Firebase project** and deploy frontend
2. **Set up Vercel project** and deploy backend
3. **Configure environment variables** in Vercel
4. **Update frontend API URL** to point to Vercel
5. **Test your deployment**

Your application will now be hosted on Firebase with your API running on Vercel, both using their free tiers!
