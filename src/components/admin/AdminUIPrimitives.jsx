import React from 'react';
import { AlertTriangle, ArrowUpRight, ArrowDownRight, RefreshCw, Inbox, Search, X, CheckCircle2, Clock } from 'lucide-react';

/**
 * Rich Calyxo Dark Operational Page Header
 */
export const AdminPageHeader = ({ title, description, badge, actions, children }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
    <div className="space-y-1">
      <div className="flex items-center gap-2.5">
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">{title}</h1>
        {badge && (
          <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10">
            {badge}
          </span>
        )}
      </div>
      {description && (
        <p className="text-xs sm:text-sm text-slate-400 font-sans tracking-tight leading-relaxed max-w-3xl">
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
 * Luxury Dark Operational KPI Stat Card matching Calyxo Aesthetic
 */
export const AdminStatCard = ({ 
  title, 
  value, 
  trend, 
  trendLabel = 'vs last 30 days',
  icon: Icon, 
  breakdowns = [], 
  loading 
}) => {
  if (loading) {
    return (
      <div className="bg-[#0f121d] border border-white/10 rounded-2xl p-5 space-y-3 shadow-lg animate-pulse">
        <div className="flex items-center justify-between">
          <div className="w-8 h-8 bg-white/5 rounded-xl" />
          <div className="h-3 bg-white/5 rounded w-24" />
        </div>
        <div className="h-7 bg-white/5 rounded w-28" />
        <div className="h-3 bg-white/5 rounded w-36" />
      </div>
    );
  }

  const isPositive = !trend || !trend.includes('-');

  return (
    <div className="bg-[#0f121d] border border-white/[0.08] hover:border-lime-400/30 rounded-2xl p-5 hover:shadow-xl hover:shadow-black/40 transition-all duration-200 group relative overflow-hidden">
      {/* Subtle top gloss highlight */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-slate-400 block tracking-wide">
            {title}
          </span>
          <div className="text-2xl sm:text-3xl font-black tracking-tight text-white font-sans mt-1">
            {value}
          </div>
        </div>
        {Icon && (
          <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-slate-300 group-hover:text-lime-300 group-hover:border-lime-400/40 transition-all shadow-xs">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      {trend && (
        <div className="flex items-center gap-1.5 mt-2.5 text-xs">
          <span className={`inline-flex items-center font-bold px-2 py-0.5 rounded-full text-[11px] ${
            isPositive ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
          }`}>
            {isPositive ? '↑' : '↓'} {trend}
          </span>
          {trendLabel && (
            <span className="text-slate-400 text-xs font-medium">
              {trendLabel}
            </span>
          )}
        </div>
      )}

      {breakdowns && breakdowns.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 pt-3 border-t border-white/5 text-[11px] font-sans text-slate-400">
          {breakdowns.map((b, idx) => (
            <span key={idx} className="flex items-center gap-1">
              <span className="text-slate-500 font-medium">{b.label}:</span>
              <span className="text-slate-200 font-bold">{b.value}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Status Badge Primitive (Glowing Restrained Indicators)
 */
export const AdminStatusBadge = ({ status }) => {
  const getStyle = () => {
    const s = String(status || '').toUpperCase();
    if (s === 'PREMIUM' || s === 'HIGH' || s === 'ACTIVE' || s === 'CAPTURED' || s === 'PAID' || s === 'ONLINE' || s === 'HEALTHY' || s === 'RESOLVED') {
      return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-semibold';
    }
    if (s === 'PRO' || s === 'HIGH_ANNUAL') {
      return 'bg-blue-500/15 text-blue-400 border-blue-500/30 font-semibold';
    }
    if (s === 'TRIAL' || s === 'BASIC') {
      return 'bg-purple-500/15 text-purple-300 border-purple-500/30 font-semibold';
    }
    if (s === 'FREE' || s === 'DEFAULT' || s === 'PENDING' || s === 'WAITING' || s === 'IN PROGRESS') {
      return 'bg-white/5 text-slate-300 border-white/10 font-medium';
    }
    if (s === 'EXPIRED' || s === 'SUSPENDED' || s === 'CANCELLED' || s === 'FAILED' || s === 'REVOKED' || s === 'BANNED' || s === 'CLOSED' || s === 'INACTIVE') {
      return 'bg-rose-500/15 text-rose-400 border-rose-500/30 font-semibold';
    }
    if (s === 'SUPER ADMIN' || s === 'SUPER_ADMIN') {
      return 'bg-lime-400/15 text-lime-300 border-lime-400/30 font-black';
    }
    if (s === 'USER') {
      return 'bg-white/10 text-slate-200 border-white/15 font-semibold';
    }
    return 'bg-white/5 text-slate-400 border-white/10';
  };

  const getDot = () => {
    const s = String(status || '').toUpperCase();
    if (s === 'ONLINE' || s === 'ACTIVE' || s === 'HEALTHY') {
      return <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />;
    }
    if (s === 'INACTIVE') {
      return <span className="w-1.5 h-1.5 rounded-full bg-slate-500 mr-1.5 shrink-0" />;
    }
    return null;
  };

  return (
    <span className={`inline-flex items-center text-[11px] font-medium px-2.5 py-0.5 rounded-full border tracking-tight ${getStyle()}`}>
      {getDot()}
      {status || 'UNKNOWN'}
    </span>
  );
};

/**
 * Subscription Expiry Countdown Badge
 */
export const AdminCountdownBadge = ({ daysRemaining, countdownLabel, plan, isExpiringSoon }) => {
  const isFree = !plan || String(plan).toUpperCase() === 'FREE';

  if (isFree) {
    return (
      <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/10 font-mono">
        Free Tier
      </span>
    );
  }

  const days = Number(daysRemaining);
  if (isNaN(days) || days <= 0) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 font-mono">
        <Clock className="w-3 h-3 text-rose-400" />
        <span>{countdownLabel || 'Expired'}</span>
      </span>
    );
  }

  if (days <= 5 || isExpiringSoon) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono animate-pulse">
        <Clock className="w-3 h-3 text-amber-400" />
        <span>⏳ {days}d left (Expiring)</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono">
      <Clock className="w-3 h-3 text-emerald-400" />
      <span>{days}d left</span>
    </span>
  );
};

/**
 * Segmented Filter Toggle
 */
export const AdminDateRangePicker = ({ selectedRange, onSelectRange, options = ['7D', '30D', '90D', '1Y'] }) => {
  return (
    <div className="inline-flex items-center p-1 rounded-xl bg-[#121522] border border-white/10">
      {options.map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => onSelectRange(opt)}
          className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            selectedRange === opt
              ? 'bg-lime-400 text-black shadow-xs'
              : 'text-slate-400 hover:text-white bg-transparent'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
};

/**
 * Standard Operational Search Input
 */
export const AdminSearchInput = ({ value, onChange, placeholder = 'Search records...', onClear }) => (
  <div className="relative flex-1 max-w-md">
    <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-[#131622] border border-white/10 rounded-xl pl-9 pr-8 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-lime-400/60 focus:ring-1 focus:ring-lime-400/20 focus:outline-none transition-all shadow-inner"
    />
    {value && onClear && (
      <button
        onClick={onClear}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white p-0.5 cursor-pointer"
        aria-label="Clear search"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    )}
  </div>
);

/**
 * Section Card Container
 */
export const AdminCard = ({ title, subtitle, action, children, className = '' }) => (
  <div className={`bg-[#0f121d] border border-white/[0.08] rounded-2xl p-5 space-y-4 shadow-xl ${className}`}>
    {(title || subtitle || action) && (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/5">
        <div>
          {title && <h3 className="text-sm font-bold text-white tracking-tight">{title}</h3>}
          {subtitle && <p className="text-xs text-slate-400 font-sans mt-0.5">{subtitle}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    )}
    {children}
  </div>
);

/**
 * Loading Skeleton
 */
export const AdminLoadingSkeleton = ({ rows = 5 }) => (
  <div className="w-full space-y-3 p-6 bg-[#0f121d] border border-white/10 rounded-2xl">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center justify-between gap-4 animate-pulse">
        <div className="w-8 h-8 bg-white/5 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 bg-white/5 rounded w-1/3" />
          <div className="h-3 bg-white/[0.03] rounded w-1/2" />
        </div>
        <div className="w-16 h-5 bg-white/5 rounded-md shrink-0" />
      </div>
    ))}
  </div>
);

/**
 * Empty State Primitives
 */
export const AdminEmptyState = ({ 
  title = 'No records found', 
  description = 'No data matches your search query or filter criteria.', 
  icon: Icon = Inbox, 
  actionLabel, 
  onAction 
}) => (
  <div className="py-12 px-6 text-center space-y-3 bg-[#0d1019] border border-white/10 rounded-2xl max-w-md mx-auto my-6">
    <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-400 shadow-md">
      <Icon className="w-5 h-5" />
    </div>
    <h4 className="text-sm font-bold text-white tracking-tight">{title}</h4>
    <p className="text-xs text-slate-400 leading-relaxed font-sans">{description}</p>
    {actionLabel && onAction && (
      <button
        onClick={onAction}
        className="mt-2 px-4 py-2 bg-lime-400 hover:bg-lime-300 text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg"
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
  <div className="p-6 text-center space-y-3 bg-rose-950/20 border border-rose-500/30 rounded-2xl max-w-md mx-auto my-6">
    <AlertTriangle className="w-6 h-6 text-rose-400 mx-auto" />
    <h4 className="text-sm font-bold text-rose-200">{message}</h4>
    {onRetry && (
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-md"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        Retry Request
      </button>
    )}
  </div>
);
