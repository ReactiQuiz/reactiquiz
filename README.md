# ReactiQuiz 🧠✨

ReactiQuiz is a dynamic quiz application built with React, Node.js, and a serverless backend. It's designed to help users test and improve their knowledge across various subjects and prepare for specialized exams.

**Live Frontend:** [https://reactiquiz.vercel.app/](https://reactiquiz.vercel.app/)
**Live Backend API:** Hosted on the same Vercel deployment.

## Features 🚀

*   **Multiple Subjects:** Quizzes for Physics, Chemistry, Biology, Mathematics, and more.
*   **Homi Bhabha Exam Prep:** Dedicated section with practice tests for the Homi Bhabha competition.
*   **Customizable Quizzes:** Select difficulty levels and number of questions.
*   **User Accounts & Auth:** Secure user registration and login with JWT.
*   **Persistent Results History:** Logged-in users can track their progress over time.
*   **Friend System & Challenges:** Connect with friends and challenge them to quizzes.
*   **Flashcards:** Study mode for reviewing questions and answers.
*   **Dynamic Content:** Questions and topics are fetched from a serverless API.
*   **Modern UI:** A responsive interface built with Material-UI (MUI), including a dark mode.
*   **AI Study Assistant:** An integrated AI chat to help users with their studies.

## Tech Stack 💻

*   **Frontend:**
    *   React.js (with Hooks)
    *   React Router
    *   Material-UI (MUI)
    *   Axios for API calls
*   **Backend (Serverless):**
    *   Node.js & Express.js (running on Vercel)
    *   Turso (libSQL) for the database.
    *   `bcryptjs` for password hashing.
    *   `jsonwebtoken` for JWT authentication.
    *   Nodemailer for email services.
*   **Deployment:**
    *   Vercel (for both Frontend and Serverless API)

## Project Structure 📁
reactiquiz/
├── api/                  # Vercel Serverless Functions (Backend)
│   ├── _middleware/
│   │   └── auth.js
│   ├── _utils/
│   │   ├── logger.js
│   │   └── tursoClient.js
│   └── routes/           # Express-style route handlers
│   └── index.js          # Main Vercel entry point for the API
├── public/
├── src/                  # React Frontend Application
│   ├── api/
│   ├── components/
│   ├── contexts/
│   ├── hooks/
│   ├── pages/
│   ├── utils/
│   └── App.js
├── .env.example          # Example environment variables
├── .gitignore
├── create-turso-schema.js # Script to initialize the DB schema
├── populate-turso-from-json.js # Script to populate DB from JSON
├── vercel.json           # Vercel deployment configuration
└── package.json

## Getting Started Locally 🚀

### Prerequisites

*   Node.js (v18.x or higher)
*   npm (comes with Node.js)
*   Git
*   A Turso DB account ([turso.tech](https://turso.tech/))

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/sanskarsontakke/reactiquiz.git
    cd reactiquiz
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    Create a `.env` file in the project root. Use `.env.example` as a template and add your credentials.
    ```env
    # Turso Database Credentials
    TURSO_DATABASE_URL= # Your Turso DB URL (e.g., libsql://...)
    TURSO_AUTH_TOKEN=   # Your Turso DB auth token

    # JWT Secret for Auth
    JWT_SECRET=your_super_secret_key_for_jwt

    # Gemini API Key for AI Features
    GEMINI_API_KEY=your_google_gemini_api_key

    # Nodemailer (Gmail) for Contact Form
    EMAIL_USER=your_gmail_address@gmail.com
    EMAIL_PASS=your_16_character_app_password
    ```

4.  **Set up the Database Schema (One-time):**
    Run the following command to create all necessary tables in your Turso database.
    ```bash
    npm run db:schema
    ```

5.  **Populate Static Content in Database (One-time):**
    Run this command to populate subjects, topics, and the initial question bank from the local JSON files.
    ```bash
    npm run db:populate
    ```

6.  **Run the Application:**
    You'll need two terminals open.

    *   **Terminal 1: Start the Backend API Server**
        (This runs the serverless functions locally)
        ```bash
        npm run dev:api
        ```
        The API should start on `http://localhost:3001` (or as configured).

    *   **Terminal 2: Start the Frontend Development Server**
        ```bash
        npm start
        ```
        The frontend will open at `http://localhost:3000`. API calls from the frontend are automatically proxied to your local API server.

### Available Scripts

*   `npm start`: Runs the React app.
*   `npm run build`: Builds the React app for production.
*   `npm run dev:api`: Starts the local API server with `nodemon`.
*   `npm run db:schema`: Creates the database schema on Turso.
*   `npm run db:populate`: Populates the database from local JSON files.

## Deployment 🌍

This project is configured for seamless deployment to **Vercel**.

1.  Push your code to a GitHub repository.
2.  Import the repository into your Vercel account.
3.  Vercel will automatically detect the `vercel.json` and `package.json` build settings.
4.  **Crucially**, add all the environment variables from your `.env` file to the Vercel project settings.
5.  Deploy! Vercel will build the frontend and deploy the `api` directory as serverless functions.