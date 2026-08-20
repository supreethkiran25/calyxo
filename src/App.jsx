import React, { Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import ErrorBoundary from './components/ErrorBoundary';
import LaunchScreen from './components/LaunchScreen';
import { lazyWithRetry } from './utils/lazyWithRetry';
import { useStore } from './store/useStore';
import AdminGuard from './components/admin/AdminGuard';
import UserGuard from './components/UserGuard';

// Layout — lazy loaded with chunk retry protection
const UserLayout = lazyWithRetry(() => import('./layouts/UserLayout'));

// Pages — lazy loaded for code splitting with chunk retry protection
const HomePage = lazyWithRetry(() => import('./pages/HomePage'));
const NotFoundPage = lazyWithRetry(() => import('./pages/NotFoundPage'));

// User Pages
const UserDashboardPage = lazyWithRetry(() => import('./pages/user/DashboardPage'));
const UserNutritionPage = lazyWithRetry(() => import('./pages/user/NutritionPage'));
const UserWorkoutPage = lazyWithRetry(() => import('./pages/user/WorkoutPage'));
const UserProgressPage = lazyWithRetry(() => import('./pages/user/ProgressPage'));
const UserHealthPage = lazyWithRetry(() => import('./pages/user/HealthPage'));
const UserAIPage = lazyWithRetry(() => import('./pages/user/AIPage'));
const UserProfilePage = lazyWithRetry(() => import('./pages/user/ProfilePage'));

// Static Pages
const AboutPage = lazyWithRetry(() => import('./pages/user/AboutPage'));
const SupportPage = lazyWithRetry(() => import('./pages/user/SupportPage'));
const PrivacyPage = lazyWithRetry(() => import('./pages/user/PrivacyPage'));
const TermsPage = lazyWithRetry(() => import('./pages/user/TermsPage'));

// Admin Pages — lazy loaded for code splitting
const AdminLoginPage = lazyWithRetry(() => import('./pages/admin/AdminLoginPage'));
const AdminLayout = lazyWithRetry(() => import('./pages/admin/AdminLayout'));
const AdminHomeView = lazyWithRetry(() => import('./pages/admin/AdminHomeView'));
const AdminUsersView = lazyWithRetry(() => import('./pages/admin/AdminUsersView'));
const AdminPremiumView = lazyWithRetry(() => import('./pages/admin/AdminPremiumView'));
const AdminAnalyticsView = lazyWithRetry(() => import('./pages/admin/AdminAnalyticsView'));
const AdminWorkoutDbView = lazyWithRetry(() => import('./pages/admin/AdminWorkoutDbView'));
const AdminNutritionDbView = lazyWithRetry(() => import('./pages/admin/AdminNutritionDbView'));
const AdminAIView = lazyWithRetry(() => import('./pages/admin/AdminAIView'));
const AdminNotificationsView = lazyWithRetry(() => import('./pages/admin/AdminNotificationsView'));
const AdminFeedbackView = lazyWithRetry(() => import('./pages/admin/AdminFeedbackView'));
const AdminRevenueView = lazyWithRetry(() => import('./pages/admin/AdminRevenueView'));
const AdminLogsView = lazyWithRetry(() => import('./pages/admin/AdminLogsView'));
const AdminSettingsView = lazyWithRetry(() => import('./pages/admin/AdminSettingsView'));

import { registerServiceWorker, scheduleDailyReminders } from './services/notificationService';
import { PhoneSleepTrackerService } from './services/health/PhoneSleepTrackerService';
import NativeMobileBridge from './components/NativeMobileBridge';
import UniversalLiveHUD from './components/UniversalLiveHUD';

function App() {
  const initializeTheme = useStore(state => state.initializeTheme);

  useEffect(() => {
    initializeTheme();
    PhoneSleepTrackerService.init();
    registerServiceWorker().then(() => {
      scheduleDailyReminders();
    });
  }, [initializeTheme]);

  return (
    <HelmetProvider>
      <ErrorBoundary>
        <BrowserRouter>
          <NativeMobileBridge />
          <UniversalLiveHUD />
          <Suspense fallback={<LaunchScreen isLoading={true} />}>
            <Routes>
              {/* Root */}
              <Route path="/" element={<HomePage />} />

              {/* Admin Login Route */}
              <Route path="/admin/login" element={<AdminLoginPage />} />

              {/* User Routes */}
              <Route path="/user" element={<UserGuard><UserLayout /></UserGuard>}>
                <Route path="dashboard" element={<UserDashboardPage />} />
                <Route path="nutrition" element={<UserNutritionPage />} />
                <Route path="workout" element={<UserWorkoutPage />} />
                <Route path="progress" element={<UserProgressPage />} />
                <Route path="health" element={<UserHealthPage />} />
                <Route path="ai" element={<UserAIPage />} />
                <Route path="profile" element={<UserProfilePage />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="support" element={<SupportPage />} />
                <Route path="privacy" element={<PrivacyPage />} />
                <Route path="terms" element={<TermsPage />} />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
                <Route index element={<AdminHomeView />} />
                <Route path="dashboard" element={<AdminHomeView />} />
                <Route path="users" element={<AdminUsersView />} />
                <Route path="premium" element={<AdminPremiumView />} />
                <Route path="analytics" element={<AdminAnalyticsView />} />
                <Route path="workout-db" element={<AdminWorkoutDbView />} />
                <Route path="nutrition-db" element={<AdminNutritionDbView />} />
                <Route path="ai" element={<AdminAIView />} />
                <Route path="notifications" element={<AdminNotificationsView />} />
                <Route path="feedback" element={<AdminFeedbackView />} />
                <Route path="revenue" element={<AdminRevenueView />} />
                <Route path="logs" element={<AdminLogsView />} />
                <Route path="settings" element={<AdminSettingsView />} />
              </Route>

              <Route path="/app/admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
                <Route index element={<AdminHomeView />} />
                <Route path="dashboard" element={<AdminHomeView />} />
                <Route path="users" element={<AdminUsersView />} />
                <Route path="premium" element={<AdminPremiumView />} />
                <Route path="analytics" element={<AdminAnalyticsView />} />
                <Route path="workout-db" element={<AdminWorkoutDbView />} />
                <Route path="nutrition-db" element={<AdminNutritionDbView />} />
                <Route path="ai" element={<AdminAIView />} />
                <Route path="notifications" element={<AdminNotificationsView />} />
                <Route path="feedback" element={<AdminFeedbackView />} />
                <Route path="revenue" element={<AdminRevenueView />} />
                <Route path="logs" element={<AdminLogsView />} />
                <Route path="settings" element={<AdminSettingsView />} />
              </Route>

              {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ErrorBoundary>
    </HelmetProvider>
  );
}

export default App;
