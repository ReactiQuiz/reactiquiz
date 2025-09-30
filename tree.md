# ReactiQuiz Project Tree Structure

A comprehensive overview of the ReactiQuiz project directory structure with detailed descriptions of all files and directories.

```
reactiquiz/                                 # Root directory of ReactiQuiz application
├── 📁 .idea/                               # JetBrains IDE configuration
│   ├── 📁 caches/
│   │   └── deviceStreaming.xml             # IDE device streaming cache
│   ├── .gitignore                          # IDE-specific gitignore
│   ├── misc.xml                            # IDE miscellaneous settings
│   ├── modules.xml                         # IDE module configuration
│   ├── reactiquiz.iml                      # IntelliJ module file
│   ├── vcs.xml                             # Version control settings
│   └── workspace.xml                       # IDE workspace configuration
│
├── 📁 api/                                 # Backend serverless API functions
│   ├── 📁 _middleware/                     # Express middleware functions
│   │   ├── adminAuth.ts                    # Admin-only route protection middleware
│   │   └── auth.ts                         # JWT authentication middleware
│   │
│   ├── 📁 _utils/                          # Backend utility functions
│   │   ├── arrayUtils.ts                   # Array manipulation utilities
│   │   ├── logger.js                       # Legacy logging utility (JS)
│   │   ├── logger.ts                       # Modern logging utility with colored output
│   │   ├── quizAssembler.ts                # Quiz generation and assembly logic
│   │   └── tursoClient.ts                  # Turso database client configuration
│   │
│   ├── 📁 routes/                          # API route handlers
│   │   ├── admin.ts                        # Admin dashboard API endpoints (27KB)
│   │   ├── ai.ts                           # Google Gemini AI integration endpoints
│   │   ├── challenges.ts                   # Friend challenges API
│   │   ├── contact.ts                      # Contact form submission endpoint
│   │   ├── friends.ts                      # Friend system management
│   │   ├── homibhabha.ts                   # Homi Bhabha exam-specific endpoints
│   │   ├── questions.ts                    # Question management API
│   │   ├── quizSessions.ts                 # Quiz session tracking and management
│   │   ├── results.ts                      # Quiz results storage and retrieval
│   │   ├── subjective.ts                   # Subjective question handling (9KB)
│   │   ├── subjects.js/.ts                 # Subject management (legacy + modern)
│   │   ├── topics.js/.ts                   # Topic management (legacy + modern)
│   │   └── users.js/.ts                    # User authentication and management (12KB)
│   │
│   ├── index.ts                            # Main Express app configuration (5KB)
│   └── server.ts                           # Local development server launcher
│
├── 📁 public/                              # Static assets served by React
│   ├── index.html                          # Main HTML template
│   ├── logo.png                            # ReactiQuiz logo (89KB)
│   ├── manifest.json                       # PWA manifest configuration
│   ├── profile-sanskar.png                 # Developer profile image (49KB)
│   └── robots.txt                          # Search engine crawling rules
│
├── 📁 src/                                 # React frontend source code
│   ├── 📁 api/                             # Frontend API integration
│   │   ├── 📁 __mocks__/
│   │   │   └── axiosInstance.js            # Mock axios for testing
│   │   └── axiosInstance.ts                # Configured axios client with interceptors
│   │
│   ├── 📁 components/                      # React components organized by feature
│   │   ├── 📁 about/                       # About page components
│   │   │   ├── AboutHeader.js              # About page header section
│   │   │   ├── ContactFormSection.js       # Contact form component
│   │   │   └── CreatorProfile.js           # Developer profile section
│   │   │
│   │   ├── 📁 account/                     # User account management
│   │   │   ├── AccountManagementActions.js # Account settings actions
│   │   │   ├── AccountPageSkeleton.js      # Loading skeleton for account page
│   │   │   ├── UserActivityChart.js        # User activity visualization
│   │   │   └── UserProfileCard.js          # User profile display card
│   │   │
│   │   ├── 📁 admin/                       # Admin dashboard components
│   │   │   ├── 📁 content/                 # Content management components
│   │   │   │   ├── JsonImportModal.js      # JSON data import modal
│   │   │   │   ├── ManageQuestions.js      # Question management interface
│   │   │   │   ├── ManageSubjects.js       # Subject management interface (10KB)
│   │   │   │   ├── ManageTopics.js         # Topic management interface (11KB)
│   │   │   │   ├── QuestionDetailView.js   # Detailed question view (9KB)
│   │   │   │   └── TopicSummaryList.js     # Topic summary display
│   │   │   │
│   │   │   ├── AdminSidebar.js             # Admin navigation sidebar
│   │   │   ├── AddSubjectRow.js            # Add new subject component
│   │   │   ├── ContentOverview.js          # Content statistics overview
│   │   │   ├── EditableSubjectRow.js       # Editable subject row component
│   │   │   ├── StatBox.js                  # Statistics display box
│   │   │   └── SubjectsTable.js            # Subjects management table
│   │   │
│   │   ├── 📁 auth/                        # Authentication components
│   │   │   ├── AuthBrandingPanel.js        # Login/register branding
│   │   │   ├── ChangeDetailsModal.js       # User details change modal
│   │   │   ├── ChangePasswordModal.js      # Password change modal
│   │   │   ├── ForgotPasswordForm.js       # Password reset form
│   │   │   ├── LoginForm.test.js/.tsx      # Login form (with tests)
│   │   │   ├── LoginModal.js               # Login modal wrapper
│   │   │   └── RegisterForm.test.js/.tsx   # Registration form (with tests)
│   │   │
│   │   ├── 📁 core/                        # Core application components
│   │   │   ├── AdminRoute.tsx              # Admin-only route protection
│   │   │   ├── AppDrawer.tsx               # Mobile navigation drawer
│   │   │   ├── AppProviders.js             # Legacy providers wrapper
│   │   │   ├── Footer.tsx                  # Application footer
│   │   │   ├── Navbar.tsx                  # Main navigation bar (7KB)
│   │   │   ├── NotificationManager.js      # Global notifications handler
│   │   │   ├── ProtectedRoute.test.js/.tsx # Protected route component (with tests)
│   │   │   └── ScrollToTop.tsx             # Scroll restoration component
│   │   │
│   │   ├── 📁 dashboard/                   # Dashboard visualization components
│   │   │   ├── AverageScoreTrendChart.tsx  # Score trend visualization
│   │   │   ├── DashboardActivityChart.tsx  # Activity timeline chart
│   │   │   ├── DashboardControls.js        # Dashboard filter controls
│   │   │   ├── DashboardEmptyState.tsx     # Empty state component
│   │   │   ├── DashboardSkeleton.tsx       # Loading skeleton
│   │   │   ├── DifficultyBreakdownChart.tsx # Difficulty analysis chart
│   │   │   ├── GenerateReportButton.js     # PDF report generation
│   │   │   ├── KpiBreakdownPieChart.js     # KPI pie chart
│   │   │   ├── KpiCards.js                 # Key performance indicators (7KB)
│   │   │   ├── OverallDifficultyCard.js    # Difficulty summary card
│   │   │   ├── OverallStatsCards.js        # Overall statistics display
│   │   │   ├── SubjectAveragesChart.js     # Subject averages visualization
│   │   │   ├── SubjectDifficultyCard.js    # Per-subject difficulty analysis
│   │   │   ├── SubjectPerformanceGrid.js   # Subject performance grid
│   │   │   └── TopicPerformanceList.js     # Topic-wise performance list
│   │   │
│   │   ├── 📁 flashcards/                  # Flashcard study components
│   │   │   ├── FlashcardItem.js            # Individual flashcard component
│   │   │   └── FlashcardViewer.js          # Flashcard viewer interface
│   │   │
│   │   ├── 📁 home/                        # Homepage components
│   │   │   ├── AboutSummarySection.js      # About section on homepage
│   │   │   ├── CallToActionSection.js      # CTA section
│   │   │   ├── HeroSection.js              # Hero banner section
│   │   │   ├── HomiBhabhaSpotlight.js      # Homi Bhabha exam spotlight
│   │   │   └── KeyFeaturesSection.js       # Features showcase section
│   │   │
│   │   ├── 📁 layout/                      # Layout wrapper components
│   │   │   ├── AdminLayout.tsx             # Admin panel layout
│   │   │   ├── MainLayout.tsx              # Main application layout
│   │   │   └── MinimalLayout.tsx           # Minimal layout for auth pages
│   │   │
│   │   ├── 📁 quiz/                        # Quiz-related components
│   │   │   ├── 📁 __mocks__/               # Quiz component mocks for testing
│   │   │   ├── 📁 homibhabha/              # Homi Bhabha exam components
│   │   │   │   ├── HomiBhabhaCard.tsx      # Exam info card
│   │   │   │   ├── PracticeTestModal.js/.tsx # Practice test modal
│   │   │   │   └── PYQPapersModal.js/.tsx  # Previous year questions modal
│   │   │   │
│   │   │   ├── QuestionItem.js/.test.js/.tsx # Individual question display (with tests)
│   │   │   ├── QuestionsPdfModal.js/.tsx   # PDF export modal
│   │   │   ├── QuizHeader.js/.test.js/.tsx # Quiz header component (with tests)
│   │   │   ├── QuizQuestionList.js/.test.js/.tsx # Question list display (with tests)
│   │   │   └── QuizSettingsModal.js/.tsx   # Quiz configuration modal
│   │   │
│   │   ├── 📁 results/                     # Quiz results components
│   │   │   ├── CurrentResultView.js        # Current session results (7KB)
│   │   │   ├── HistoricalResultDetailView.js/.tsx # Historical result details
│   │   │   ├── HistoricalResultItem.js     # Result item in history list
│   │   │   ├── HistoricalResultsList.js/.test.js # Results history list (with tests)
│   │   │   ├── QuestionBreakdown.js        # Question-by-question breakdown
│   │   │   ├── QuizResultSummary.js        # Result summary component
│   │   │   ├── ResultRevealOverlay.js      # Result reveal animation
│   │   │   ├── ResultsActionButtons.js     # Action buttons for results
│   │   │   ├── ResultsFilters.js/.test.js  # Results filtering (with tests)
│   │   │   ├── SubjectiveResultItem.js     # Subjective question result
│   │   │   └── SubjectiveResultsList.js    # Subjective results list (7KB)
│   │   │
│   │   ├── 📁 settings/                    # Settings components
│   │   │   └── ThemePanel.js               # Theme selection panel
│   │   │
│   │   ├── 📁 shared/                      # Shared/common components
│   │   │   ├── 📁 __mocks__/               # Shared component mocks
│   │   │   │   └── MarkdownRenderer.js     # Markdown renderer mock
│   │   │   │
│   │   │   ├── DeleteConfirmationDialog.js # Deletion confirmation modal
│   │   │   ├── EmptyState.js/.test.js      # Empty state component (with tests)
│   │   │   ├── MarkdownRenderer.js/.tsx    # Markdown content renderer
│   │   │   ├── SkeletonGrid.js             # Loading skeleton grid
│   │   │   └── StatusAlert.js/.test.js     # Status alert component (with tests)
│   │   │
│   │   ├── 📁 subjective/                  # Subjective question components
│   │   │   └── RichTextEditor.js           # Rich text editor for essays
│   │   │
│   │   ├── 📁 topics/                      # Topic-related components
│   │   │   ├── SubjectBreadcrumb.js        # Subject navigation breadcrumb
│   │   │   ├── SubjectOverviewCard.js      # Subject summary card
│   │   │   ├── TopicCard.js/.test.js/.tsx  # Topic card component (with tests)
│   │   │   ├── TopicFilters.tsx            # Topic filtering controls
│   │   │   └── TopicSkeletonGrid.js        # Loading skeleton for topics
│   │   │
│   │   └── AppRoutes.tsx                   # Main routing configuration
│   │
│   ├── 📁 contexts/                        # React context providers
│   │   ├── 📁 __mocks__/                   # Context mocks for testing
│   │   │   ├── SubjectColorsContext.js     # Subject colors mock
│   │   │   ├── ThemeContext.js             # Theme context mock
│   │   │   └── TopicsContext.js            # Topics context mock
│   │   │
│   │   ├── AppProviders.tsx                # All providers wrapper
│   │   ├── AuthContext.tsx                 # Authentication state management
│   │   ├── NotificationsContext.tsx        # Global notifications state
│   │   ├── SubjectColorsContext.tsx        # Subject color theming
│   │   ├── ThemeContext.tsx                # Dark/light theme management
│   │   └── TopicsContext.tsx               # Topics state management
│   │
│   ├── 📁 hooks/                           # Custom React hooks
│   │   ├── useAboutPage.ts                 # About page data fetching
│   │   ├── useAccount.test.js/.ts          # Account management hook (with tests)
│   │   ├── useAdminDashboard.ts            # Admin dashboard data
│   │   ├── useAICenter.ts                  # AI assistant integration
│   │   ├── useDashboard.ts                 # Main dashboard data (11KB)
│   │   ├── useDashboardData.js             # Legacy dashboard hook
│   │   ├── useFlashcards.ts                # Flashcard functionality
│   │   ├── useHomibhabha.ts                # Homi Bhabha exam data
│   │   ├── useQuiz.ts                      # Quiz functionality
│   │   ├── useResults.ts                   # Results management
│   │   ├── useSubjects.test.js/.ts         # Subjects hook (with tests)
│   │   └── useSubjectTopics.ts             # Subject topics management
│   │
│   ├── 📁 pages/                           # Page components
│   │   ├── 📁 admin/                       # Admin panel pages
│   │   │   ├── ContentManagementPage.js    # Content management interface
│   │   │   ├── GeneralSettingsPage.js      # General admin settings
│   │   │   └── UserManagementPage.js       # User management interface
│   │   │
│   │   ├── AboutPage.tsx                   # About page
│   │   ├── AccountPage.js/.tsx             # User account page
│   │   ├── AICenterPage.js/.tsx            # AI assistant page (6KB)
│   │   ├── AllSubjectsPage.js/.tsx         # All subjects overview
│   │   ├── DashboardPage.tsx               # Main dashboard page (6KB)
│   │   ├── FlashcardPage.js/.tsx           # Flashcard study page
│   │   ├── HomePage.test.js/.tsx           # Homepage (with tests)
│   │   ├── HomibhabhaPage.js/.tsx          # Homi Bhabha exam page
│   │   ├── LoginPage.tsx                   # Login page
│   │   ├── NotFoundPage.js/.test.js/.tsx   # 404 error page (with tests)
│   │   ├── QuizLoadingPage.js              # Quiz loading page
│   │   ├── QuizPage.tsx                    # Main quiz interface
│   │   ├── RegisterPage.tsx                # Registration page
│   │   ├── ResultsPage.tsx                 # Results history page
│   │   ├── SettingsPage.js/.tsx            # User settings page
│   │   ├── SubjectivePaperPage.js          # Subjective exam page
│   │   ├── SubjectiveResultPage.js         # Subjective results page
│   │   └── SubjectTopicsPage.js/.tsx       # Subject topics listing
│   │
│   ├── 📁 types/                           # TypeScript type definitions
│   │   └── index.ts                        # Global type definitions (10KB)
│   │
│   ├── 📁 utils/                           # Utility functions
│   │   ├── deviceId.test.js/.ts            # Device identification (with tests)
│   │   ├── formatTime.js/.test.js/.ts      # Time formatting utilities (with tests)
│   │   ├── getIconComponent.js/.ts         # Icon component resolver
│   │   ├── questionsPdfGenerator.tsx       # PDF generation for questions (7KB)
│   │   ├── quizUtils.js/.test.js/.ts       # Quiz utility functions (with tests)
│   │   └── reportGenerator.js/.ts          # Performance report generation (13KB)
│   │
│   ├── adminTheme.js                       # Admin theme configuration
│   ├── App.tsx                             # Main App component
│   ├── index.tsx                           # React app entry point
│   ├── reportWebVitals.js                  # Performance monitoring
│   ├── setupTests.js                       # Jest testing configuration
│   ├── test-utils.js                       # Testing utilities
│   └── theme.ts                            # Material-UI theme configuration (5KB)
│
├── 📄 Configuration & Data Files           # Project configuration and data
├── .env                                    # Environment variables (private)
├── .env.example                            # Environment variables template
├── .gitignore                              # Git ignore rules
├── package.json                            # Node.js dependencies and scripts
├── package-lock.json                       # Dependency lock file (850KB)
├── tsconfig.json                           # TypeScript configuration
├── vercel.json                             # Vercel deployment configuration
│
├── 📄 Documentation & Prompts              # Project documentation
├── README.md                               # Main project documentation (6KB)
├── TODO.md                                 # Project todo list
├── LICENSE                                 # MIT license file
├── GeminiGradingPrompt.txt                 # AI grading prompt template
├── QuestionGenerationPrompt.txt            # AI question generation prompt (6KB)
├── SubjectiveQuestionGenerationPrompt.txt  # Subjective question AI prompt
├── TopicGenerationPrompt.txt               # Topic generation AI prompt
│
├── 📄 Data Files                           # Static data and content
├── git.txt                                 # Git-related notes
├── populate-turso-from-json.js             # Database population script (7KB)
├── questions.json                          # Questions database (9.5MB)
├── subjective-questions.json               # Subjective questions data (54KB)
├── subjects.json                           # Subjects configuration
├── topics.json                             # Topics data (31KB)
│
└── 📁 build/                               # Production build output (excluded)
```

