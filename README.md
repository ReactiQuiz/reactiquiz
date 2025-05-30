# ReactiQuiz 🧠✨

ReactiQuiz is a dynamic and engaging quiz application designed to help users test and improve their knowledge across various subjects including Physics, Chemistry, Biology, Mathematics, General Knowledge, and specialized preparation for the Homi Bhabha Balvaidnyanik Spardha.

**Live Frontend:** [https://sanskarsontakke.github.io/reactiquiz/](https://sanskarsontakke.github.io/reactiquiz/)
**Live Backend API:** `still.working.on.it.com`

## Features 🚀

*   **Multiple Subjects:** Quizzes available for Physics, Chemistry, Biology, Mathematics, and General Knowledge.
*   **Homi Bhabha Exam Prep:** Dedicated section with practice tests and mock PYQs tailored for the Homi Bhabha Balvaidnyanik Spardha (Standards 6th & 9th).
*   **Customizable Quizzes:** Users can select difficulty levels (Easy, Medium, Hard, Mixed) and the number of questions for most topics.
*   **Timed Quizzes:** Homi Bhabha practice tests include a 90-minute timer to simulate exam conditions.
*   **Instant Results:** Get immediate feedback with scores, percentages, and a detailed breakdown of correct/incorrect answers with explanations.
*   **Persistent Results History:** Track your progress over time. Users can view and delete their past quiz attempts.
*   **Dynamic Question Loading:** Questions and topics are fetched from a backend API, allowing for easy updates and expansion of the quiz bank.
*   **Responsive Design:** User-friendly interface accessible on various devices.
*   **Dark Mode Theme:** Built with Material UI, offering a comfortable viewing experience.

## Tech Stack 💻

*   **Frontend:**
    *   React.js
    *   React Router
    *   Material UI (MUI) for styling and components
    *   Axios for API calls
    *   FontAwesome for additional icons
*   **Backend:**
    *   Node.js
    *   Express.js for the API server
    *   SQLite3 for database storage (questions, topics, results)
    *   Nodemailer for the contact form (using Gmail SMTP via App Password)
    *   `cors`, `dotenv`, `debug`
*   **Deployment:**
    *   Frontend: GitHub Pages
    *   Backend: Railway (or your chosen platform)

## Project Structure 📁
reactiquiz/
├── backend/
│ ├── quizData.db # SQLite DB for questions
│ ├── quizResults.db # SQLite DB for user results
│ ├── quizTopics.db # SQLite DB for topic metadata
│ ├── questions.json # Source JSON for questions
│ ├── topics.json # Source JSON for topics
│ ├── jsonToQuestionsDB.js # Script to populate questions DB
│ ├── jsonToTopicsDB.js # Script to populate topics DB
│ └── server.js # Express backend server
├── public/
│ ├── index.html
│ └── assets/ # Placeholder for images like profile pic, logo
├── src/
│ ├── api/
│ │ └── axiosInstance.js
│ ├── components/ # Reusable React components
│ ├── pages/ # Page components (HomePage, AboutPage, Subject Pages, etc.)
│ ├── App.js
│ ├── index.js
│ ├── theme.js
│ └── utils/
│ └── formatTime.js
├── .env # Local environment variables (GITIGNORED!)
├── .gitignore
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

    # Optional: Define database paths if different from defaults in server.js
    # By default, server.js will look for .db files in the ./backend/ directory.
    # DATABASE_FILE_PATH=./backend/quizResults.db
    # QUESTIONS_DATABASE_FILE_PATH=./backend/quizData.db
    # TOPICS_DATABASE_FILE_PATH=./backend/quizTopics.db
    ```
    **Important:** Add `.env` to your `.gitignore` file if it's not already there!

4.  **Populate Databases (One-time setup):**
    Navigate to the backend directory and run the converter scripts to populate your SQLite databases from the JSON source files.
    ```bash
    cd backend
    node jsonToTopicsDB.js  # Follow prompts (default: topics.json)
    node jsonToQuestionsDB.js # Follow prompts (default: questions.json)
    cd ..
    ```
    This will create/update `quizTopics.db` and `quizData.db` in the `backend/` folder. `quizResults.db` will be created automatically by the server on the first result save.

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
*   **Backend:** Currently set up to be deployable to platforms like Railway, Render, Glitch, etc. (See platform-specific guides for deployment steps). Environment variables (`EMAIL_USER`, `EMAIL_PASS`, and database paths if customized) need to be set on the hosting platform.

## Contributing 🤝 (Optional Section)

Contributions are welcome! If you'd like to contribute, please follow these steps:

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

Please ensure your code adheres to the existing style and that any new features are well-tested.

## Future Enhancements / To-Do 📝 (Optional Section)

*   [ ] Add more subjects and topics.
*   [ ] Implement user authentication for personalized result tracking.
*   [ ] More advanced carousel for subject exploration.
*   [ ] Admin panel for managing questions and topics.
*   [ ] More detailed analytics for quiz performance.

## License 📄

This project is licensed under the MIT License - see the `LICENSE.md` file for details (if you have one, otherwise state MIT).

## Contact 📬

Sanskar Sontakke - [sanskarsontakke@gmail.com](mailto:sanskarsontakke@gmail.com) - [LinkedIn Profile URL]

Project Link: [https://github.com/sanskarsontakke/reactiquiz](https://github.com/sanskarsontakke/reactiquiz)

---
