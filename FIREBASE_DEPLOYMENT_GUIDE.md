# Firebase Deployment Guide

This guide will help you deploy your ReactiQuiz application to Firebase with Turso as your database.

## Prerequisites

1. **Firebase CLI**: Install Firebase CLI globally
   ```bash
   npm install -g firebase-tools
   ```

2. **Firebase Project**: Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)

3. **Environment Variables**: Set up your environment variables in Firebase Functions

## Setup Steps

### 1. Login to Firebase
```bash
npm run firebase:login
```

### 2. Initialize Firebase Project (if not already done)
```bash
npm run firebase:init
```
- Select your Firebase project
- Choose "Functions" and "Hosting"
- Use the existing `firebase.json` configuration

### 3. Set Environment Variables for Functions

Set the following environment variables in Firebase Functions:

```bash
firebase functions:config:set turso.database_url="your_turso_database_url"
firebase functions:config:set turso.auth_token="your_turso_auth_token"
firebase functions:config:set jwt.secret="your_jwt_secret"
```

Or set them directly in the Firebase Console under Functions > Configuration.

### 4. Build and Deploy

#### Deploy Everything
```bash
npm run firebase:deploy
```

#### Deploy Only Functions
```bash
npm run firebase:deploy:functions
```

#### Deploy Only Hosting
```bash
npm run firebase:deploy:hosting
```

### 5. Local Development

#### Start Firebase Emulators
```bash
npm run firebase:serve
```

#### Build Functions Locally
```bash
npm run functions:build
```

## Project Structure

```
reactiquiz/
├── functions/                 # Firebase Functions (Backend API)
│   ├── src/
│   │   ├── index.ts          # Main function entry point
│   │   └── api/              # Your Express API routes
│   ├── package.json          # Functions dependencies
│   └── tsconfig.json         # TypeScript config
├── src/                      # React frontend
├── build/                    # Built React app (for hosting)
├── firebase.json             # Firebase configuration
├── .firebaserc              # Firebase project config
└── package.json             # Main project dependencies
```

## Environment Variables

### Required for Functions:
- `TURSO_DATABASE_URL`: Your Turso database URL
- `TURSO_AUTH_TOKEN`: Your Turso authentication token
- `JWT_SECRET`: Secret key for JWT tokens

### Required for Frontend:
- `REACT_APP_API_BASE_URL`: Your Firebase Functions URL (set automatically)

## API Endpoints

Your API will be available at:
- Production: `https://your-project-id.cloudfunctions.net/api/`
- Local: `http://localhost:5001/your-project-id/us-central1/api/`

## Troubleshooting

### Common Issues:

1. **Functions not deploying**: Check that all dependencies are in `functions/package.json`
2. **Environment variables not working**: Ensure they're set in Firebase Functions config
3. **CORS issues**: The CORS configuration is already set up in the functions
4. **Build errors**: Run `npm run functions:build` to check for TypeScript errors

### Useful Commands:

```bash
# View function logs
firebase functions:log

# Test functions locally
firebase emulators:start --only functions

# Deploy with specific project
firebase deploy --project your-project-id
```

## Database

Your application continues to use **Turso** as the database. The Firebase Functions will connect to Turso using the same configuration as before. No changes are needed to your database setup.

## Next Steps

1. Set up your Firebase project
2. Configure environment variables
3. Deploy using the commands above
4. Update your frontend to use the new Firebase Functions URL
5. Test your deployment

Your application will now be hosted on Firebase with your backend running as Firebase Functions and your database remaining on Turso.
