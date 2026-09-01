import React, { useState, useEffect, useCallback } from 'react';
import { DollarSign, Download, ArrowUpRight, CreditCard, RefreshCw } from 'lucide-react';
import { getAdminTransactions, getAdminDashboardMetrics } from '../../services/adminService';
import {
  AdminPageHeader,
  AdminStatCard,
  AdminStatusBadge,
  AdminLoadingSkeleton,
  AdminEmptyState,
  AdminSearchInput
} from '../../components/admin/AdminUIPrimitives';
import { useAdminRealtime } from '../../hooks/useAdminRealtime';

const AdminRevenueView = () => {
  const [metrics, setMetrics] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [m, txs] = await Promise.all([
        getAdminDashboardMetrics(),
        getAdminTransactions()
      ]);
      setMetrics(m);
      setTransactions(txs || []);
    } catch (e) {
      console.error('[AdminRevenueView] Error loading data:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Real-time updates
  useAdminRealtime(['subscriptions', 'admin_audit_logs', 'user_profiles'], () => {
    loadData();
  });

  const totalGrossRevenue = transactions.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  const filteredTx = transactions.filter(tx => 
    !search || 
    (tx.payment_id && tx.payment_id.toLowerCase().includes(search.toLowerCase())) || 
    (tx.customer_name && tx.customer_name.toLowerCase().includes(search.toLowerCase())) || 
    (tx.customer_email && tx.customer_email.toLowerCase().includes(search.toLowerCase()))
  );

  const exportCSV = () => {
    let csv = 'Payment ID,Customer Name,Customer Email,Plan,Amount (INR),Currency,Status,Provider,Date\n';
    transactions.forEach(tx => {
      csv += `"${tx.payment_id}","${tx.customer_name}","${tx.customer_email}","${tx.plan}","${tx.amount}","${tx.currency}","${tx.status}","${tx.payment_provider || 'Razorpay Gateway'}","${tx.purchase_date}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calyxo_revenue_ledger_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading || !metrics) {
    return <AdminLoadingSkeleton rows={5} />;
  }

  const { kpis } = metrics;

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <AdminPageHeader
        title="Revenue"
        description="Captured payments, monthly recurring run-rates, and financial audit ledger"
        badge={`₹${totalGrossRevenue.toLocaleString()} Total`}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition-colors cursor-pointer"
              title="Refresh Ledger"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={exportCSV}
              className="px-3.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs font-semibold border border-neutral-800 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Ledger</span>
            </button>
          </div>
        }
      />

      {/* 2. Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <AdminStatCard
          title="Total Captured Revenue"
          value={`₹${totalGrossRevenue.toLocaleString()}`}
          icon={DollarSign}
          subtitle="Gross transactions"
        />
        <AdminStatCard
          title="Monthly Recurring (MRR)"
          value={`₹${(kpis.mrr_inr || 0).toLocaleString()}`}
          icon={CreditCard}
          subtitle="Active High Plan accounts"
        />
        <AdminStatCard
          title="Annualized Run Rate (ARR)"
          value={`₹${((kpis.mrr_inr || 0) * 12).toLocaleString()}`}
          icon={ArrowUpRight}
          subtitle="Annualized projection"
        />
      </div>

      {/* 3. Filter Bar */}
      <div className="p-3 bg-neutral-900/90 border border-neutral-800/80 rounded-xl flex items-center justify-between">
        <AdminSearchInput
          value={search}
          onChange={setSearch}
          placeholder="Filter by payment ID, email, or customer..."
          onClear={() => setSearch('')}
        />
      </div>

      {/* 4. Transactions Table */}
      <div className="bg-neutral-900/90 border border-neutral-800/80 rounded-xl overflow-hidden">
        {filteredTx.length === 0 ? (
          <AdminEmptyState
            title="No transactions found"
            description="Try searching with a different payment ID or customer email."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 bg-neutral-950/60 text-neutral-400 font-mono uppercase text-[10px]">
                  <th className="p-3.5 font-bold">Payment ID</th>
                  <th className="p-3.5 font-bold">Customer</th>
                  <th className="p-3.5 font-bold">Plan</th>
                  <th className="p-3.5 font-bold">Amount</th>
                  <th className="p-3.5 font-bold">Status</th>
                  <th className="p-3.5 font-bold">Provider</th>
                  <th className="p-3.5 text-right font-bold">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-sans">
                {filteredTx.map((tx, idx) => (
                  <tr key={tx.payment_id || idx} className="hover:bg-neutral-800/40 transition-colors">
                    <td className="p-3.5 font-mono text-xs font-semibold text-neutral-300">
                      {tx.payment_id}
                    </td>
                    <td className="p-3.5">
                      <div>
                        <span className="font-semibold text-white block">{tx.customer_name}</span>
                        <span className="text-[10px] text-neutral-400 font-mono">{tx.customer_email}</span>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono font-semibold text-amber-400">
                      {tx.plan}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-white">
                      ₹{Number(tx.amount).toLocaleString()} {tx.currency || 'INR'}
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
        )}
      </div>
    </div>
  );
};

export default AdminRevenueView;

