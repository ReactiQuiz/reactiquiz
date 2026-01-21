// src/types/index.ts
/**
 * Type Definitions
 * 
 * This file contains all TypeScript type definitions and interfaces for the ReactiQuiz application.
 * It includes core data types, API response types, component prop types, hook return types,
 * and context types used throughout the application.
 */

/**
 * User Interface
 * 
 * Represents a user in the system. Contains authentication and profile information.
 */
export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  phone?: string;
  address: string;
  class?: string;
  isAdmin?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Subject Interface
 * 
 * Represents a subject/category in the quiz system. Contains subject metadata
 * including display name, colors for different themes, and icon information.
 */
export interface Subject {
  id: string;
  name: string;
  subjectKey: string; // Unique key identifier for the subject
  description?: string; // Optional subject description
  accentColorDark: string; // Accent color for dark theme
  accentColorLight: string; // Accent color for light theme
  icon?: string; // Optional icon identifier
}

/**
 * Topic Interface
 * 
 * Represents a topic within a subject. Contains topic metadata including
 * class, genre, and optional question count.
 */
export interface Topic {
  id: string;
  name: string;
  subject_id: string;
  class: string;
  genre: string;
  description?: string;
  questionCount?: number;
}

/**
 * Question Interface
 * 
 * Represents a quiz question with its options, correct answer, difficulty,
 * and metadata. Supports both structured and array-based option formats
 * for backward compatibility.
 */
export interface Question {
  id: string;
  question_text: string;
  text?: string; // For backward compatibility
  options: Array<{
    id: string;
    text: string;
  }> | string[]; // Support both structured and array formats
  correct_answer: number; // Index of correct answer
  correctOptionId?: string; // For backward compatibility
  explanation?: string; // Optional explanation for the answer
  difficulty: 1 | 2 | 3; // Difficulty level (1=easy, 2=medium, 3=hard)
  marks: number; // Points awarded for correct answer
  topicId: string; // Associated topic ID
  createdAt?: string; // Creation timestamp
}

/**
 * Quiz Session Interface
 * 
 * Represents an active quiz session. Contains all quiz metadata, questions,
 * user answers, timing information, and results.
 */
export interface QuizSession {
  id: string;
  userId: string;
  topicId: string;
  topicName: string;
  subject: string;
  difficulty: string;
  timeLimit: number;
  questions: Question[];
  userAnswers: Record<string, number>;
  startTime: string;
  endTime?: string;
  score?: number;
  percentage?: number;
  timeSpent?: number;
  accentColor?: string;
  class?: string;
}

/**
 * Quiz Result Interface
 * 
 * Represents a completed quiz result. Contains all performance metrics,
 * user answers snapshot, and optional full question details.
 */
export interface QuizResult {
  id: string;
  userId: string;
  topicId: string;
  topicName: string;
  subject: string;
  difficulty: string;
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  percentage: number; // Percentage score (0-100)
  timeSpent: number; // Time spent in seconds
  timestamp: string; // Completion timestamp
  questionsActuallyAttemptedIds: string[]; // IDs of questions user answered
  userAnswersSnapshot: Record<string, number>; // Snapshot of user's answers
  questions?: Question[]; // Optional full question details for detailed view
}

/**
 * API Response Types
 * 
 * Types for API request and response structures.
 */

/**
 * Login Response Interface
 * 
 * Response structure from successful login API call.
 * Contains authentication token and user data.
 */
export interface LoginResponse {
  token: string;
  user: User;
}

/**
 * Register Request Interface
 * 
 * Request structure for user registration API call.
 */
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  address: string;
  phone: string | undefined;
  class: string | undefined;
}

/**
 * API Response Interface
 * 
 * Generic API response structure with success status, optional data,
 * message, and error fields.
 * 
 * @template T - Type of data payload
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Dashboard and Analytics Types
 * 
 * Types for dashboard statistics and analytics data structures.
 */

/**
 * Dashboard Stats Interface
 * 
 * Comprehensive dashboard statistics including overall performance,
 * subject breakdowns, difficulty analysis, rolling averages, and
 * activity data.
 */
export interface DashboardStats {
  totalQuizzes: number;
  overallAverageScore: number;
  subjectBreakdowns: Record<string, {
    name: string;
    count: number;
    average: number;
    totalCorrect: number;
    totalQuestions: number;
  }>;
  overallQuestionStats: {
    total: number;
    correct: number;
    accuracy: number;
  };
  subjectDifficultyPerformance: Record<string, {
    easy: { correct: number; total: number; percentage: number };
    medium: { correct: number; total: number; percentage: number };
    hard: { correct: number; total: number; percentage: number };
  }>;
  overallDifficultyPerformance: {
    easy: { correct: number; total: number; percentage: number };
    medium: { correct: number; total: number; percentage: number };
    hard: { correct: number; total: number; percentage: number };
  };
  rollingAverageData: Array<{
    date: string;
    averageScore: number;
  }>;
  activityData: Array<{
    date: string;
    quizzes: number;
    score: number;
  }>;
  topicPerformance: Array<{
    topicId: string;
    topicName: string;
    totalQuizzes: number;
    averageScore: number;
    totalQuestions: number;
    correctAnswers: number;
  }>;
}

