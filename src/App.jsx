import React, { Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import ErrorBoundary from './components/ErrorBoundary';
import PageErrorBoundary from './components/PageErrorBoundary';
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

// Website Dedicated Pages
const EcosystemPage = lazyWithRetry(() => import('./pages/website/EcosystemPage'));
const ExperiencePage = lazyWithRetry(() => import('./pages/website/ExperiencePage'));
const PhilosophyPage = lazyWithRetry(() => import('./pages/website/PhilosophyPage'));
const VisionPage = lazyWithRetry(() => import('./pages/website/VisionPage'));
const WebPrivacyPage = lazyWithRetry(() => import('./pages/website/WebPrivacyPage'));
const WebTermsPage = lazyWithRetry(() => import('./pages/website/WebTermsPage'));
const AppHeroLanding = lazyWithRetry(() => import('./components/AppHeroLanding'));

// User Pages
const UserDashboardPage = lazyWithRetry(() => import('./pages/user/DashboardPage'));
const UserNutritionPage = lazyWithRetry(() => import('./pages/user/NutritionPage'));
const UserWorkoutPage = lazyWithRetry(() => import('./pages/user/WorkoutPage'));
const UserProgressPage = lazyWithRetry(() => import('./pages/user/ProgressPage'));
const UserChallengesPage = lazyWithRetry(() => import('./pages/user/ChallengesPage'));
const UserHealthPage = lazyWithRetry(() => import('./pages/user/HealthPage'));
const UserAIPage = lazyWithRetry(() => import('./pages/user/AIPage'));
const UserProfilePage = lazyWithRetry(() => import('./pages/user/ProfilePage'));

// Static Pages
const AboutPage = lazyWithRetry(() => import('./pages/user/AboutPage'));
const SupportPage = lazyWithRetry(() => import('./pages/user/SupportPage'));
const PrivacyPage = lazyWithRetry(() => import('./pages/user/PrivacyPage'));
const TermsPage = lazyWithRetry(() => import('./pages/user/TermsPage'));
const AccessibilityPage = lazyWithRetry(() => import('./pages/user/AccessibilityPage'));

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
              {/* Root & Dedicated Website Pages */}
              <Route path="/" element={<HomePage />} />
              <Route path="/ecosystem" element={<EcosystemPage />} />
              <Route path="/experience" element={<ExperiencePage />} />
              <Route path="/philosophy" element={<PhilosophyPage />} />
              <Route path="/vision" element={<VisionPage />} />
              <Route path="/privacy" element={<WebPrivacyPage />} />
              <Route path="/terms" element={<WebTermsPage />} />
              <Route path="/accessibility" element={<AccessibilityPage />} />
              <Route path="/app" element={<AppHeroLanding />} />
              <Route path="/welcome" element={<AppHeroLanding />} />

              {/* Admin Login Route */}
              <Route path="/admin/login" element={<AdminLoginPage />} />

              {/* User Routes — PageErrorBoundary per-route so one page crash stays isolated */}
              <Route path="/user" element={<UserGuard><UserLayout /></UserGuard>}>
                <Route path="dashboard" element={<PageErrorBoundary><UserDashboardPage /></PageErrorBoundary>} />
                <Route path="nutrition" element={<PageErrorBoundary><UserNutritionPage /></PageErrorBoundary>} />
                <Route path="workout" element={<PageErrorBoundary><UserWorkoutPage /></PageErrorBoundary>} />
                <Route path="progress" element={<PageErrorBoundary><UserProgressPage /></PageErrorBoundary>} />
                <Route path="challenges" element={<PageErrorBoundary><UserChallengesPage /></PageErrorBoundary>} />
                <Route path="health" element={<PageErrorBoundary><UserHealthPage /></PageErrorBoundary>} />
                <Route path="ai" element={<PageErrorBoundary><UserAIPage /></PageErrorBoundary>} />
                <Route path="profile" element={<PageErrorBoundary><UserProfilePage /></PageErrorBoundary>} />
                <Route path="about" element={<PageErrorBoundary><AboutPage /></PageErrorBoundary>} />
                <Route path="support" element={<PageErrorBoundary><SupportPage /></PageErrorBoundary>} />
                <Route path="privacy" element={<PageErrorBoundary><PrivacyPage /></PageErrorBoundary>} />
                <Route path="terms" element={<PageErrorBoundary><TermsPage /></PageErrorBoundary>} />
                <Route path="accessibility" element={<PageErrorBoundary><AccessibilityPage /></PageErrorBoundary>} />
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
