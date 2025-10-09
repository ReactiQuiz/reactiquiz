w// src/components/AppRoutes.tsx
import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Core Route & Layout Components
import ProtectedRoute from './core/ProtectedRoute';
import AdminRoute from './core/AdminRoute'; // For admin-only access
import MainLayout from './layout/MainLayout';
import MinimalLayout from './layout/MinimalLayout';
import AdminLayout from './layout/AdminLayout'; // The new layout for the admin panel

// Import the animated loader
import AnimatedLoader from './animations/AnimatedLoader';

// Fallback component for lazy loading
const SuspenseFallback = () => (
  <AnimatedLoader message="Loading page..." size="large" />
);

// Lazy-loaded User Pages
const HomePage = React.lazy(() => import('../pages/HomePage'));
const AllSubjectsPage = React.lazy(() => import('../pages/AllSubjectsPage'));
const SubjectTopicsPage = React.lazy(() => import('../pages/SubjectTopicsPage'));
const DashboardPage = React.lazy(() => import('../pages/DashboardPage'));
const AccountPage = React.lazy(() => import('../pages/AccountPage'));
const LoginPage = React.lazy(() => import('../pages/LoginPage'));
const RegisterPage = React.lazy(() => import('../pages/RegisterPage'));
const ResultsPage = React.lazy(() => import('../pages/ResultsPage'));
const QuizPage = React.lazy(() => import('../pages/QuizPage'));
const AICenterPage = React.lazy(() => import('../pages/AICenterPage'));
const HomibhabhaPage = React.lazy(() => import('../pages/HomibhabhaPage'));
const AboutPage = React.lazy(() => import('../pages/AboutPage'));
const NotFoundPage = React.lazy(() => import('../pages/NotFoundPage'));
const QuizLoadingPage = React.lazy(() => import('../pages/QuizLoadingPage'));
const SettingsPage = React.lazy(() => import('../pages/SettingsPage'));
const FlashcardPage = React.lazy(() => import('../pages/FlashcardPage'));
const SubjectivePaperPage = React.lazy(() => import('../pages/SubjectivePaperPage'));
const SubjectiveResultPage = React.lazy(() => import('../pages/SubjectiveResultPage'));

// Lazy-loaded Admin Pages
const GeneralSettingsPage = React.lazy(() => import('../pages/admin/GeneralSettingsPage'));
const UserManagementPage = React.lazy(() => import('../pages/admin/UserManagementPage'));
const ContentManagementPage = React.lazy(() => import('../pages/admin/ContentManagementPage'));

// Helper for passing context to AccountPage
interface AccountPageWithContextProps {
  context?: {
    onOpenChangePasswordModal?: () => void;
  };
}

const AccountPageWithContext: React.FC<AccountPageWithContextProps> = ({ context }) => {
  const onOpen = context?.onOpenChangePasswordModal;
  return <AccountPage onOpenChangePasswordModal={onOpen} />;
};

const AppRoutes: React.FC = () => {
  const { currentUser, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return <SuspenseFallback />;
  }

  return (
    <Suspense fallback={<SuspenseFallback />}>
      <Routes>
        {/* === Main Authenticated Layout === */}
        <Route element={<MainLayout />}>
          {/* --- User-Facing Protected Routes --- */}
          <Route path="/subjects" element={<ProtectedRoute><AllSubjectsPage /></ProtectedRoute>} />
          <Route path="/subjects/:subjectKey" element={<ProtectedRoute><SubjectTopicsPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/account" element={<ProtectedRoute><AccountPageWithContext /></ProtectedRoute>} />
          <Route path="/results" element={<ProtectedRoute><ResultsPage /></ProtectedRoute>} />
          <Route path="/results/:resultId" element={<ProtectedRoute><ResultsPage /></ProtectedRoute>} />
          <Route path="/subjective-result/:resultId" element={<ProtectedRoute><SubjectiveResultPage /></ProtectedRoute>} />
          <Route path="/ai-center" element={<ProtectedRoute><AICenterPage /></ProtectedRoute>} />
          <Route path="/quiz/loading" element={<ProtectedRoute><QuizLoadingPage /></ProtectedRoute>} />
          <Route path="/quiz/:quizId" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/flashcards/:topicId" element={<ProtectedRoute><FlashcardPage /></ProtectedRoute>} />
          <Route path="/subjective-paper/:topicId" element={<ProtectedRoute><SubjectivePaperPage /></ProtectedRoute>} />
          <Route path="/homibhabha" element={<ProtectedRoute><HomibhabhaPage /></ProtectedRoute>} />
          <Route path="/about" element={currentUser ? <AboutPage /> : <Navigate to="/about-guest" />} />

          {/*
              This block defines the admin section.
              1. The parent route `/admin` is protected by `AdminRoute`, which verifies the user's ID.
              2. It uses the `AdminLayout`, which renders the admin-specific sidebar.
              3. Child routes define the individual pages within the admin panel.
            */}
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route path="general" element={<GeneralSettingsPage />} />
            <Route path="content" element={<ContentManagementPage />} /> {/* New Route */}
            <Route path="users" element={<UserManagementPage />} />
            <Route index element={<Navigate to="general" replace />} />
          </Route>

        </Route>

        {/* === Minimal Layout for Guests === */}
        <Route element={<MinimalLayout />}>
          <Route path="/about-guest" element={<AboutPage />} />
        </Route>

        {/* === Standalone Auth Pages === */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* === Root and Catch-All Routes === */}
        <Route path="/" element={currentUser ? <Navigate to="/dashboard" /> : <HomePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
