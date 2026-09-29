import React, { useState } from 'react';
import { FileText, Download, CheckCircle2, Calendar, FileSpreadsheet, Activity, Sparkles, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { getAdminUsers, getAdminTransactions, getAdminRecentWorkouts, getAdminRecentMeals } from '../../services/adminService';
import { AdminPageHeader } from '../../components/admin/AdminUIPrimitives';

const AdminReportsView = () => {
  const [downloading, setDownloading] = useState(false);

  const downloadReport = async (type) => {
    setDownloading(true);
    try {
      if (type === 'users') {
        const res = await getAdminUsers({ limit: 1000 });
        let csv = 'ID,Full Name,Email,Joined,Plan,Status\n';
        (res.users || []).forEach(u => {
          csv += `"${u.id}","${u.full_name}","${u.email}","${u.signup_date}","${u.subscription_plan}","${u.status}"\n`;
        });
        downloadBlob(csv, `calyxo_user_roster_report.csv`);
      } else if (type === 'finance') {
        const txs = await getAdminTransactions();
        let csv = 'Payment ID,Customer,Email,Plan,Amount,Currency,Date,Status\n';
        (txs || []).forEach(t => {
          csv += `"${t.payment_id}","${t.customer_name}","${t.customer_email}","${t.plan}",${t.amount},"${t.currency}","${t.purchase_date}","${t.status}"\n`;
        });
        downloadBlob(csv, `calyxo_financial_audit_report.csv`);
      } else if (type === 'activity') {
        const [w, m] = await Promise.all([getAdminRecentWorkouts(100), getAdminRecentMeals(100)]);
        let csv = 'Type,User,Title,Metric,Date\n';
        w.forEach(item => { csv += `"Workout","${item.user_name}","${item.workout_title}","${item.calories} (${item.duration_min})","${item.date}"\n`; });
        m.forEach(item => { csv += `"Meal","${item.user_name}","${item.meal_name}","${item.calories} (${item.macros})","${item.date}"\n`; });
        downloadBlob(csv, `calyxo_activity_telemetry_report.csv`);
      }
      toast.success('Report generated and downloaded successfully.');
    } catch (e) {
      toast.error('Failed to generate report: ' + e.message);
    } finally {
      setDownloading(false);
    }
  };

  const downloadBlob = (csv, filename) => {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Operational Reports & Exports"
        description="Authoritative CSV downloads and compliance datasets for platform usage, financial reconciliation, and subscriber telemetry."
        badge="Data Export Hub"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Report 1: Athlete Roster */}
        <div className="bg-[#0e121d] border border-white/10 rounded-2xl p-6 shadow-xl space-y-5 flex flex-col justify-between relative overflow-hidden group hover:border-lime-400/30 transition-all">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#d4ff00]/20 to-transparent" />
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-lime-400 flex items-center justify-center shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white font-sans">Full Athlete User Directory</h4>
              <p className="text-xs text-slate-400 leading-relaxed mt-1">
                Export all registered athlete UUIDs, custom display names, email addresses, joined dates, and current plan entitlements.
              </p>
            </div>
          </div>
          <button
            onClick={() => downloadReport('users')}
            disabled={downloading}
            className="w-full px-4 py-2.5 bg-[#d4ff00] hover:bg-[#a3e635] text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#d4ff00]/10 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV</span>
          </button>
        </div>

        {/* Report 2: Financial Reconciliation */}
        <div className="bg-[#0e121d] border border-white/10 rounded-2xl p-6 shadow-xl space-y-5 flex flex-col justify-between relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-emerald-400 flex items-center justify-center shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white font-sans">Financial & Payment Audit</h4>
              <p className="text-xs text-slate-400 leading-relaxed mt-1">
                Live Razorpay transactions, settled UPI amounts in INR, customer billing details, captured statuses, and timestamps.
              </p>
            </div>
          </div>
          <button
            onClick={() => downloadReport('finance')}
            disabled={downloading}
            className="w-full px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/10 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV</span>
          </button>
        </div>

        {/* Report 3: Telemetry Stream */}
        <div className="bg-[#0e121d] border border-white/10 rounded-2xl p-6 shadow-xl space-y-5 flex flex-col justify-between relative overflow-hidden group hover:border-cyan-400/30 transition-all">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent" />
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-cyan-400 flex items-center justify-center shadow-xs">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white font-sans">Workout & Meal Activity Logs</h4>
              <p className="text-xs text-slate-400 leading-relaxed mt-1">
                Consolidated health telemetry including completed workout sessions, calories burned, durations, meals logged, and macros.
              </p>
            </div>
          </div>
          <button
            onClick={() => downloadReport('activity')}
            disabled={downloading}
            className="w-full px-4 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-400/10 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminReportsView;
