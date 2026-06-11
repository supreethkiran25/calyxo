import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Apple, Dumbbell, Sparkles, LogOut, User, Activity } from 'lucide-react';
import { subscribeToAuth, signOutUser, getFoodLogs, getWorkoutLogs, getUserProfile } from './dbService';
import LaunchScreen from './components/LaunchScreen';
import AuthFlow from './components/AuthFlow';
import Dashboard from './components/Dashboard';
import FoodTracker from './components/FoodTracker';
import WorkoutLogger from './components/WorkoutLogger';
import AICoach from './components/AICoach';

function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Shared States (synchronized on tab switch or user login)
  const [foodLogs, setFoodLogs] = useState([]);
  const [workoutLogs, setWorkoutLogs] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  
  // Toast notifications
  const [toast, setToast] = useState(null);

  const showNotification = (msg) => {
    setToast(msg);
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Auth State Listener
  useEffect(() => {
    const unsubscribe = subscribeToAuth((currentUser) => {
      setUser(currentUser);
      
      // Simulate splash loader sequence for premium startup feel
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    });

    return () => unsubscribe();
  }, []);

  // Fetch / Sync data whenever the user or active tab changes
  useEffect(() => {
    if (!user) return;
    
    const syncUserData = async () => {
      try {
        const uid = user.uid;
        
        // Fetch User Profile
        const profile = await getUserProfile(uid);
        setUserProfile(profile);

        // Fetch Food Logs
        const foods = await getFoodLogs(uid);
        setFoodLogs(foods || []);

        // Fetch Workout Logs
        const workouts = await getWorkoutLogs(uid);
        setWorkoutLogs(workouts || []);
      } catch (err) {
        console.error("Error synchronizing active user data", err);
      }
    };

    syncUserData();
  }, [user, activeTab]);

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to sign out of Calyxo?")) {
      await signOutUser();
      setUser(null);
      setActiveTab('dashboard');
      showNotification("Signed out successfully.");
    }
  };

  // Immediate PWA splash screen
  if (loading) {
    return <LaunchScreen isLoading={loading} />;
  }

  // Auth Guard
  if (!user) {
    return <AuthFlow onAuthSuccess={(usr) => {
      setUser(usr);
      showNotification("Authorized successfully!");
    }} />;
  }

  // Biometrics parameters for FoodTracker
  const units = userProfile?.units || 'metric';
  const weightVal = userProfile?.weight || 70;
  const heightVal = userProfile?.height || 175;
  const gender = userProfile?.gender || 'male';
  const age = userProfile?.age || 25;
  const activityVal = userProfile?.activity || 1.55;
  const goal = userProfile?.goal || 'lose';

  // Estimate BMI
  const isImperial = units === 'imperial';
  const weightKg = isImperial ? weightVal / 2.20462 : weightVal;
  const heightCm = isImperial ? heightVal * 2.54 : heightVal;
  const heightMeters = heightCm / 100;
  const bmi = heightMeters > 0 ? Number((weightKg / (heightMeters * heightMeters)).toFixed(1)) : 22.0;

  return (
    <div className="min-h-screen bg-black text-gray-200 flex flex-col font-sans select-none relative pb-20 md:pb-0 md:pl-64">
      {/* Background glow surfaces */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-neon-green/5 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-green/3 rounded-full blur-[120px] pointer-events-none z-0"></div>

      {/* Toast Notification Container */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-dark-carbon border border-neon-green/30 text-white text-xs font-bold px-6 py-3.5 rounded-full shadow-[0_0_20px_rgba(57,255,20,0.3)] z-50 flex items-center gap-2 select-none animate-[slideDown_0.2s_ease-out_forwards]">
          <span className="w-1.5 h-1.5 bg-neon-green rounded-full shadow-[0_0_6px_#39ff14] animate-ping"></span>
          {toast}
        </div>
      )}

      {/* Layout Header */}
      <header className="border-b border-white/5 bg-black/60 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between z-10 md:py-5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-neon-green/10 border border-neon-green/30 flex items-center justify-center">
            <Activity className="w-4 h-4 text-neon-green animate-pulse" />
          </div>
          <h1 className="font-display text-xl font-extrabold tracking-widest text-white uppercase select-none">
            Calyxo
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 bg-white/5 px-3.5 py-1.5 rounded-full border border-white/5">
            <User className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-[10.5px] font-semibold text-gray-400 tracking-wide max-w-[120px] truncate">{user.email}</span>
          </div>

          <button 
            onClick={handleLogout}
            className="p-2.5 rounded-full bg-white/5 border border-white/5 text-gray-400 hover:text-red-400 cursor-pointer transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 px-4 py-6 md:px-8 max-w-4xl w-full mx-auto relative z-10 overflow-y-auto">
        {activeTab === 'dashboard' && (
          <Dashboard 
            userId={user.uid} 
            foodLogs={foodLogs} 
            onNotification={showNotification} 
          />
        )}
        {activeTab === 'food' && (
          <FoodTracker 
            userId={user.uid}
            userBmi={bmi}
            userGoal={goal}
            foodLogs={foodLogs}
            setFoodLogs={setFoodLogs}
            onNotification={showNotification}
          />
        )}
        {activeTab === 'workout' && (
          <WorkoutLogger 
            userId={user.uid} 
            onNotification={showNotification} 
          />
        )}
        {activeTab === 'coach' && (
          <AICoach 
            userId={user.uid} 
            foodLogs={foodLogs} 
            workoutLogs={workoutLogs} 
          />
        )}
      </main>

      {/* Navigation (Responsive Mobile-First Bottom Nav / Desktop Sidebar) */}
      
      {/* Mobile Bottom Navbar */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-dark-carbon/90 backdrop-blur-lg border-t border-white/5 px-6 py-3.5 flex justify-around items-center z-40">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1.5 cursor-pointer transition-all ${activeTab === 'dashboard' ? 'text-neon-green scale-110 drop-shadow-[0_0_6px_rgba(57,255,20,0.4)]' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-wider">Metrics</span>
        </button>

        <button 
          onClick={() => setActiveTab('food')}
          className={`flex flex-col items-center gap-1.5 cursor-pointer transition-all ${activeTab === 'food' ? 'text-neon-green scale-110 drop-shadow-[0_0_6px_rgba(57,255,20,0.4)]' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <Apple className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-wider">Nutrition</span>
        </button>

        <button 
          onClick={() => setActiveTab('workout')}
          className={`flex flex-col items-center gap-1.5 cursor-pointer transition-all ${activeTab === 'workout' ? 'text-neon-green scale-110 drop-shadow-[0_0_6px_rgba(57,255,20,0.4)]' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <Dumbbell className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-wider">Workout</span>
        </button>

        <button 
          onClick={() => setActiveTab('coach')}
          className={`flex flex-col items-center gap-1.5 cursor-pointer transition-all ${activeTab === 'coach' ? 'text-neon-green scale-110 drop-shadow-[0_0_6px_rgba(57,255,20,0.4)]' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-wider">AI Coach</span>
        </button>
      </nav>

      {/* Desktop Sidebar (Rendered on md screen and above) */}
      <nav className="hidden md:flex fixed top-0 left-0 h-screen w-64 bg-dark-carbon border-r border-white/5 py-8 px-6 flex-col z-35">
        <div className="flex items-center gap-2.5 mb-10 px-2">
          <div className="w-8 h-8 rounded-full bg-neon-green/10 border border-neon-green/30 flex items-center justify-center">
            <Activity className="w-4.5 h-4.5 text-neon-green animate-pulse" />
          </div>
          <h1 className="font-display text-2xl font-black tracking-widest text-white uppercase select-none">
            Calyxo
          </h1>
        </div>

        <div className="flex-1 space-y-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-all ${activeTab === 'dashboard' ? 'bg-neon-green text-black shadow-[0_0_15px_rgba(57,255,20,0.3)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <LayoutDashboard className="w-4.5 h-4.5" />
            Metrics Dashboard
          </button>

          <button 
            onClick={() => setActiveTab('food')}
            className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-all ${activeTab === 'food' ? 'bg-neon-green text-black shadow-[0_0_15px_rgba(57,255,20,0.3)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <Apple className="w-4.5 h-4.5" />
            Nutrition Tracker
          </button>

          <button 
            onClick={() => setActiveTab('workout')}
            className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-all ${activeTab === 'workout' ? 'bg-neon-green text-black shadow-[0_0_15px_rgba(57,255,20,0.3)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <Dumbbell className="w-4.5 h-4.5" />
            Workout Planner
          </button>

          <button 
            onClick={() => setActiveTab('coach')}
            className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-all ${activeTab === 'coach' ? 'bg-neon-green text-black shadow-[0_0_15px_rgba(57,255,20,0.3)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <Sparkles className="w-4.5 h-4.5" />
            Calyxo AI Coach
          </button>
        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col space-y-4">
          <div className="flex items-center gap-2.5 px-2">
            <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-gray-400">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-bold text-white truncate">{user.email}</span>
              <span className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider">Active Account</span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 bg-red-950/20 border border-red-500/10 hover:border-red-500/30 text-red-400 text-xs font-bold uppercase rounded-xl cursor-pointer transition-all active:scale-98"
          >
            <LogOut className="w-3.5 h-3.5" />
            Log Out
          </button>
        </div>
      </nav>

      <style>{`
        @keyframes slideDown {
          0% { transform: translate(-50%, -20px); opacity: 0; }
          100% { transform: translate(-50%, 0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default App;