/**
 * Theme Types
 * 
 * Types for theme management.
 */

/**
 * Theme Mode Interface
 * 
 * Theme mode state and toggle function structure.
 */
export interface ThemeMode {
  themeMode: 'light' | 'dark';
  toggleTheme: () => void;
}

/**
 * Notification Types
 * 
 * Types for notification system.
 */

/**
 * Notification Interface
 * 
 * Represents a notification in the notification queue.
 */
export interface Notification {
  id: number; // Unique notification ID
  message: string; // Notification message text
  severity: 'success' | 'error' | 'warning' | 'info'; // Severity level
}

/**
 * Component Prop Types
 * 
 * Type definitions for component props used throughout the application.
 */

/**
 * Dashboard Empty State Props Interface
 * 
 * Props for the dashboard empty state component.
 */
export interface DashboardEmptyStateProps {
  currentUser: User;
  timeFrequency: 'week' | 'month' | 'year';
  onTimeFrequencyChange: (frequency: string) => void;
  allSubjects: Subject[];
  selectedSubject: string;
  onSubjectChange: (subject: string) => void;
}

/**
 * Topic Filters Props Interface
 * 
 * Props for the topic filters component.
 */
export interface TopicFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedClass: string;
  setSelectedClass: (cls: string) => void;
  selectedGenre: string;
  setSelectedGenre: (genre: string) => void;
  availableClasses: string[];
  availableGenres: string[];
}

/**
 * Subject Breadcrumb Props Interface
 * 
 * Props for the subject breadcrumb navigation component.
 */
export interface SubjectBreadcrumbProps {
  subjectDisplayName: string;
  accentColor: string;
}

/**
 * Login Form Props Interface
 * 
 * Props for the login form component.
 */
export interface LoginFormProps {
  onSubmit: (username: string, password: string) => void;
  isSubmitting: boolean;
  infoMessage?: string;
}

/**
 * Register Form Props Interface
 * 
 * Props for the registration form component.
 */
export interface RegisterFormProps {
  onSubmit: (formData: RegisterRequest & { confirmPassword: string; userClass: string; class: string }) => void;
  isSubmitting: boolean;
  error?: string;
}

/**
 * Homi Bhabha Card Props Interface
 * 
 * Props for the Homi Bhabha exam card component.
 */
export interface HomiBhabhaCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonText: string;
  onClick: () => void;
  accentColor: string;
}

/**
 * Stat Box Props Interface
 * 
 * Props for the statistics box component.
 */
export interface StatBoxProps {
  title: string;
  value: number | undefined;
  isLoading: boolean;
}

/**
 * Hook Return Types
 * 
 * Type definitions for custom hook return values.
 */

/**
 * Use Auth Return Interface
 * 
 * Return type for the useAuth hook. Provides authentication state and functions.
 */
export interface UseAuthReturn {
  currentUser: User | null;
  isLoadingAuth: boolean;
  signIn: (username: string, password: string) => Promise<any>;
  signUp: (userData: RegisterRequest) => Promise<any>;
  signOut: () => void;
  updateCurrentUserDetails: (newDetails: Partial<User>) => void;
}

/**
 * Use Dashboard Return Interface
 * 
 * Return type for the useDashboard hook. Provides dashboard data, chart references,
 * and handler functions.
 */
export interface UseDashboardReturn {
  allSubjects: Subject[];
  isLoadingData: boolean;
  error: string | null;
  timeFrequency: 'week' | 'month' | 'year';
  selectedSubject: string;
  processedStats: DashboardStats | null;
  activityChartRef: React.RefObject<HTMLDivElement>;
  topicPerformanceRef: React.RefObject<HTMLDivElement>;
  rollingAverageChartRef: React.RefObject<HTMLDivElement>;
  difficultyBreakdownChartRef: React.RefObject<HTMLDivElement>;
  handleTimeFrequencyChange: (frequency: string) => void;
  handleSubjectChange: (subject: string) => void;
  handleGenerateReport: () => void;
  isGeneratingPdf: boolean;
}

/**
 * Use Subjects Return Interface
 * 
 * Return type for the useSubjects hook. Provides subjects data, filtering,
 * and navigation functions.
 */
