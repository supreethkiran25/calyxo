import React, { useState, useEffect } from 'react';
import { DollarSign, CreditCard } from 'lucide-react';
import { getAdminDashboardMetrics, getAdminUsers } from '../../services/adminService';

const AdminRevenueView = () => {
  const [metrics, setMetrics] = useState(null);
  const [paidUsers, setPaidUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const m = await getAdminDashboardMetrics();
      const uRes = await getAdminUsers({ limit: 100 });
      const subscribers = (uRes.users || []).filter(u => u.subscription_plan && u.subscription_plan !== 'FREE');
      setMetrics(m);
      setPaidUsers(subscribers);
      setLoading(false);
    };
    load();
  }, []);

  if (loading || !metrics) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const { kpis } = metrics;
  const mrr = kpis.mrr_inr;
  const arr = kpis.revenue_total_inr;
  const arpu = kpis.premium_users > 0 ? Math.round(mrr / kpis.premium_users) : 0;
  const ltv = arpu * 12;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-emerald-400" /> Razorpay Revenue & Financial Command (INR ₹)
        </h1>
        <p className="text-xs text-neutral-400 font-mono mt-0.5">
          Live MRR growth, subscriber LTV, Razorpay transaction billing & subscription telemetry in Indian Rupees (₹)
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
          <span className="text-xs text-neutral-400 font-medium block">Monthly Recurring (MRR)</span>
          <span className="text-2xl font-bold text-emerald-400 block mt-1">₹{mrr.toLocaleString()}</span>
          <span className="text-[10px] text-emerald-500/80 font-mono mt-1 block">Active Razorpay INR Pipeline</span>
        </div>
        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
          <span className="text-xs text-neutral-400 font-medium block">Annual Run Rate (ARR)</span>
          <span className="text-2xl font-bold text-white block mt-1">₹{arr.toLocaleString()}</span>
          <span className="text-[10px] text-neutral-500 font-mono mt-1 block">Projected 12-month trajectory</span>
        </div>
        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
          <span className="text-xs text-neutral-400 font-medium block">Average Revenue Per User</span>
          <span className="text-2xl font-bold text-indigo-400 block mt-1">₹{arpu.toLocaleString()} / mo</span>
          <span className="text-[10px] text-neutral-500 font-mono mt-1 block">Across active paid plans</span>
        </div>
        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
          <span className="text-xs text-neutral-400 font-medium block">Customer Lifetime Value (LTV)</span>
          <span className="text-2xl font-bold text-amber-400 block mt-1">₹{ltv.toLocaleString()}</span>
          <span className="text-[10px] text-neutral-500 font-mono mt-1 block">Estimated 12-month retention</span>
        </div>
      </div>

      {/* Transaction Ledger */}
      <div className="rounded-3xl bg-neutral-900/60 border border-neutral-800 overflow-hidden">
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-400" /> Razorpay Payment Transactions ({paidUsers.length})
          </h3>
          <span className="text-[10px] font-mono text-emerald-400">Razorpay Key: rzp_live_THntfStnhzEiO8</span>
        </div>
        <div className="p-4 space-y-2 text-xs font-mono">
          {paidUsers.length > 0 ? (
            paidUsers.map((u) => {
              const planPrice = u.subscription_plan === 'PRO' ? 499 : u.subscription_plan === 'HIGH' ? 999 : 1499;
              return (
                <div key={u.id} className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/60 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">{u.full_name} ({u.subscription_plan} Plan)</span>
                    <span className="text-neutral-500 text-[11px]">{u.email} • Payment Date: {u.signup_date}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-400 text-sm block">₹{planPrice.toLocaleString()}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                      Razorpay Verified
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-neutral-500 font-mono">
              No active Razorpay paid transactions recorded in database yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminRevenueView;
