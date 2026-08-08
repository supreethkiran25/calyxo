import React from 'react';
import { AlertTriangle, ArrowUpRight, ArrowDownRight, RefreshCw, Inbox } from 'lucide-react';

/**
 * Enterprise KPI Stat Card
 */
export const AdminStatCard = ({ title, value, change, changeType = 'positive', icon: Icon, subtitle, loading }) => {
  if (loading) {
    return (
      <div className="bg-neutral-900/90 border border-neutral-800/80 rounded-xl p-5 space-y-3 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-3 bg-neutral-800 rounded w-24" />
          <div className="w-8 h-8 bg-neutral-800 rounded-lg" />
        </div>
        <div className="h-8 bg-neutral-800 rounded w-32" />
        <div className="h-3 bg-neutral-800/60 rounded w-20" />
      </div>
    );
  }

  return (
    <div className="bg-neutral-900/90 border border-neutral-800/80 rounded-xl p-5 space-y-2 hover:border-neutral-700/80 transition-colors group">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-medium">
          {title}
        </span>
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-center text-neutral-400 group-hover:text-white transition-colors">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between pt-1">
        <span className="text-2xl font-bold tracking-tight text-white font-mono">{value}</span>
        {change && (
          <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${
            changeType === 'positive' 
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
          }`}>
            {changeType === 'positive' ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
            {change}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="text-[11px] text-neutral-500 font-mono tracking-wide pt-0.5">{subtitle}</p>
      )}
    </div>
  );
};

/**
 * Status Badge Primitive
 */
export const AdminStatusBadge = ({ status, variant = 'default' }) => {
  const getStyle = () => {
    const s = String(status || '').toUpperCase();
    if (s === 'ACTIVE' || s === 'HIGH' || s === 'SUCCESS' || s === 'CAPTURED') {
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
    if (s === 'FREE' || s === 'DEFAULT' || s === 'PENDING') {
      return 'bg-neutral-800 text-neutral-400 border-neutral-700';
    }
    if (s === 'EXPIRED' || s === 'SUSPENDED' || s === 'FAILED' || s === 'REVOKED') {
      return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    }
    if (s === 'SUPER_ADMIN' || s === 'ADMIN') {
      return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    }
    return 'bg-neutral-800 text-neutral-300 border-neutral-700';
  };

  return (
    <span className={`inline-flex items-center text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-md border tracking-wider uppercase ${getStyle()}`}>
      {status || 'UNKNOWN'}
    </span>
  );
};

/**
 * Date Range Selector Component
 */
export const AdminDateRangePicker = ({ selectedRange, onSelectRange }) => {
  const ranges = [
    { label: '7D', value: '7D' },
    { label: '30D', value: '30D' },
    { label: '90D', value: '90D' },
    { label: 'YTD', value: 'YTD' },
    { label: 'ALL', value: 'ALL' }
  ];

  return (
    <div className="inline-flex items-center p-1 rounded-lg bg-neutral-950 border border-neutral-800">
      {ranges.map(r => (
        <button
          key={r.value}
          type="button"
          onClick={() => onSelectRange(r.value)}
          className={`px-2.5 py-1 text-xs font-mono font-medium rounded-md transition-colors border cursor-pointer ${
            selectedRange === r.value
              ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
              : 'text-neutral-400 hover:text-white border-transparent bg-transparent'
          }`}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
};

/**
 * Loading Skeleton
 */
export const AdminLoadingSkeleton = ({ rows = 5 }) => (
  <div className="w-full space-y-3 p-4 bg-neutral-900/50 border border-neutral-800/80 rounded-xl">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center justify-between gap-4 animate-pulse">
        <div className="w-10 h-10 bg-neutral-800 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 bg-neutral-800 rounded w-1/3" />
          <div className="h-3 bg-neutral-800/60 rounded w-1/2" />
        </div>
        <div className="w-20 h-6 bg-neutral-800 rounded-md shrink-0" />
      </div>
    ))}
  </div>
);

/**
 * Empty State Primitives
 */
export const AdminEmptyState = ({ title = 'No data found', description = 'Try adjusting your filters or date range.', icon: Icon = Inbox, actionLabel, onAction }) => (
  <div className="py-12 px-6 text-center space-y-3 bg-neutral-950/40 border border-neutral-800/60 rounded-xl max-w-md mx-auto my-6">
    <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto text-neutral-500">
      <Icon className="w-6 h-6" />
    </div>
    <h4 className="text-sm font-semibold text-white tracking-tight">{title}</h4>
    <p className="text-xs text-neutral-400 leading-relaxed font-mono">{description}</p>
    {actionLabel && onAction && (
      <button
        onClick={onAction}
        className="mt-2 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer border border-neutral-700"
      >
        {actionLabel}
      </button>
    )}
  </div>
);

/**
 * Error State Primitive
 */
export const AdminErrorState = ({ message = 'Failed to load authoritative data.', onRetry }) => (
  <div className="p-6 text-center space-y-3 bg-rose-950/20 border border-rose-900/40 rounded-xl max-w-md mx-auto my-6">
    <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
    <h4 className="text-sm font-semibold text-rose-200">{message}</h4>
    {onRetry && (
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-900/50 hover:bg-rose-900/80 text-rose-100 text-xs font-semibold rounded-lg transition-colors cursor-pointer border border-rose-700/50"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        Retry Request
      </button>
    )}
  </div>
);
