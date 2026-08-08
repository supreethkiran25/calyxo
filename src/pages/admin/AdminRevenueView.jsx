import React, { useState, useEffect } from 'react';
import { DollarSign, Download, ArrowUpRight, CheckCircle2, CreditCard, Search, Calendar } from 'lucide-react';
import { LIVE_RAZORPAY_TRANSACTIONS, CALYXO_PRIMARY_PLAN, getAdminDashboardMetrics } from '../../services/adminService';
import { AdminStatCard, AdminStatusBadge, AdminLoadingSkeleton } from '../../components/admin/AdminUIPrimitives';

const AdminRevenueView = () => {
  const [metrics, setMetrics] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const m = await getAdminDashboardMetrics();
        setMetrics(m);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadMetrics();
  }, []);

  const totalGrossRevenue = LIVE_RAZORPAY_TRANSACTIONS.reduce((sum, tx) => sum + tx.amount, 0);

  const filteredTx = LIVE_RAZORPAY_TRANSACTIONS.filter(tx => 
    !search || tx.payment_id.toLowerCase().includes(search.toLowerCase()) || tx.customer_name.toLowerCase().includes(search.toLowerCase()) || tx.customer_email.toLowerCase().includes(search.toLowerCase())
  );

  const exportCSV = () => {
    let csv = 'Payment ID,Customer Name,Customer Email,Plan,Amount (INR),Currency,Status,Date\n';
    LIVE_RAZORPAY_TRANSACTIONS.forEach(tx => {
      csv += `"${tx.payment_id}","${tx.customer_name}","${tx.customer_email}","${tx.plan}","${tx.amount}","${tx.currency}","${tx.status}","${tx.purchase_date}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calyxo_revenue_ledger_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
  };

  if (loading || !metrics) {
    return <AdminLoadingSkeleton rows={5} />;
  }

  const { kpis } = metrics;

  return (
    <div className="space-y-6">
      {/* Header Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-800/80">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Financial Revenue & Transaction Ledger</h2>
          <p className="text-xs text-neutral-400 font-mono mt-0.5">
            Razorpay payment audit stream and subscription financial metrics
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold border border-neutral-800 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export Financial Ledger</span>
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <AdminStatCard
          title="Total Verified Revenue"
          value={`₹${totalGrossRevenue.toLocaleString()}`}
          icon={DollarSign}
          change="Razorpay Live"
          changeType="positive"
          subtitle="Gross captured transactions"
        />
        <AdminStatCard
          title="Monthly Recurring Revenue (MRR)"
          value={`₹${kpis.mrr_inr.toLocaleString()}`}
          icon={CreditCard}
          subtitle="Current active high plan subscribers"
        />
        <AdminStatCard
          title="Annualized Run Rate (ARR)"
          value={`₹${(kpis.mrr_inr * 12).toLocaleString()}`}
          icon={ArrowUpRight}
          subtitle="Projected annualized ARR"
        />
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-neutral-900/90 border border-neutral-800/80 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search payment ID, email, or customer name..."
            className="w-full pl-10 pr-4 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 font-mono"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-neutral-900/90 border border-neutral-800/80 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-950/60 text-neutral-400 font-mono uppercase text-[10px]">
                <th className="p-3.5">Payment ID</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Plan</th>
                <th className="p-3.5">Amount</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Provider</th>
                <th className="p-3.5 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 font-sans">
              {filteredTx.map(tx => (
                <tr key={tx.payment_id} className="hover:bg-neutral-800/50 transition-colors">
                  <td className="p-3.5 font-mono text-xs font-bold text-blue-400">
                    {tx.payment_id}
                  </td>
                  <td className="p-3.5">
                    <div>
                      <span className="font-bold text-white block">{tx.customer_name}</span>
                      <span className="text-[10px] text-neutral-400 font-mono">{tx.customer_email}</span>
                    </div>
                  </td>
                  <td className="p-3.5 font-mono font-bold text-amber-300">
                    {tx.plan}
                  </td>
                  <td className="p-3.5 font-mono font-bold text-white">
                    ₹{tx.amount.toLocaleString()} {tx.currency}
                  </td>
                  <td className="p-3.5">
                    <AdminStatusBadge status={tx.status} />
                  </td>
                  <td className="p-3.5 font-mono text-[11px] text-neutral-400">
                    {tx.payment_provider || 'Razorpay Gateway'}
                  </td>
                  <td className="p-3.5 text-right font-mono text-[11px] text-neutral-400">
                    {tx.purchase_date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminRevenueView;
