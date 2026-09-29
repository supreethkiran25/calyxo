import React, { useState, useEffect } from 'react';
import { UserCheck, Users, Award, Star, Search, Plus, Calendar, Mail, CheckCircle2, ChevronRight } from 'lucide-react';
import { getAdminTrainers } from '../../services/adminService';
import { AdminPageHeader, AdminStatusBadge, AdminLoadingSkeleton } from '../../components/admin/AdminUIPrimitives';

const AdminTrainersView = () => {
  const [trainers, setTrainers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const list = await getAdminTrainers();
        setTrainers(list || []);
      } catch (e) {
        console.warn('Trainers fetch error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchTrainers();
  }, []);

  const filtered = trainers.filter(t => 
    !search || 
    t.name?.toLowerCase().includes(search.toLowerCase()) || 
    t.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Trainer & Coach CRM"
        description="Certified Calyxo coaches, assigned athlete rosters, workout plans, and training session analytics."
        badge={`${trainers.length} Certified Trainers`}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0e121d] border border-white/10 rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#d4ff00]/30 to-transparent" />
          <span className="text-xs font-semibold text-slate-400 block tracking-wide">Total Active Trainers</span>
          <div className="text-2xl font-black text-white mt-1 font-sans">{trainers.length}</div>
          <span className="text-xs text-slate-400 font-semibold mt-1.5 inline-block">Database records</span>
        </div>
        <div className="bg-[#0e121d] border border-white/10 rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
          <span className="text-xs font-semibold text-slate-400 block tracking-wide">Active Client Roster</span>
          <div className="text-2xl font-black text-white mt-1 font-sans">
            {trainers.reduce((sum, t) => sum + (t.active_clients || 0), 0)} athletes
          </div>
          <span className="text-xs text-slate-400 mt-1.5 inline-block">Assigned to certified coaches</span>
        </div>
        <div className="bg-[#0e121d] border border-white/10 rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
          <span className="text-xs font-semibold text-slate-400 block tracking-wide">Average Coach Rating</span>
          <div className="text-2xl font-black text-white mt-1 font-sans flex items-center gap-1.5">
            <span>{trainers.length > 0 ? (trainers.reduce((sum, t) => sum + (t.rating || 0), 0) / trainers.length).toFixed(1) : '0.0'}</span>
            <Star className="w-4 h-4 fill-amber-400 text-amber-400 inline" />
          </div>
          <span className="text-xs text-slate-400 mt-1.5 inline-block">
            {trainers.length > 0 ? `Calculated across ${trainers.length} coaches` : 'No coach reviews logged'}
          </span>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-[#0e121d] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search trainers..."
              className="w-full bg-[#131622] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-lime-400/60"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-6">
            <AdminLoadingSkeleton rows={5} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-[#0b0e17] text-slate-400 font-mono uppercase text-[10px]">
                  <th className="p-4 font-bold">Trainer</th>
                  <th className="p-4 font-bold">Email</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 text-center font-bold">Active Clients</th>
                  <th className="p-4 text-center font-bold">Sessions</th>
                  <th className="p-4 text-center font-bold">Rating</th>
                  <th className="p-4 text-right font-bold">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {filtered.length > 0 ? (
                  filtered.map(t => (
                    <tr key={t.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={t.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name || 'T')}&background=0f172a&color=fff`}
                            alt={t.name}
                            className="w-8 h-8 rounded-full object-cover shrink-0 border border-white/10"
                          />
                          <span className="font-semibold text-white block">{t.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-slate-400 font-mono text-[11px]">{t.email}</td>
                      <td className="p-4">
                        <AdminStatusBadge status={t.status || 'ACTIVE'} />
                      </td>
                      <td className="p-4 text-center font-bold text-white font-mono">{t.active_clients}</td>
                      <td className="p-4 text-center text-slate-300 font-mono">{t.sessions_completed}</td>
                      <td className="p-4 text-center font-semibold text-amber-400 font-mono">★ {t.rating}</td>
                      <td className="p-4 text-right text-slate-400 font-mono text-[11px]">{t.joined}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500 font-sans">
                      No trainers currently registered in database. Calyxo is operating under the strict two-role policy (Super Admin and Athlete Users).
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

export default AdminTrainersView;
