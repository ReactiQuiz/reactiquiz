# ReactiQuiz Deployment Guide

## 📁 Project Structure

```
reactiquiz/
├── api/                          # Backend API (Vercel)
│   ├── index.js                  # Main Express server
│   ├── routes/                   # API endpoints
│   ├── _middleware/              # Authentication
│   └── _utils/                   # Utilities & DB client
├── data/                         # Quiz data files
│   ├── questions.json
│   ├── subjects.json
│   ├── topics.json
│   └── subjective-questions.json
├── prompts/                      # AI prompt files
│   ├── QuestionGenerationPrompt.txt
│   ├── SubjectiveQuestionGenerationPrompt.txt
│   ├── TopicGenerationPrompt.txt
│   └── GeminiGradingPrompt.txt
├── src/                          # Frontend React app (Firebase)
├── public/                       # Frontend static files (Firebase)
├── index.html                    # Simple backend landing page (Vercel)
├── package.json                  # Dependencies
├── vercel.json                   # Vercel config
├── firebase.json                 # Firebase config
└── .vercelignore                 # Vercel exclusions
```

## 🚀 Deployment

### Backend (Vercel)
```bash
vercel --prod
```
- **Uses**: `api/index.js` (single function)
- **Landing**: `index.html` (simple page)
- **URL**: `https://reactiquiz.vercel.app`

### Frontend (Firebase)
```bash
npm run build
npm run firebase:deploy
```
- **Uses**: `build/` directory
- **URL**: `https://reactiquiz.web.app`

## 📊 What Gets Deployed Where

### Vercel (Backend Only)
- ✅ `api/` - Express.js API server
- ✅ `data/` - Quiz data files
- ✅ `prompts/` - AI prompt files
- ✅ `index.html` - Simple landing page
- ✅ `package.json` - Dependencies
- ✅ `vercel.json` - Deployment config

### Firebase (Frontend Only)
- ✅ `build/` - React app build
- ✅ `firebase.json` - Firebase config

## 🎯 Result
- **Frontend**: `https://reactiquiz.web.app` (Firebase Hosting)
- **Backend**: `https://reactiquiz.vercel.app/api/*` (Vercel Functions)
- **Single Function**: Uses only 1 serverless function (within Hobby plan limits)
