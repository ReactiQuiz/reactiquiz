# ReactiQuiz 🧠✨

ReactiQuiz is a dynamic and engaging quiz application, **now with an enhanced user interface for a more intuitive experience,** designed to help users test and improve their knowledge across various subjects including Physics, Chemistry, Biology, Mathematics, General Knowledge, and specialized preparation for the Homi Bhabha Balvaidnyanik Spardha.

**Live Frontend:** [https://sanskarsontakke.github.io/reactiquiz/](https://sanskarsontakke.github.io/reactiquiz/)
**Live Backend API:** [still.working.on.it.com`]
## Features 🚀

*   **Multiple Subjects:** Quizzes available for Physics, Chemistry, Biology, Mathematics, and General Knowledge.
*   **Visually Enhanced Homepage:** Features a dynamic layout with a full-width, scrollable subject explorer and a prominent section for Homi Bhabha exam resources, making navigation intuitive and appealing.
*   **Improved Account Management:** A polished Account Page offers a streamlined experience for logged-in users with quick access to profile actions (like changing passwords), friends, and challenges, alongside clearer forms for login, registration, and password recovery.
*   **Homi Bhabha Exam Prep:** Dedicated section with practice tests and mock PYQs tailored for the Homi Bhabha Balvaidnyanik Spardha (Standards 6th & 9th).
*   **Customizable Quizzes:** Users can select difficulty levels (Easy, Medium, Hard, Mixed) and the number of questions for most topics.
*   **Timed Quizzes:** Homi Bhabha practice tests include a 90-minute timer to simulate exam conditions.
*   **Instant Results:** Get immediate feedback with scores, percentages, and a detailed breakdown of correct/incorrect answers with explanations.
*   **Persistent Results History:** Track your progress over time. Users can view and delete their past quiz attempts (when logged in).
*   **Friend System & Challenges:**
    *   Connect with friends by sending and accepting friend requests.
    *   Challenge friends to quizzes based on your past attempts or new configurations.
    *   Track incoming challenges and view completed challenge history.
*   **Flashcards:** Study mode available for topics, allowing users to review questions and answers.
*   **Dynamic Question Loading:** Questions and topics are fetched from a backend API, allowing for easy updates and expansion of the quiz bank.
*   **Polished Responsive Design:** A refined, user-friendly interface that adapts beautifully to various devices, ensuring a seamless experience on desktops, tablets, and mobiles, especially noticeable on the Home and Account pages.
*   **Dark Mode Theme:** Built with Material UI, offering a comfortable viewing experience.
*   **Contact Form:** Integrated contact form for user feedback and inquiries.

## Tech Stack 💻

*   **Frontend:**
    *   React.js (with Hooks)
    *   React Router
    *   Material UI (MUI) for styling and components
    *   Axios for API calls
    *   FontAwesome for additional icons
*   **Backend:**
    *   Node.js
    *   Express.js for the API server
    *   SQLite3 for database storage (questions, topics, results, users, friends, challenges)
    *   `bcryptjs` for password hashing
    *   Nodemailer for the contact form (using Gmail SMTP via App Password)
    *   `cors`, `dotenv`, `debug`
*   **Deployment:**
    *   Frontend: GitHub Pages
    *   Backend: (e.g., Railway, Render, Heroku, or your chosen platform)

## Project Structure 📁
reactiquiz/
├── backend/
│ ├── quizData.db       # SQLite DB for questions
│ ├── quizResults.db    # SQLite DB for user results
│ ├── quizTopics.db     # SQLite DB for topic metadata
│ ├── users.db          # SQLite DB for user accounts
│ ├── friends.db        # SQLite DB for friend relationships
│ ├── challenges.db     # SQLite DB for challenge data
│ ├── questions.json    # Source JSON data for questions
│ ├── topics.json       # Source JSON data for topics
│ ├── jsonToQuestionsDB.js # Script to populate questions DB
│ ├── jsonToTopicsDB.js    # Script to populate topics DB
│ └── server.js         # Express.js backend server application
├── public/
│ ├── index.html
│ ├── manifest.json
│ ├── robots.txt
│ └── assets/           # Static assets like logos, placeholder images
│   ├── profile-placeholder.png
│   └── logo.png
├── src/
│ ├── api/
│ │ └── axiosInstance.js # Pre-configured Axios instance
│ ├── components/       # Reusable React UI components
│ │ ├── AppDrawer.js
│ │ ├── AppRoutes.js
│ │ ├── ChangePasswordModal.js
│ │ ├── ChallengeSetupModal.js
│ │ ├── DeleteConfirmationDialog.js
│ │ ├── FlashcardItem.js
│ │ ├── Footer.js
│ │ ├── HistoricalResultItem.js
│ │ ├── Navbar.js
│ │ ├── PracticeTestModal.js
│ │ ├── PYQPapersModal.js
│ │ ├── QuestionBreakdown.js
│ │ ├── QuestionItem.js
│ │ ├── QuizResultSummary.js
│ │ ├── ResultRevealOverlay.js
│ │ ├── ResultsActionButtons.js
│ │ └── TopicCard.js
│ ├── pages/            # Top-level page components
│ │ ├── AboutPage.js
│ │ ├── AccountPage.js
│ │ ├── BiologyPage.js
│ │ ├── ChallengesPage.js
│ │ ├── ChemistryPage.js
│ │ ├── ConfirmDevicePage.js
│ │ ├── FlashcardPage.js
│ │ ├── FriendsPage.js
│ │ ├── GKPage.js
│ │ ├── HomePage.js
│ │ ├── HomibhabhaPage.js
│ │ ├── MathematicsPage.js
│ │ ├── PhysicsPage.js
│ │ ├── QuizPage.js
│ │ └── ResultsPage.js
│ ├── App.js            # Main application component
│ ├── index.js          # Entry point for React application
│ ├── reportWebVitals.js
│ ├── setupTests.js
│ ├── theme.js          # MUI theme configuration
│ └── utils/
│   ├── deviceId.js
│   └── formatTime.js   # Utility functions
├── .env                # Local environment variables (GITIGNORED!)
├── .gitignore
├── LICENSE             # Project license (e.g., MIT License)
├── package-lock.json
├── package.json
└── README.md

## Getting Started Locally 🚀

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   Node.js (v18.x or higher recommended for backend, v14+ for frontend build)
*   npm (comes with Node.js)
*   Git

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/sanskarsontakke/reactiquiz.git
    cd reactiquiz
    ```

2.  **Install frontend and backend dependencies:**
    (Since all dependencies are in the root `package.json`)
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    Create a `.env` file in the project root (`reactiquiz/.env`) and add the following (replace placeholders):
    ```env
    REACT_APP_API_BASE_URL=http://localhost:3001
    SERVER_PORT=3001

    # For backend contact form (using Gmail App Password)
    EMAIL_USER=your_gmail_address@gmail.com
    EMAIL_PASS=your_16_character_app_password
    # Optional: Name for the sender email, e.g., "ReactiQuiz Support"
    # EMAIL_SENDER_NAME="ReactiQuiz Support"


    # Optional: Define database paths if different from defaults in backend/server.js
    # By default, server.js will look for .db files in the ./backend/ directory.
    # Example:
    # DATABASE_FILE_PATH=./backend/myQuizResults.db
    # QUESTIONS_DATABASE_FILE_PATH=./backend/myQuizData.db
    # TOPICS_DATABASE_FILE_PATH=./backend/myQuizTopics.db
    # USERS_DATABASE_FILE_PATH=./backend/myUsers.db
    # FRIENDS_DATABASE_FILE_PATH=./backend/myFriends.db
    # CHALLENGES_DATABASE_FILE_PATH=./backend/myChallenges.db
    ```
    **Important:** Add `.env` to your `.gitignore` file if it's not already there! The provided `.gitignore` should already include it.

4.  **Populate Core Data Databases (One-time setup for topics & questions):**
    Navigate to the backend directory and run the converter scripts to populate your SQLite databases from the JSON source files.
    ```bash
    cd backend
    node jsonToTopicsDB.js  # Follow prompts (default: topics.json)
    node jsonToQuestionsDB.js # Follow prompts (default: questions.json)
    cd ..
    ```
    This will create/update `quizTopics.db` and `quizData.db` in the `backend/` folder (or as specified in `.env`).
    Databases for user data (`users.db`, `quizResults.db`, `friends.db`, `challenges.db`) will be created automatically by the server on first use if they don't exist.

5.  **Run the Application:**
    You'll need two terminals open.

    *   **Terminal 1: Start the Backend Server**
        ```bash
        npm run backend:dev
        ```
        (or `npm run backend` for without nodemon)
        The backend should start on `http://localhost:3001` (or the `SERVER_PORT` you set).

    *   **Terminal 2: Start the Frontend Development Server**
        ```bash
        npm start
        ```
        (This runs the `frontend` script defined in `package.json`)
        The frontend should open in your browser, usually at `http://localhost:3000`. It's proxied to the backend for API calls.

### Available Scripts (from `package.json`)

*   `npm start` (or `npm run frontend`): Runs the React app in development mode.
*   `npm run build`: Builds the app for production to the `build` folder.
*   `npm test`: Launches the test runner.
*   `npm run eject`: Ejects from Create React App (one-way operation).
*   `npm run backend`: Starts the Node.js backend server.
*   `npm run backend:dev`: Starts the backend server with `nodemon` for auto-restarts.
*   `npm run predeploy` & `npm run deploy`: For deploying the frontend to GitHub Pages.

## Deployment 🌍

*   **Frontend:** Deployed to GitHub Pages via the `npm run deploy` script.
*   **Backend:** Currently set up to be deployable to platforms like Railway, Render, Glitch, etc. (See platform-specific guides for deployment steps). Environment variables (`EMAIL_USER`, `EMAIL_PASS`, and database paths if customized) need tobe set on the hosting platform. Ensure your chosen platform supports SQLite or adapt to a different database if needed.

## Contributing 🤝

Contributions are welcome! If you'd like to contribute, please follow these steps:

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

Please ensure your code adheres to the existing style and that any new features are well-tested.

## Future Enhancements / To-Do 📝

*   [✔] Add more subjects and topics.
*   [✔] More advanced filtering for quiz history.
*   [✔] Leaderboards (global or friend-based).
*   [✔] More detailed analytics for quiz performance.
*   [✔] Admin panel for managing questions and topics more easily.
*   [✔] Option for users to suggest questions.
*   [✔] Implement full passwordless login option.

## License 📄

This project is licensed under the MIT License - see the `LICENSE.md` file for details.

## Contact 📬

Sanskar Sontakke - [sanskarsontakke@gmail.com](mailto:sanskarsontakke@gmail.com) - (https://www.linkedin.com/in/sanskar-sontakke-249576357/)

Project Link: [https://github.com/sanskarsontakke/reactiquiz](https://github.com/sanskarsontakke/reactiquiz)