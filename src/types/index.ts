// Core data types for ReactiQuiz

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

export interface Subject {
  id: string;
  name: string;
  subjectKey: string;
  description?: string;
  accentColorDark: string;
  accentColorLight: string;
  icon?: string;
}

export interface Topic {
  id: string;
  name: string;
  subject_id: string;
  class: string;
  genre: string;
  description?: string;
  questionCount?: number;
}

export interface Question {
  id: string;
  question_text: string;
  text?: string; // For backward compatibility
  options: Array<{
    id: string;
    text: string;
  }> | string[]; // Support both formats
  correct_answer: number;
  correctOptionId?: string; // For backward compatibility
  explanation?: string;
  difficulty: 1 | 2 | 3;
  marks: number;
  topicId: string;
  createdAt?: string;
}

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
}

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
  percentage: number;
  timeSpent: number;
  createdAt: string;
  userAnswers: Record<string, number>;
  questions: Question[];
}

export interface SubjectiveQuestion {
  id: string;
  question_text: string;
  marks: number;
  topicId: string;
  difficulty: 1 | 2 | 3;
}

export interface SubjectiveResult {
  id: string;
  userId: string;
  topicId: string;
  topicName: string;
  answers: Array<{
    questionId: string;
    userAnswer: string | null;
    score?: number;
    feedback?: string;
  }>;
  totalScore?: number;
  totalMarks?: number;
  percentage?: number;
  createdAt: string;
  gradedAt?: string;
}

// API Response types
export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  address: string;
  phone: string | undefined;
  class: string | undefined;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Dashboard and Analytics types
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

// Theme types
export interface ThemeMode {
  themeMode: 'light' | 'dark';
  toggleTheme: () => void;
}

// Notification types
export interface Notification {
  id: number;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

// Component prop types
export interface DashboardEmptyStateProps {
  currentUser: User;
  timeFrequency: 'week' | 'month' | 'year';
  onTimeFrequencyChange: (frequency: string) => void;
  allSubjects: Subject[];
  selectedSubject: string;
  onSubjectChange: (subject: string) => void;
}

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

export interface SubjectBreadcrumbProps {
  subjectDisplayName: string;
  accentColor: string;
}

export interface LoginFormProps {
  onSubmit: (username: string, password: string) => void;
  isSubmitting: boolean;
  infoMessage?: string;
}

export interface RegisterFormProps {
  onSubmit: (formData: RegisterRequest & { confirmPassword: string; userClass: string; class: string }) => void;
  isSubmitting: boolean;
  error?: string;
}

export interface HomiBhabhaCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonText: string;
  onClick: () => void;
  accentColor: string;
}

export interface StatBoxProps {
  title: string;
  value: number | undefined;
  isLoading: boolean;
}

// Hook return types
export interface UseAuthReturn {
  currentUser: User | null;
  isLoadingAuth: boolean;
  signIn: (username: string, password: string) => Promise<any>;
  signUp: (userData: RegisterRequest) => Promise<any>;
  signOut: () => void;
  updateCurrentUserDetails: (newDetails: Partial<User>) => void;
}

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
  pdfModalOpen: boolean;
  selectedTopicForPdf: Topic | null;
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
  handleOpenPdfModal: (topic: Topic) => void;
  handleClosePdfModal: () => void;
  createSessionMutation: any;
  handleStartTheoryPaper: (topic: Topic) => void;
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

export interface UseSubjectColorsReturn {
  colorMap: Record<string, { dark: string; light: string }>;
  getColor: (subjectKey: string) => string;
}

export interface UseTopicsReturn {
  topics: Topic[];
  isLoading: boolean;
}

export interface UseNotificationsReturn {
  notifications: Notification[];
  addNotification: (message: string, severity?: 'success' | 'error' | 'warning' | 'info') => void;
  removeNotification: (id: number) => void;
}
