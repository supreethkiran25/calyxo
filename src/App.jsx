import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import ErrorBoundary from './components/ErrorBoundary';
import LaunchScreen from './components/LaunchScreen';

// Layout — lazy loaded for code splitting
const UserLayout = lazy(() => import('./layouts/UserLayout'));

// Pages — lazy loaded for code splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// User Pages
const UserDashboardPage = lazy(() => import('./pages/user/DashboardPage'));
const UserNutritionPage = lazy(() => import('./pages/user/NutritionPage'));
const UserWorkoutPage = lazy(() => import('./pages/user/WorkoutPage'));
const UserProgressPage = lazy(() => import('./pages/user/ProgressPage'));
const UserHealthHubPage = lazy(() => import('./pages/user/HealthHubPage'));
const UserAIPage = lazy(() => import('./pages/user/AIPage'));
const UserProfilePage = lazy(() => import('./pages/user/ProfilePage'));

// Static Pages
const AboutPage = lazy(() => import('./pages/user/StaticPages').then(m => ({ default: m.AboutPage })));
const SupportPage = lazy(() => import('./pages/user/StaticPages').then(m => ({ default: m.SupportPage })));
const PrivacyPage = lazy(() => import('./pages/user/StaticPages').then(m => ({ default: m.PrivacyPage })));
const TermsPage = lazy(() => import('./pages/user/StaticPages').then(m => ({ default: m.TermsPage })));

function App() {
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
                <Route path="healthhub" element={<UserHealthHubPage />} />
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
