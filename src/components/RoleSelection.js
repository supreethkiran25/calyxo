import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Users, ArrowRight, Activity, ShieldCheck } from 'lucide-react';

export default function RoleSelection({ user, onRoleSelected, isMockMode }) {
  const [loadingRole, setLoadingRole] = useState(null);

  const handleSelectRole = async (role) => {
    setLoadingRole(role);
    try {
      await onRoleSelected(role);
    } catch (err) {
      console.error("Role selection failed", err);
      setLoadingRole(null);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-acid-green/10 blur-[120px] rounded-full" />
        <div className="absolute top-[60%] -right-[10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 text-center mb-12 max-w-lg"
      >
        <h1 className="text-3xl md:text-5xl font-black text-foreground mb-4 tracking-tight">
          How will you use Calyxo?
        </h1>
        <p className="text-muted text-sm md:text-base">
          Welcome to Calyxo, <span className="font-bold text-foreground">{user?.displayName?.split(' ')[0] || user?.email?.split('@')[0]}</span>. Please select your account type below. This will configure your dashboard experience.
        </p>
      </motion.div>

      <div className="z-10 grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        
        {/* USER CARD */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="group relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-acid-green/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl blur-xl" />
          <div className="relative h-full bg-card-bg border border-card-border hover:border-acid-green/50 rounded-3xl p-8 flex flex-col transition-all duration-300">
            <div className="w-16 h-16 rounded-2xl bg-acid-green/10 text-acid-green flex items-center justify-center mb-6">
              <Activity className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-foreground mb-4">Continue as User</h2>
            <p className="text-muted flex-1 mb-8">
              Track workouts, nutrition, health progress, AI coaching, and personal fitness. The ultimate health OS for your personal journey.
            </p>
            <button
              onClick={() => handleSelectRole('user')}
              disabled={loadingRole !== null}
              className="w-full btn-primary py-4 rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-2"
            >
              {loadingRole === 'user' ? 'Configuring...' : 'Select User'}
              {loadingRole !== 'user' && <ArrowRight className="w-5 h-5" />}
            </button>
          </div>
        </motion.div>

        {/* TRAINER CARD */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="group relative"
        >
          <div className="absolute inset-0 bg-gradient-to-bl from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl blur-xl" />
          <div className="relative h-full bg-card-bg border border-card-border hover:border-blue-500/50 rounded-3xl p-8 flex flex-col transition-all duration-300">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-6">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-foreground mb-4">Continue as Trainer</h2>
            <p className="text-muted flex-1 mb-8">
              Manage clients, create workout plans, assign nutrition programs, monitor client progress, and communicate professionally.
            </p>
            <button
              onClick={() => handleSelectRole('trainer')}
              disabled={loadingRole !== null}
              className="w-full bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 py-4 rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {loadingRole === 'trainer' ? 'Configuring...' : 'Select Trainer'}
              {loadingRole !== 'trainer' && <ArrowRight className="w-5 h-5" />}
            </button>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
