import React from 'react';
import { AlertTriangle, ArrowUpRight, ArrowDownRight, RefreshCw, Inbox, Search, X } from 'lucide-react';

/**
 * Clean Operational Page Header
 */
export const AdminPageHeader = ({ title, description, badge, actions, children }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800/80">
    <div className="space-y-1">
      <div className="flex items-center gap-2.5">
        <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">{title}</h1>
        {badge && (
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
            {badge}
          </span>
        )}
      </div>
      {description && (
        <p className="text-xs text-neutral-400 font-mono tracking-tight leading-relaxed max-w-3xl">
          {description}
        </p>
      )}
    </div>
    {(actions || children) && (
      <div className="flex items-center gap-2.5 shrink-0">
        {actions}
        {children}
      </div>
    )}
  </div>
);

/**
 * Enterprise Operational KPI Stat Card
 */
export const AdminStatCard = ({ title, value, change, changeType = 'positive', icon: Icon, subtitle, loading }) => {
  if (loading) {
    return (
      <div className="bg-neutral-900/90 border border-neutral-800/80 rounded-xl p-5 space-y-3 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-3 bg-neutral-800 rounded w-24" />
          <div className="w-8 h-8 bg-neutral-800 rounded-lg" />
        </div>
        <div className="h-7 bg-neutral-800 rounded w-32" />
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
          <div className="w-7 h-7 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-center text-neutral-400 group-hover:text-neutral-200 transition-colors">
            <Icon className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between pt-1">
        <span className="text-2xl font-bold tracking-tight text-white font-mono">{value}</span>
        {change && (
          <span className={`inline-flex items-center text-[11px] font-mono font-medium px-2 py-0.5 rounded-full ${
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
 * Status Badge Primitive (Restrained semantic indicators)
 */
export const AdminStatusBadge = ({ status }) => {
  const getStyle = () => {
    const s = String(status || '').toUpperCase();
    if (s === 'ACTIVE' || s === 'HIGH' || s === 'SUCCESS' || s === 'CAPTURED' || s === 'PAID') {
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
    if (s === 'FREE' || s === 'DEFAULT' || s === 'PENDING' || s === 'REVIEWED') {
      return 'bg-neutral-800/80 text-neutral-300 border-neutral-700';
    }
    if (s === 'EXPIRED' || s === 'SUSPENDED' || s === 'FAILED' || s === 'REVOKED' || s === 'BANNED') {
      return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    }
    if (s === 'SUPER_ADMIN' || s === 'ADMIN') {
      return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
    return 'bg-neutral-800 text-neutral-400 border-neutral-700';
  };

  return (
    <span className={`inline-flex items-center text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md border tracking-wider uppercase ${getStyle()}`}>
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
    <div className="inline-flex items-center p-0.5 rounded-lg bg-neutral-950 border border-neutral-800">
      {ranges.map(r => (
        <button
          key={r.value}
          type="button"
          onClick={() => onSelectRange(r.value)}
          className={`px-2.5 py-1 text-xs font-mono font-medium rounded-md transition-colors cursor-pointer ${
            selectedRange === r.value
              ? 'bg-neutral-800 text-white font-bold shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200 bg-transparent'
          }`}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
};

/**
 * Section Card Container
 */
export const AdminCard = ({ title, subtitle, action, children, className = '' }) => (
  <div className={`bg-neutral-900/90 border border-neutral-800/80 rounded-xl p-5 space-y-4 ${className}`}>
    {(title || subtitle || action) && (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-800/60">
        <div>
          {title && <h3 className="text-sm font-bold text-white tracking-tight">{title}</h3>}
          {subtitle && <p className="text-xs text-neutral-400 font-mono mt-0.5">{subtitle}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    )}
    {children}
  </div>
);

/**
 * Standard Operational Search Input
 */
export const AdminSearchInput = ({ value, onChange, placeholder = 'Search records...', onClear }) => (
  <div className="relative flex-1 max-w-md">
    <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-8 py-2 text-xs text-neutral-200 font-mono placeholder:text-neutral-500 focus:border-neutral-600 focus:outline-none transition-colors"
    />
    {value && onClear && (
      <button
        onClick={onClear}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 p-0.5 cursor-pointer"
        aria-label="Clear search"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    )}
  </div>
);

/**
 * Loading Skeleton
 */
export const AdminLoadingSkeleton = ({ rows = 5 }) => (
  <div className="w-full space-y-3 p-5 bg-neutral-900/50 border border-neutral-800/80 rounded-xl">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center justify-between gap-4 animate-pulse">
        <div className="w-8 h-8 bg-neutral-800 rounded-lg shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3.5 bg-neutral-800 rounded w-1/3" />
          <div className="h-3 bg-neutral-800/60 rounded w-1/2" />
        </div>
        <div className="w-16 h-5 bg-neutral-800 rounded-md shrink-0" />
      </div>
    ))}
  </div>
);

/**
 * Empty State Primitives
 */
export const AdminEmptyState = ({ title = 'No records found', description = 'No data matches your search query or filter criteria.', icon: Icon = Inbox, actionLabel, onAction }) => (
  <div className="py-12 px-6 text-center space-y-3 bg-neutral-950/40 border border-neutral-800/60 rounded-xl max-w-md mx-auto my-6">
    <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
      <Icon className="w-5 h-5" />
    </div>
    <h4 className="text-sm font-semibold text-white tracking-tight">{title}</h4>
    <p className="text-xs text-neutral-400 leading-relaxed font-mono">{description}</p>
    {actionLabel && onAction && (
      <button
        onClick={onAction}
        className="mt-2 px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer border border-neutral-700"
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
    <AlertTriangle className="w-6 h-6 text-rose-400 mx-auto" />
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

