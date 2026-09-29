import React, { useState, useEffect } from 'react';
import { TrendingUp, Flame, Award, Heart, Activity } from 'lucide-react';
import { getAdminDashboardMetrics, getAdminUsers } from '../../services/adminService';
import { AdminPageHeader, AdminLoadingSkeleton } from '../../components/admin/AdminUIPrimitives';

const AdminProgressView = () => {
  const [metrics, setMetrics] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [m, uRes] = await Promise.all([
          getAdminDashboardMetrics('30D'),
          getAdminUsers({ limit: 1000 })
        ]);
        setMetrics(m);
        setUsers(uRes.users || []);
      } catch (e) {
        console.warn('Progress view error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <AdminLoadingSkeleton rows={5} />;
  }

  const kpis = metrics?.kpis || {};
  const totalUsers = users.length || 1;
  const streaks = users.map(u => Number(u.streak) || 0);
  const avgStreak = users.length > 0 ? (streaks.reduce((s, x) => s + x, 0) / users.length).toFixed(1) : '0';
  const activeWeeklyStreaks = streaks.filter(s => s >= 7).length;
  const totalCaloriesBurned = kpis.calories_logged_total || 0;
  const activeAthletes = kpis.active_users || 0;

  // Calculate real goal breakdown
  const goalCounts = {
    hypertrophy: 0,
    fatLoss: 0,
    endurance: 0,
    general: 0
  };

  users.forEach(u => {
    const g = String(u.goal || '').toLowerCase();
    if (g.includes('gain') || g.includes('hypertrophy') || g.includes('muscle')) {
      goalCounts.hypertrophy += 1;
    } else if (g.includes('lose') || g.includes('fat') || g.includes('weight')) {
      goalCounts.fatLoss += 1;
    } else if (g.includes('endurance') || g.includes('cardio') || g.includes('stamina')) {
      goalCounts.endurance += 1;
    } else {
      goalCounts.general += 1;
    }
  });

  const goalBreakdown = [
    { goal: 'Hypertrophy & Muscle Gain', count: goalCounts.hypertrophy, color: 'bg-[#d4ff00]', textColor: 'text-[#d4ff00]' },
    { goal: 'Fat Loss & Body Recomposition', count: goalCounts.fatLoss, color: 'bg-emerald-400', textColor: 'text-emerald-400' },
    { goal: 'Cardiovascular Endurance', count: goalCounts.endurance, color: 'bg-cyan-400', textColor: 'text-cyan-400' },
    { goal: 'General Fitness & Maintenance', count: goalCounts.general, color: 'bg-purple-400', textColor: 'text-purple-400' }
  ].map(item => ({
    ...item,
    pct: users.length > 0 ? Math.round((item.count / users.length) * 100) : 0
  }));

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Athlete Progress & Biometrics CRM"
        description="Platform-wide fitness transformation benchmarks, daily streak consistency, body weight tracking, and achievement distribution."
        badge={`${users.length} Enrolled Athletes`}
      />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-[#0e121d] border border-white/10 rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#d4ff00]/30 to-transparent" />
          <span className="text-xs font-semibold text-slate-400 block tracking-wide">Avg Platform Streak</span>
          <div className="text-2xl font-black text-white mt-1 font-sans">{avgStreak} Days</div>
          <span className="text-xs text-slate-400 font-medium mt-1.5 inline-block">Realtime user biometrics</span>
        </div>
        <div className="bg-[#0e121d] border border-white/10 rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
          <span className="text-xs font-semibold text-slate-400 block tracking-wide">Consistent Streaks (≥7d)</span>
          <div className="text-2xl font-black text-amber-400 mt-1 font-sans">{activeWeeklyStreaks} athletes</div>
          <span className="text-xs text-slate-400 mt-1.5 inline-block">Habit consistency tracking</span>
        </div>
        <div className="bg-[#0e121d] border border-white/10 rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
          <span className="text-xs font-semibold text-slate-400 block tracking-wide">Total Calories Tracked</span>
          <div className="text-2xl font-black text-white mt-1 font-sans">
            {totalCaloriesBurned >= 1000 ? `${(totalCaloriesBurned / 1000).toFixed(1)}k kcal` : `${totalCaloriesBurned} kcal`}
          </div>
          <span className="text-xs text-slate-400 mt-1.5 inline-block">Summed from real food logs</span>
        </div>
        <div className="bg-[#0e121d] border border-white/10 rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-lime-400/30 to-transparent" />
          <span className="text-xs font-semibold text-slate-400 block tracking-wide">Active Athletes (≤7d)</span>
          <div className="text-2xl font-black text-lime-400 mt-1 font-sans">
            {users.length > 0 ? `${Math.round((activeAthletes / users.length) * 100)}%` : '0%'}
          </div>
          <span className="text-xs text-slate-400 mt-1.5 inline-block">{activeAthletes} regular active athletes</span>
        </div>
      </div>

      <div className="bg-[#0e121d] border border-white/10 rounded-2xl p-6 shadow-xl space-y-5 relative overflow-hidden">
        <div className="border-b border-white/5 pb-3">
          <h4 className="text-sm font-bold text-white font-sans">Biometric Goal Distribution</h4>
          <p className="text-xs text-slate-400 mt-0.5">Real athlete training goals recorded in database</p>
        </div>
        <div className="space-y-4">
          {goalBreakdown.map(g => (
            <div key={g.goal} className="space-y-2 text-xs">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-300">{g.goal} ({g.count} athletes)</span>
                <span className={`font-mono font-bold ${g.textColor}`}>{g.pct}%</span>
              </div>
              <div className="h-2.5 w-full bg-[#131622] rounded-full overflow-hidden border border-white/5">
                <div className={`h-full ${g.color} rounded-full transition-all duration-500`} style={{ width: `${g.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminProgressView;
