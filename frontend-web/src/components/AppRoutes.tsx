// src/components/AppRoutes.tsx
/**
 * App Routes Component
 * 
 * This component defines all application routes using React Router.
 * It includes route protection, lazy loading, and different layouts for
 * authenticated users, guests, and admin users.
 */
import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Core Route & Layout Components
import ProtectedRoute from './core/ProtectedRoute'; // Route protection for authenticated users
import AdminRoute from './core/AdminRoute'; // Route protection for admin-only access
import MainLayout from './layout/MainLayout'; // Main layout for authenticated users
import MinimalLayout from './layout/MinimalLayout'; // Minimal layout for guest pages
import AdminLayout from './layout/AdminLayout'; // Admin-specific layout with sidebar

// Import the animated loader
import AnimatedLoader from './animations/AnimatedLoader';

/**
 * Suspense Fallback Component
 * 
 * Fallback component displayed while lazy-loaded pages are loading.
 * Shows an animated loader with a loading message.
 * 
 * @returns {JSX.Element} Animated loader component
 */
const SuspenseFallback = () => (
  <AnimatedLoader message="Loading page..." size="large" />
);

/**
 * Lazy-loaded User Pages
 * 
 * All user-facing pages are lazy-loaded to improve initial bundle size
 * and loading performance. Pages are only loaded when needed.
 */
// Public pages
const HomePage = React.lazy(() => import('../pages/HomePage')); // Landing page
const AboutPage = React.lazy(() => import('../pages/AboutPage')); // About page
const ContactPage = React.lazy(() => import('../pages/ContactPage')); // Contact page
const PrivacyPolicyPage = React.lazy(() => import('../pages/PrivacyPolicyPage')); // Privacy policy
const TermsOfServicePage = React.lazy(() => import('../pages/TermsOfServicePage')); // Terms of service

// Authentication pages
const LoginPage = React.lazy(() => import('../pages/LoginPage')); // Login page
const RegisterPage = React.lazy(() => import('../pages/RegisterPage')); // Registration page

// Protected user pages (require authentication)
const AllSubjectsPage = React.lazy(() => import('../pages/AllSubjectsPage')); // Subjects listing
const SubjectTopicsPage = React.lazy(() => import('../pages/SubjectTopicsPage')); // Topics for a subject
const DashboardPage = React.lazy(() => import('../pages/DashboardPage')); // User dashboard
const AccountPage = React.lazy(() => import('../pages/AccountPage')); // User account page
const ResultsPage = React.lazy(() => import('../pages/ResultsPage')); // Quiz results page
const QuizPage = React.lazy(() => import('../pages/QuizPage')); // Quiz taking page
const QuizLoadingPage = React.lazy(() => import('../pages/QuizLoadingPage')); // Quiz loading page
const AICenterPage = React.lazy(() => import('../pages/AICenterPage')); // AI assistant page
const HomibhabhaPage = React.lazy(() => import('../pages/HomibhabhaPage')); // Homi Bhabha exam page
const SettingsPage = React.lazy(() => import('../pages/SettingsPage')); // User settings page
const FlashcardPage = React.lazy(() => import('../pages/FlashcardPage')); // Flashcard study page
const NotFoundPage = React.lazy(() => import('../pages/NotFoundPage')); // 404 error page

/**
 * Lazy-loaded Admin Pages
 * 
 * Admin pages are also lazy-loaded and protected by AdminRoute.
 */
const GeneralSettingsPage = React.lazy(() => import('../pages/admin/GeneralSettingsPage')); // General admin settings
const UserManagementPage = React.lazy(() => import('../pages/admin/UserManagementPage')); // User management
const ContentManagementPage = React.lazy(() => import('../pages/admin/ContentManagementPage')); // Content management

/**
 * AccountPageWithContextProps Interface
 * 
 * Props for the AccountPageWithContext wrapper component.
 * Allows passing context from MainLayout to AccountPage.
 */
interface AccountPageWithContextProps {
  context?: {
    onOpenChangePasswordModal?: () => void; // Callback to open change password modal
  };
}

/**
 * Account Page With Context Component
 * 
 * Wrapper component that passes context from MainLayout to AccountPage.
 * This allows AccountPage to trigger the change password modal from
 * the MainLayout's account menu.
 * 
 * @param {AccountPageWithContextProps} props - Component props
 * @returns {JSX.Element} AccountPage component with context props
 */
