import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import ErrorBoundary from './components/ErrorBoundary';
import LaunchScreen from './components/LaunchScreen';

// Layouts
import UserLayout from './layouts/UserLayout';
import TrainerLayout from './layouts/TrainerLayout';

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
const UserTrainerPage = lazy(() => import('./pages/user/TrainerPage'));

// Static Pages
import { AboutPage, SupportPage, PrivacyPage, TermsPage } from './pages/user/StaticPages';

// Trainer Pages
const TrainerDashboardPage = lazy(() => import('./pages/trainer/DashboardPage'));
const TrainerAnalyticsPage = lazy(() => import('./pages/trainer/AnalyticsPage'));
const TrainerClientsPage = lazy(() => import('./pages/trainer/ClientsPage'));
const TrainerClientDetailPage = lazy(() => import('./pages/trainer/ClientDetailPage'));
const TrainerMessagesPage = lazy(() => import('./pages/trainer/MessagesPage'));
const TrainerWorkoutsPage = lazy(() => import('./pages/trainer/WorkoutsPage'));
const TrainerWorkoutBuilderPage = lazy(() => import('./pages/trainer/WorkoutBuilderPage'));
const TrainerNutritionPage = lazy(() => import('./pages/trainer/NutritionPage'));
const TrainerNutritionPlannerPage = lazy(() => import('./pages/trainer/NutritionPlannerPage'));
const TrainerCalendarPage = lazy(() => import('./pages/trainer/CalendarPage'));
const TrainerTasksPage = lazy(() => import('./pages/trainer/TasksPage'));
const TrainerReportsPage = lazy(() => import('./pages/trainer/ReportsPage'));
const TrainerDocumentsPage = lazy(() => import('./pages/trainer/DocumentsPage'));
const TrainerSettingsPage = lazy(() => import('./pages/trainer/SettingsPage'));
const TrainerAIReportsPage = lazy(() => import('./pages/trainer/AIReportsPage'));

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
                <Route path="trainer" element={<UserTrainerPage />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="support" element={<SupportPage />} />
                <Route path="privacy" element={<PrivacyPage />} />
                <Route path="terms" element={<TermsPage />} />
              </Route>

              {/* Trainer Routes */}
              <Route path="/trainer" element={<TrainerLayout />}>
                <Route path="dashboard" element={<TrainerDashboardPage />} />
                <Route path="analytics" element={<TrainerAnalyticsPage />} />
                <Route path="clients" element={<TrainerClientsPage />} />
                <Route path="clients/:id" element={<TrainerClientDetailPage />} />
                <Route path="messages" element={<TrainerMessagesPage />} />
                <Route path="workouts" element={<TrainerWorkoutsPage />} />
                <Route path="workout-builder" element={<TrainerWorkoutBuilderPage />} />
                <Route path="nutrition" element={<TrainerNutritionPage />} />
                <Route path="nutrition-planner" element={<TrainerNutritionPlannerPage />} />
                <Route path="calendar" element={<TrainerCalendarPage />} />
                <Route path="tasks" element={<TrainerTasksPage />} />
                <Route path="reports" element={<TrainerReportsPage />} />
                <Route path="ai-reports" element={<TrainerAIReportsPage />} />
                <Route path="documents" element={<TrainerDocumentsPage />} />
                <Route path="settings" element={<TrainerSettingsPage />} />
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
