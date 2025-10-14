# Frontend API Configuration Guide

## Environment Variables Setup

### 1. Create a `.env` file in your project root:

```bash
# Development API URL (for local development)
REACT_APP_API_BASE_URL=http://localhost:3000

# Production API URL (your Vercel backend URL)
# Replace 'your-project-name' with your actual Vercel project name
REACT_APP_VERCEL_API_URL=https://your-project-name.vercel.app
```

### 2. Update the Vercel URL

After deploying your backend to Vercel, you'll get a URL like:
- `https://reactiquiz-abc123.vercel.app`
- `https://your-custom-domain.vercel.app`

Replace `your-project-name` in the `.env` file with your actual Vercel project name.

### 3. Build and Deploy

```bash
# Build with the correct environment variables
npm run build

# Deploy to Firebase
npm run firebase:deploy
```

## How It Works

### Development Mode
- Frontend runs on `http://localhost:3001`
- API calls go to `http://localhost:3000` (your local Vercel dev server)

### Production Mode
- Frontend runs on Firebase Hosting
- API calls go to your Vercel backend URL

## API Configuration

The `src/api/axiosInstance.ts` file automatically:
- Uses `http://localhost:3000` in development
- Uses your Vercel URL in production
- Handles authentication tokens
- Manages CORS and error handling

## Testing Your Setup

### Local Development
```bash
# Terminal 1: Start backend
npm run vercel:dev

# Terminal 2: Start frontend
npm start
```

### Production Testing
1. Deploy backend: `npm run vercel:deploy`
2. Update `.env` with your Vercel URL
3. Build frontend: `npm run build`
4. Deploy frontend: `npm run firebase:deploy`

## Troubleshooting

### API Not Found (404)
- Check that your Vercel URL is correct
- Ensure your backend is deployed to Vercel
- Verify the environment variable is set correctly

### CORS Issues
- Vercel automatically handles CORS for your API
- No additional CORS configuration needed

### Authentication Issues
- Check that JWT tokens are being sent correctly
- Verify your JWT_SECRET is set in Vercel environment variables
