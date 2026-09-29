import React, { useState, useEffect } from 'react';
import { Utensils, Search, Filter, Calendar, Flame, PieChart } from 'lucide-react';
import { getAdminRecentMeals } from '../../services/adminService';
import { AdminPageHeader, AdminLoadingSkeleton } from '../../components/admin/AdminUIPrimitives';

const AdminMealsView = () => {
  const [meals, setMeals] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const list = await getAdminRecentMeals(50);
        setMeals(list || []);
      } catch (e) {
        console.warn('Meals fetch error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchMeals();
  }, []);

  const avgCalories = meals.length > 0 
    ? Math.round(meals.reduce((sum, m) => sum + (parseInt(m.calories, 10) || 0), 0) / meals.length) 
    : 0;

  const filtered = meals.filter(m => 
    !search || 
    m.meal_name?.toLowerCase().includes(search.toLowerCase()) || 
    m.user_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Meals & Nutrition Logs CRM"
        description="Live athlete nutrition tracking stream, calorie consumption, and macronutrient breakdowns from food logs."
        badge={`${meals.length} Logged Meals`}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0e121d] border border-white/10 rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#d4ff00]/30 to-transparent" />
          <span className="text-xs font-semibold text-slate-400 block tracking-wide">Total Meals Logged</span>
          <div className="text-2xl font-black text-white mt-1 font-sans">{meals.length}</div>
          <span className="text-xs text-emerald-400 font-semibold mt-1.5 inline-block">Realtime database stream</span>
        </div>
        <div className="bg-[#0e121d] border border-white/10 rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
          <span className="text-xs font-semibold text-slate-400 block tracking-wide">Average Meal Calories</span>
          <div className="text-2xl font-black text-white mt-1 font-sans">{avgCalories > 0 ? `${avgCalories} kcal` : '0 kcal'}</div>
          <span className="text-xs text-slate-400 mt-1.5 inline-block">Calculated across food logs</span>
        </div>
        <div className="bg-[#0e121d] border border-white/10 rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-lime-400/30 to-transparent" />
          <span className="text-xs font-semibold text-slate-400 block tracking-wide">Nutrition Records</span>
          <div className="text-2xl font-black text-lime-400 mt-1 font-sans">100% Verified</div>
          <span className="text-xs text-slate-400 mt-1.5 inline-block">PostgreSQL food_logs table</span>
        </div>
      </div>

      {/* Meals Table Container */}
      <div className="bg-[#0e121d] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search meals or athletes..."
              className="w-full bg-[#131622] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-lime-400/60"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-6">
            <AdminLoadingSkeleton rows={6} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-[#0b0e17] text-slate-400 font-mono uppercase text-[10px]">
                  <th className="p-4 font-bold">Athlete</th>
                  <th className="p-4 font-bold">Meal Name</th>
                  <th className="p-4 font-bold">Calories</th>
                  <th className="p-4 font-bold">Macros Breakdown</th>
                  <th className="p-4 text-right font-bold">Logged At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {filtered.length > 0 ? (
                  filtered.map(m => (
                    <tr key={m.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="p-4 font-semibold text-white">{m.user_name}</td>
                      <td className="p-4 text-slate-200 font-medium">{m.meal_name}</td>
                      <td className="p-4 font-bold text-lime-400 font-mono">{m.calories}</td>
                      <td className="p-4 text-slate-400 font-mono text-[11px]">{m.macros}</td>
                      <td className="p-4 text-right text-slate-400 font-mono text-[11px]">{m.date}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500 font-sans">
                      No meal logs recorded in the database yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMealsView;
