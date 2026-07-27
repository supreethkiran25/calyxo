import React, { Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import ErrorBoundary from './components/ErrorBoundary';
import LaunchScreen from './components/LaunchScreen';
import { lazyWithRetry } from './utils/lazyWithRetry';
import { useStore } from './store/useStore';

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
const UserAIPage = lazyWithRetry(() => import('./pages/user/AIPage'));
const UserProfilePage = lazyWithRetry(() => import('./pages/user/ProfilePage'));

// Static Pages
const AboutPage = lazyWithRetry(() => import('./pages/user/StaticPages').then(m => ({ default: m.AboutPage })));
const SupportPage = lazyWithRetry(() => import('./pages/user/StaticPages').then(m => ({ default: m.SupportPage })));
const PrivacyPage = lazyWithRetry(() => import('./pages/user/StaticPages').then(m => ({ default: m.PrivacyPage })));
const TermsPage = lazyWithRetry(() => import('./pages/user/StaticPages').then(m => ({ default: m.TermsPage })));

import { registerServiceWorker, scheduleDailyReminders } from './services/notificationService';

function App() {
  const initializeTheme = useStore(state => state.initializeTheme);

  useEffect(() => {
    initializeTheme();
    registerServiceWorker().then(() => {
      scheduleDailyReminders();
    });
  }, [initializeTheme]);

  return (
    <HelmetProvider>
      <ErrorBoundary>
        <BrowserRouter>
          <Suspense fallback={<LaunchScreen isLoading={true} />}>
            <Routes>
              {/* Root */}
              <Route path="/" element={<HomePage />} />

              {/* User Routes */}
              <Route path="/user" element={<UserLayout />}>
                <Route path="dashboard" element={<UserDashboardPage />} />
                <Route path="nutrition" element={<UserNutritionPage />} />
                <Route path="workout" element={<UserWorkoutPage />} />
                <Route path="progress" element={<UserProgressPage />} />
                <Route path="ai" element={<UserAIPage />} />
                <Route path="profile" element={<UserProfilePage />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="support" element={<SupportPage />} />
                <Route path="privacy" element={<PrivacyPage />} />
                <Route path="terms" element={<TermsPage />} />
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