const AccountPageWithContext: React.FC<AccountPageWithContextProps> = ({ context }) => {
  // Extract the callback function from context
  const onOpen = context?.onOpenChangePasswordModal;
  // Render AccountPage with the callback prop
  return <AccountPage onOpenChangePasswordModal={onOpen} />;
};

/**
 * App Routes Component
 * 
 * Main routing component that defines all application routes. Routes are
 * organized into three main sections:
 * 1. Main Layout: Protected routes for authenticated users
 * 2. Minimal Layout: Public routes for guests
 * 3. Standalone: Authentication pages without layout
 * 
 * Uses React Suspense for lazy loading and displays a loading fallback
 * while pages are being loaded. Routes are protected using ProtectedRoute
 * and AdminRoute components.
 * 
 * @returns {JSX.Element} Routes component with all application routes
 */
const AppRoutes: React.FC = () => {
  // Get authentication state
  const { currentUser, isLoadingAuth } = useAuth();

  // Show loading fallback while checking authentication
  if (isLoadingAuth) {
    return <SuspenseFallback />;
  }

  return (
    <Suspense fallback={<SuspenseFallback />}>
      <Routes>
        {/* === Main Authenticated Layout ===
            Routes within this layout use MainLayout which includes Navbar and Footer.
            All routes are protected and require authentication. */}
        <Route element={<MainLayout />}>
          {/* --- User-Facing Protected Routes ---
              These routes require authentication and are accessible to all logged-in users. */}
          <Route path="/subjects" element={<ProtectedRoute><AllSubjectsPage /></ProtectedRoute>} />
          <Route path="/subjects/:subjectKey" element={<ProtectedRoute><SubjectTopicsPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/account" element={<ProtectedRoute><AccountPageWithContext /></ProtectedRoute>} />
          <Route path="/results" element={<ProtectedRoute><ResultsPage /></ProtectedRoute>} />
          <Route path="/results/:resultId" element={<ProtectedRoute><ResultsPage /></ProtectedRoute>} />
          <Route path="/ai-center" element={<ProtectedRoute><AICenterPage /></ProtectedRoute>} />
          <Route path="/quiz/loading" element={<ProtectedRoute><QuizLoadingPage /></ProtectedRoute>} />
          <Route path="/quiz/:quizId" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/flashcards/:topicId" element={<ProtectedRoute><FlashcardPage /></ProtectedRoute>} />
          <Route path="/homibhabha" element={<ProtectedRoute><HomibhabhaPage /></ProtectedRoute>} />
          {/* About page accessible to authenticated users, redirects guests to /about-guest */}
          <Route path="/about" element={currentUser ? <AboutPage /> : <Navigate to="/about-guest" />} />

          {/* === Admin Section ===
              This block defines the admin section routes.
              1. The parent route `/admin` is protected by `AdminRoute`, which verifies the user is an admin.
              2. It uses the `AdminLayout`, which renders the admin-specific sidebar.
              3. Child routes define the individual pages within the admin panel.
              4. The index route redirects to "general" settings. */}
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route path="general" element={<GeneralSettingsPage />} /> {/* General admin settings */}
            <Route path="content" element={<ContentManagementPage />} /> {/* Content management (subjects, topics, questions) */}
            <Route path="users" element={<UserManagementPage />} /> {/* User management */}
            <Route index element={<Navigate to="general" replace />} /> {/* Default redirect to general */}
          </Route>

        </Route>

        {/* === Minimal Layout for Guests ===
            Routes within this layout use MinimalLayout (no navbar/footer).
            These are public pages accessible without authentication. */}
        <Route element={<MinimalLayout />}>
          <Route path="/about-guest" element={<AboutPage />} /> {/* About page for non-authenticated users */}
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} /> {/* Privacy policy page */}
          <Route path="/terms-of-service" element={<TermsOfServicePage />} /> {/* Terms of service page */}
          <Route path="/contact" element={<ContactPage />} /> {/* Contact page */}
        </Route>

        {/* === Standalone Auth Pages ===
            Authentication pages rendered without any layout wrapper.
            These pages have their own styling and layout. */}
        <Route path="/login" element={<LoginPage />} /> {/* Login page */}
        <Route path="/register" element={<RegisterPage />} /> {/* Registration page */}

        {/* === Root and Catch-All Routes === */}
        {/* Root route: Redirects authenticated users to dashboard, shows home page for guests */}
        <Route path="/" element={currentUser ? <Navigate to="/dashboard" /> : <HomePage />} />
        {/* Catch-all route: Shows 404 page for any unmatched routes */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
