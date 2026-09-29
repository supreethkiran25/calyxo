import React, { useState, useEffect } from 'react';
import { UserPlus, Target, Crown, Bell, Mail, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { getAdminUsers } from '../../services/adminService';
import { AdminPageHeader, AdminStatusBadge, AdminLoadingSkeleton } from '../../components/admin/AdminUIPrimitives';

const AdminLeadsView = () => {
  const [leads, setLeads] = useState([]);
  const [totalAthletes, setTotalAthletes] = useState(0);
  const [conversionRate, setConversionRate] = useState('0.0%');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const res = await getAdminUsers({ limit: 1000 });
        const allUsers = res.users || [];
        const freeOrTrial = allUsers.filter(u => u.subscription_plan === 'FREE' || !u.subscription_plan);
        const paidCount = allUsers.length - freeOrTrial.length;
        const rate = allUsers.length > 0 ? ((paidCount / allUsers.length) * 100).toFixed(1) + '%' : '0.0%';
        setTotalAthletes(allUsers.length);
        setConversionRate(rate);
        setLeads(freeOrTrial);
      } catch (e) {
        console.warn('Error fetching leads:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchLeads();
  }, []);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Leads & Prospects CRM"
        description="Free tier registered athletes, trial accounts, conversion readiness scoring, and targeted upgrade outreach."
        badge={`${leads.length} Unconverted Prospects`}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0e121d] border border-white/10 rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#d4ff00]/30 to-transparent" />
          <span className="text-xs font-semibold text-slate-400 block tracking-wide">Total Pipeline Prospects</span>
          <div className="text-2xl font-black text-white mt-1 font-sans">{leads.length}</div>
          <span className="text-xs text-slate-400 mt-1.5 inline-block">Registered platform users on Free Tier</span>
        </div>
        <div className="bg-[#0e121d] border border-white/10 rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent" />
          <span className="text-xs font-semibold text-slate-400 block tracking-wide">Potential Annual Expansion</span>
          <div className="text-2xl font-black text-emerald-400 mt-1 font-sans">₹{(leads.length * 199).toLocaleString()}</div>
          <span className="text-xs text-slate-400 mt-1.5 inline-block">At High Annual pass pricing (₹199/yr)</span>
        </div>
        <div className="bg-[#0e121d] border border-white/10 rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
          <span className="text-xs font-semibold text-slate-400 block tracking-wide">Platform Paid Conversion</span>
          <div className="text-2xl font-black text-cyan-400 mt-1 font-sans">{conversionRate}</div>
          <span className="text-xs text-slate-400 mt-1.5 inline-block">{totalAthletes - leads.length} of {totalAthletes} registered members upgraded</span>
        </div>
      </div>

      {/* Leads Table Container */}
      <div className="bg-[#0e121d] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h4 className="text-sm font-bold text-white tracking-tight">Prospect Roster</h4>
        </div>

        {loading ? (
          <div className="p-6">
            <AdminLoadingSkeleton rows={5} />
          </div>
        ) : leads.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs font-sans">
            All registered platform users have already converted to High Plan passes!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-[#0b0e17] text-slate-400 font-mono uppercase text-[10px]">
                  <th className="p-4 font-bold">Athlete Lead</th>
                  <th className="p-4 font-bold">Email</th>
                  <th className="p-4 font-bold">Registered</th>
                  <th className="p-4 font-bold">Current Plan</th>
                  <th className="p-4 text-center font-bold">Engagement Status</th>
                  <th className="p-4 text-right font-bold">Outreach Target</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {leads.map((l) => (
                  <tr key={l.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="p-4">
                      <span className="font-semibold text-white block">{l.full_name || 'Athlete'}</span>
                    </td>
                    <td className="p-4 text-slate-400 font-mono text-[11px]">{l.email}</td>
                    <td className="p-4 text-slate-400 font-mono text-[11px]">{l.signup_date}</td>
                    <td className="p-4">
                      <AdminStatusBadge status="FREE" />
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full font-mono font-semibold text-[10px] border ${
                        l.is_regular_active
                          ? 'bg-emerald-400/15 text-emerald-300 border-emerald-400/30'
                          : 'bg-slate-800 text-slate-400 border-white/10'
                      }`}>
                        {l.is_regular_active ? 'Active Regularly' : (l.activeness || 'Dormant')}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="text-xs font-bold text-lime-400 font-mono">High Plan (12 Mo)</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLeadsView;