export interface UseSubjectsReturn {
  subjects: Subject[];
  isLoading: boolean;
  error: string | null;
  searchTerm: string;
  filteredSubjects: Subject[];
  handleExploreSubject: (subjectKey: string) => void;
  handleSearchTermChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface UseSubjectTopicsReturn {
  subjectKey: string;
  currentSubject: Subject | null;
  isLoading: boolean;
  error: string | null;
  modalOpen: boolean;
  selectedTopicForQuiz: Topic | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedClass: string;
  setSelectedClass: (cls: string) => void;
  selectedGenre: string;
  setSelectedGenre: (genre: string) => void;
  availableClasses: string[];
  availableGenres: string[];
  filteredTopics: Topic[];
  handleOpenQuizModal: (topic: Topic) => void;
  handleCloseQuizModal: () => void;
  handleStartQuizWithSettings: (settings: any) => void;
  handleStudyFlashcards: (topic: Topic) => void;
  createSessionMutation: any;
}

export interface UseQuizReturn {
  questions: Question[];
  userAnswers: Record<string, number>;
  isLoading: boolean;
  error: string | null;
  infoMessage: string | null;
  elapsedTime: number;
  timerActive: boolean;
  isSubmitting: boolean;
  quizContext: {
    subject: string;
    topicName: string;
    difficulty: string;
    timeLimit: number;
    accentColor?: string | undefined;
  };
  handleOptionSelect: (questionId: string, optionIndex: number) => void;
  submitAndNavigate: () => void;
  handleAbandonQuiz: () => void;
}

export interface UseResultsReturn {
  historicalList: QuizResult[];
  detailData: QuizResult | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    subject: string;
    difficulty: string;
    class: string;
    genre: string;
  };
  setFilters: (filters: any) => void;
  sortOrder: 'newest' | 'oldest' | 'score-high' | 'score-low';
  setSortOrder: (order: 'newest' | 'oldest' | 'score-high' | 'score-low') => void;
  availableClasses: string[];
  availableGenres: string[];
  clearFilters: () => void;
}

export interface UseAICenterReturn {
  messages: Array<{
    role: 'user' | 'assistant' | 'model';
    parts: Array<{ text: string }>;
    isError?: boolean;
  }>;
  input: string;
  setInput: (input: string) => void;
  isLoading: boolean;
  error: string | null;
  handleSendMessage: (event: React.FormEvent) => void;
}

export interface UseAccountReturn {
  changeDetailsModalOpen: boolean;
  handleOpenChangeDetailsModal: () => void;
  handleCloseChangeDetailsModal: () => void;
}

export interface UseFlashcardsReturn {
  topicId: string;
  flashcards: Question[];
  currentCardIndex: number;
  isLoading: boolean;
  error: string | null;
  handleNextCard: () => void;
  handlePreviousCard: () => void;
  handleShuffleCards: () => void;
}

export interface UseHomibhabhaReturn {
  pyqModalOpen: boolean;
  practiceTestModalOpen: boolean;
  homiBhabhaAccentColor: string;
  handleOpenPyqModal: () => void;
  handleClosePyqModal: () => void;
  handleStartPyqTest: (settings: any) => void;
  handleOpenPracticeTestModal: () => void;
  handleClosePracticeTestModal: () => void;
  handleStartPracticeTest: (settings: any) => void;
  isCreatingSession: boolean;
}

/**
 * Use Subject Colors Return Interface
 * 
 * Return type for the useSubjectColors hook. Provides subject color map
 * and color retrieval function.
 */
export interface UseSubjectColorsReturn {
  colorMap: Record<string, { dark: string; light: string }>;
  getColor: (subjectKey: string) => string;
}

/**
 * Use Topics Return Interface
 * 
 * Return type for the useTopics hook. Provides topics data and loading state.
 */
export interface UseTopicsReturn {
  topics: Topic[];
  isLoading: boolean;
}

/**
 * Use Notifications Return Interface
 * 
 * Return type for the useNotifications hook. Provides notification queue
 * and management functions.
 */
export interface UseNotificationsReturn {
  notifications: Notification[];
  addNotification: (message: string, severity?: 'success' | 'error' | 'warning' | 'info') => void;
  removeNotification: (id: number) => void;
}

/**
 * Ad-Related Types
 * 
 * Type definitions for advertising integration.
 */

/**
 * Ad Config Interface
 * 
 * Configuration structure for advertising features.
 */
export interface AdConfig {
  enabled: boolean;
  adSenseClientId: string;
  adSlots: {
    topBanner: string;
    bottomBanner: string;
    sidebar: string;
    inline: string;
    quizInterstitial: string;
    resultsPage: string;
  };
}

/**
 * Ad Placement Interface
 * 
 * Structure defining ad placement configuration including position,
 * slot identifier, and format.
 */
export interface AdPlacement {
  position: 'top' | 'bottom' | 'sidebar' | 'inline' | 'quiz' | 'results';
  slot: string;
  format: 'auto' | 'rectangle' | 'vertical' | 'horizontal';
}

/**
 * Global Type Extensions
 * 
 * Extensions to global types for third-party integrations.
 */

/**
 * Window Interface Extension for AdSense
 * 
 * Extends the global Window interface to include Google AdSense properties.
 */
declare global {
  interface Window {
    adsbygoogle: any[]; // AdSense script array for ad initialization
  }
}