## 📊 Project Statistics

### File Count by Type
- **TypeScript Files**: ~155+ files (.ts/.tsx) ✅
- **JavaScript Files**: ~15 files (.test.js - tests/mocks only)
- **Test Files**: ~15 files (.test.js)
- **Configuration Files**: ~8 files
- **Documentation**: ~8 files (including conversion docs)
- **Data Files**: ~6 JSON files

### Code Organization
- **Components**: 60+ React components organized by feature
- **API Routes**: 12+ Express.js route handlers
- **Custom Hooks**: 12+ React hooks for data management
- **Context Providers**: 6 React contexts for state management
- **Utility Functions**: 10+ utility modules
- **Page Components**: 15+ main page components

### Key Features by Directory
- **`api/`**: Serverless backend with JWT auth, rate limiting, AI integration
- **`src/components/`**: Feature-organized React components with comprehensive testing
- **`src/contexts/`**: Global state management with React Context API
- **`src/hooks/`**: Custom hooks for data fetching and state management
- **`src/pages/`**: Main application pages with routing
- **`src/utils/`**: Utility functions for PDF generation, time formatting, etc.

### Technology Integration
- **Frontend**: React 18 + **TypeScript** + Material-UI + TanStack Query ✅
- **Backend**: Node.js + Express + **TypeScript** + Vercel Serverless Functions ✅
- **Database**: Turso (libSQL) edge database
- **AI**: Google Gemini API integration
- **Testing**: Jest + React Testing Library
- **Build**: React Scripts + Vercel deployment
- **Language**: 100% TypeScript (excluding tests/mocks) ✅

### Recent Updates
- ✅ **Complete TypeScript Migration** - All source files converted from JavaScript to TypeScript
- ✅ **70+ files** converted to .tsx/.ts with modern type support
- ✅ Build system updated for TypeScript compilation
- ✅ Project now benefits from TypeScript's type safety and IDE support

This project demonstrates excellent code organization, comprehensive testing, modern web development practices, and **full TypeScript adoption** with a clear separation of concerns between frontend and backend code.
