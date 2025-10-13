# Welcome to ReactiQuiz 🧠✨

**Sharpening Minds, One Quiz at a Time.**

ReactiQuiz is a modern, open-source quiz application designed for students, educators, and lifelong learners. Our mission is to provide an engaging, high-performance, and data-driven platform for learning and self-assessment.

🔗 **Live:** [reactiquiz.vercel.app](https://reactiquiz.vercel.app/)

---

## ✨ Core Features

*   📚 **Diverse Subject Library:** Practice quizzes across Physics, Chemistry, Biology, and more with comprehensive topic coverage
*   📊 **Interactive Analytics Dashboard:** Visualize your performance, track progress over time, and analyze your strengths and weaknesses by subject and difficulty
*   🤖 **AI Study Center:** Get personalized help and insights from an integrated AI assistant powered by Google Gemini
*   🎨 **High-Contrast Theming:** Beautiful dark and light themes with Vercel-inspired high-contrast design for optimal readability
*   📄 **PDF Generation:** Export question sets as beautifully formatted PDFs for offline study
*   🎯 **Homi Bhabha Practice Tests:** Specialized practice sessions for competitive exam preparation
*   📝 **Subjective Assessment:** AI-powered grading for subjective questions and essays
*   ⚡ **Instant Performance:** A snappy, responsive UI powered by TanStack Query caching and a globally distributed edge database

## 🛠️ Technology Stack

We believe in using modern, scalable technologies to deliver the best experience.

### Frontend
*   **React 18** with modern hooks and functional components
*   **Material-UI (MUI)** for consistent, accessible design system
*   **TanStack Query** for efficient data fetching and caching
*   **Chart.js** for interactive data visualization
*   **React Router** for seamless navigation
*   **Axios** for HTTP client with interceptors

### Backend
*   **Node.js** with Express.js framework
*   **Vercel Serverless Functions** for scalable deployment
*   **JWT Authentication** for secure user sessions
*   **Express Validator** for input validation
*   **Nodemailer** for email services

### Database & AI
*   **Turso (libSQL)** Edge Database for global performance
*   **Google Gemini API** for AI-powered features
*   **bcryptjs** for secure password hashing

### Development & Deployment
*   **Vercel** for seamless CI/CD and deployment
*   **ESLint** for code quality
*   **Jest** for testing framework
*   **dotenv** for environment management

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Access to required environment variables

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/reactiquiz.git
   cd reactiquiz
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Configure your environment variables
   ```

4. **Start development server**
   ```bash
   npm start
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 📁 Project Structure

```
reactiquiz/
├── api/                    # Backend serverless functions
│   ├── routes/            # API route handlers
│   ├── _middleware/       # Authentication & validation
│   └── _utils/            # Utility functions
├── src/
│   ├── components/        # React components
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Page components
│   └── utils/             # Frontend utilities
├── public/                # Static assets
└── docs/                  # Documentation
```

## 🎨 Theme System

ReactiQuiz features a sophisticated theming system with:

- **High-contrast dark theme** with Vercel-inspired design
- **Clean light theme** for daytime use
- **Automatic theme persistence** using localStorage
- **Consistent color palette** across all components
- **Accessible contrast ratios** for optimal readability

## 🔧 Environment Variables

Required environment variables for full functionality:

```env
# Database
TURSO_DATABASE_URL=your_turso_database_url
TURSO_AUTH_TOKEN=your_turso_auth_token

# Authentication
JWT_SECRET=your_jwt_secret_key

# AI Services
GEMINI_API_KEY=your_gemini_api_key

# Email (Optional)
EMAIL_HOST=your_email_host
EMAIL_PORT=your_email_port
EMAIL_USER=your_email_user
EMAIL_PASS=your_email_password
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📈 Performance Features

- **Optimized bundle size** with code splitting
- **Efficient caching** with TanStack Query
- **Global edge database** for low latency
- **Responsive design** for all device sizes
- **Progressive Web App** capabilities

## 🤝 Contributing

ReactiQuiz is an open-source project, and we welcome contributions! Whether it's adding new questions, fixing a bug, or proposing a new feature, feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and patterns
- Write tests for new features
- Update documentation as needed
- Ensure all CI checks pass

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Material-UI team for the excellent component library
- Vercel for the amazing deployment platform
- Turso for the edge database solution
- Google for the Gemini AI API
- All contributors and users who help improve ReactiQuiz

---

**Made with ❤️ for the learning community**