import React, { useState, useEffect } from 'react';
import { IndianRupee, TrendingUp, CreditCard, Download, Search, RefreshCw, ArrowUpRight } from 'lucide-react';
import { getAdminDashboardMetrics, getAdminTransactions } from '../../services/adminService';
import {
  AdminPageHeader,
  AdminStatCard,
  AdminStatusBadge,
  AdminSearchInput,
  AdminEmptyState,
  AdminLoadingSkeleton
} from '../../components/admin/AdminUIPrimitives';

const AdminRevenueView = () => {
  const [metrics, setMetrics] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [m, txs] = await Promise.all([
        getAdminDashboardMetrics('30D'),
        getAdminTransactions()
      ]);
      setMetrics(m);
      setTransactions(txs || []);
    } catch (e) {
      console.warn('Revenue load error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const filteredTx = transactions.filter(t => 
    !search ||
    (t.customer_name && t.customer_name.toLowerCase().includes(search.toLowerCase())) ||
    (t.customer_email && t.customer_email.toLowerCase().includes(search.toLowerCase())) ||
    (t.payment_id && t.payment_id.toLowerCase().includes(search.toLowerCase()))
  );

  const exportCSV = () => {
    let csv = 'Payment ID,Customer,Email,Plan,Amount,Currency,Status,Provider,Date\n';
    filteredTx.forEach(tx => {
      csv += `"${tx.payment_id}","${tx.customer_name}","${tx.customer_email}","${tx.plan}",${tx.amount},"${tx.currency}","${tx.status}","${tx.payment_provider}","${tx.purchase_date}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `calyxo_revenue_ledger_${Date.now()}.csv`;
    a.click();
  };

  if (loading || !metrics) {
    return <AdminLoadingSkeleton rows={6} />;
  }

  const { kpis } = metrics;
  const totalGrossRevenue = transactions.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <AdminPageHeader
        title="Revenue & Financial Operations"
        description="Captured payments, monthly recurring run-rates (MRR), annualized projection, and financial ledger."
        badge={`₹${totalGrossRevenue.toLocaleString('en-IN')} Total`}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-xl bg-[#0e121d] border border-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer shadow-sm disabled:opacity-50"
              title="Refresh Ledger"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={exportCSV}
              className="px-3.5 py-1.5 rounded-xl bg-[#141724] hover:bg-[#1a1f30] text-slate-200 text-xs font-semibold border border-white/10 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Export Ledger</span>
            </button>
          </div>
        }
      />

      {/* 2. Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <AdminStatCard
          title="Total Captured Revenue"
          value={`₹${totalGrossRevenue.toLocaleString('en-IN')}`}
          icon={IndianRupee}
          trend={`${transactions.length} Orders`}
          trendLabel="gross transactions"
        />
        <AdminStatCard
          title="Monthly Recurring (MRR)"
          value={`₹${(kpis.mrr_inr ?? 0).toLocaleString('en-IN')}`}
          icon={CreditCard}
          trend={`${kpis.subscriptions ?? 0} Active`}
          trendLabel="active High accounts"
        />
        <AdminStatCard
          title="Annualized Run Rate (ARR)"
          value={`₹${((kpis.mrr_inr ?? 0) * 12).toLocaleString('en-IN')}`}
          icon={TrendingUp}
          trend="Projected"
          trendLabel="annualized run rate"
        />
      </div>

      {/* 3. Filter Bar */}
      <div className="p-4 bg-[#0e121d] border border-white/10 rounded-2xl shadow-xl flex items-center justify-between">
        <AdminSearchInput
          value={search}
          onChange={setSearch}
          placeholder="Filter by payment ID, email, or customer..."
          onClear={() => setSearch('')}
        />
      </div>

      {/* 4. Transactions Table */}
      <div className="bg-[#0e121d] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        {filteredTx.length === 0 ? (
          <AdminEmptyState
            title="No transactions found"
            description="Try searching with a different payment ID or customer email."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-[#07090e] text-slate-400 font-semibold tracking-wider text-[11px] uppercase">
                  <th className="p-4">Payment ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Plan</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Provider</th>
                  <th className="p-4 text-right">Settlement Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {filteredTx.map((tx, idx) => (
                  <tr key={tx.payment_id || idx} className="hover:bg-[#141828]/50 transition-colors">
                    <td className="p-4 font-mono text-xs font-semibold text-slate-300">
                      {tx.payment_id}
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-white block">{tx.customer_name}</span>
                      <span className="text-[11px] text-slate-400 font-sans">{tx.customer_email}</span>
                    </td>
                    <td className="p-4">
                      <AdminStatusBadge status={tx.plan === 'HIGH' ? 'High Plan' : (tx.plan || 'High Plan')} />
                    </td>
                    <td className="p-4 font-bold text-[#d4ff00] font-sans">
                      ₹{Number(tx.amount).toLocaleString('en-IN')} {tx.currency || 'INR'}
                    </td>
                    <td className="p-4">
                      <AdminStatusBadge status={tx.status} />
                    </td>
                    <td className="p-4 text-slate-300 font-medium">
                      {tx.payment_provider || 'Razorpay Gateway'}
                    </td>
                    <td className="p-4 text-right text-slate-400 font-mono text-[11px]">
                      {tx.purchase_date}
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

export default AdminRevenueView;
