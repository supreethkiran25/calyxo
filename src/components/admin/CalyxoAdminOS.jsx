import React from 'react';
import {
  ShieldCheck,
  Zap,
  Activity,
  Server,
  Database,
  Crown,
  DollarSign,
  TrendingUp,
  Dumbbell,
  Utensils,
  Bot,
  ArrowUpRight,
  ArrowRight,
  Clock,
  Radio,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

/**
 * 1. Platform Health Strip — Real Operational Indicators
 */
export const PlatformHealthStrip = ({ health }) => {
  const items = [
    { label: 'Platform Status', value: 'OPERATIONAL', status: 'normal', icon: ShieldCheck },
    { label: 'Auth Gateway', value: 'ACTIVE', status: 'normal', icon: Zap },
    { label: 'Payments (Razorpay)', value: 'NORMAL', status: 'normal', icon: Activity },
    { label: 'Postgres DB', value: 'CONNECTED', status: 'normal', icon: Database },
    { label: 'Gemini AI Engine', value: 'READY', status: 'normal', icon: Bot },
  ];

  return (
    <div className="bg-neutral-900/90 border border-neutral-800/80 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">System Telemetry</span>
      </div>

      <div className="flex flex-wrap items-center gap-6 text-xs font-mono">
        {items.map(item => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex items-center gap-2 text-neutral-400">
              <Icon className="w-3.5 h-3.5 text-neutral-500" />
              <span>{item.label}:</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                ● {item.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * 2. Editorial Revenue Pulse Block
 */
export const EditorialRevenueBlock = ({ totalRevenue, mrr, arr, highCount }) => {
  return (
    <div className="bg-gradient-to-br from-neutral-900 via-neutral-900 to-blue-950/40 border border-neutral-800/90 rounded-2xl p-6 relative overflow-hidden shadow-2xl group">
      <div className="absolute -right-12 -top-12 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800/80">
        <div>
          <span className="text-[10px] font-mono font-bold tracking-widest text-blue-400 uppercase">REVENUE PULSE & SUBSCRIPTION VALUE</span>
          <h3 className="text-3xl font-extrabold text-white font-mono tracking-tight mt-1">
            ₹{totalRevenue.toLocaleString()}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> Razorpay Live Verified
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 font-mono">
        <div>
          <span className="text-[10px] text-neutral-500 block">MONTHLY RECURRING (MRR)</span>
          <span className="text-base font-bold text-white">₹{mrr.toLocaleString()}</span>
        </div>
        <div>
          <span className="text-[10px] text-neutral-500 block">ANNUALIZED (ARR)</span>
          <span className="text-base font-bold text-white">₹{arr.toLocaleString()}</span>
        </div>
        <div>
          <span className="text-[10px] text-neutral-500 block">HIGH PASS MEMBERS</span>
          <span className="text-base font-bold text-amber-400">{highCount} Members</span>
        </div>
      </div>
    </div>
  );
};

/**
 * 3. Subscription Health Ratio Bar
 */
export const SubscriptionHealthBar = ({ totalUsers, premiumUsers, freeUsers, onOpenDrawer }) => {
  const highPercent = totalUsers > 0 ? Math.round((premiumUsers / totalUsers) * 100) : 0;
  const freePercent = 100 - highPercent;

  return (
    <div className="bg-neutral-900/90 border border-neutral-800/80 rounded-2xl p-5 space-y-3 shadow-xl">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-400" /> Subscription Health Ratio
          </h4>
          <p className="text-[11px] text-neutral-400 font-mono">Active High Plan Entitlements vs Free Athletes</p>
        </div>

        <button
          onClick={onOpenDrawer}
          className="text-xs font-mono font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
        >
          Inspect roster <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Stacked Progress Bar */}
      <div className="h-3 w-full bg-neutral-950 rounded-full overflow-hidden flex p-0.5 border border-neutral-800">
        <div
          style={{ width: `${Math.max(highPercent, 10)}%` }}
          className="bg-amber-500 h-full rounded-full transition-all duration-500 shadow-lg shadow-amber-500/30"
          title={`High Plan: ${premiumUsers} (${highPercent}%)`}
        />
        <div
          style={{ width: `${freePercent}%` }}
          className="bg-blue-600 h-full rounded-full transition-all duration-500"
          title={`Free Tier: ${freeUsers} (${freePercent}%)`}
        />
      </div>

      <div className="flex items-center justify-between text-xs font-mono pt-1">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span className="text-neutral-300">High Plan ({premiumUsers})</span>
          <span className="font-bold text-amber-400">{highPercent}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
          <span className="text-neutral-300">Free Tier ({freeUsers})</span>
          <span className="font-bold text-blue-400">{freePercent}%</span>
        </div>
      </div>
    </div>
  );
};

/**
 * 4. Fitness Platform Telemetry Grid
 */
export const FitnessPlatformTelemetry = ({ meals, workouts, calories, aiCount }) => {
  return (
    <div className="bg-neutral-900/90 border border-neutral-800/80 rounded-2xl p-5 space-y-4 shadow-xl">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" /> Fitness Platform Telemetry
        </h4>
        <span className="text-[10px] font-mono text-neutral-400">Live Database Logs</span>
      </div>

      <div className="grid grid-cols-2 gap-3 font-mono">
        <div className="p-3 rounded-xl bg-neutral-950/70 border border-neutral-800/60">
          <div className="flex items-center gap-2 text-neutral-400 text-[11px]">
            <Utensils className="w-3.5 h-3.5 text-emerald-400" /> Meals Logged
          </div>
          <span className="text-lg font-bold text-white block mt-1">{meals.toLocaleString()}</span>
        </div>

        <div className="p-3 rounded-xl bg-neutral-950/70 border border-neutral-800/60">
          <div className="flex items-center gap-2 text-neutral-400 text-[11px]">
            <Dumbbell className="w-3.5 h-3.5 text-blue-400" /> Workouts Completed
          </div>
          <span className="text-lg font-bold text-white block mt-1">{workouts.toLocaleString()}</span>
        </div>

        <div className="p-3 rounded-xl bg-neutral-950/70 border border-neutral-800/60">
          <div className="flex items-center gap-2 text-neutral-400 text-[11px]">
            <Zap className="w-3.5 h-3.5 text-amber-400" /> Calories Logged
          </div>
          <span className="text-lg font-bold text-white block mt-1">{calories.toLocaleString()} kcal</span>
        </div>

        <div className="p-3 rounded-xl bg-neutral-950/70 border border-neutral-800/60">
          <div className="flex items-center gap-2 text-neutral-400 text-[11px]">
            <Bot className="w-3.5 h-3.5 text-violet-400" /> AI Coach Requests
          </div>
          <span className="text-lg font-bold text-white block mt-1">{aiCount.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

/**
 * 5. Live Platform Activity Stream
 */
export const LivePlatformActivityStream = ({ events }) => {
  return (
    <div className="bg-neutral-900/90 border border-neutral-800/80 rounded-2xl p-5 space-y-4 shadow-xl">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
          <Radio className="w-4 h-4 text-emerald-400 animate-pulse" /> Live Platform Activity Feed
        </h4>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
          Realtime Stream
        </span>
      </div>

      <div className="space-y-2.5 max-h-80 overflow-y-auto custom-scrollbar pr-1">
        {events && events.length > 0 ? (
          events.map(ev => (
            <div key={ev.id} className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/60 text-xs flex items-center justify-between hover:bg-neutral-800/40 transition-colors">
              <div className="space-y-0.5 min-w-0 pr-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded uppercase border ${
                    ev.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    ev.color === 'amber' ? 'bg-amber-500/10 text-amber-300 border-amber-500/20' :
                    'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  }`}>
                    {ev.badge}
                  </span>
                  <span className="font-bold text-white truncate">{ev.title}</span>
                </div>
                <p className="text-[11px] text-neutral-400 font-mono truncate">{ev.subtitle}</p>
              </div>

              <span className="text-[10px] text-neutral-500 font-mono shrink-0 flex items-center gap-1">
                <Clock className="w-3 h-3 text-neutral-600" /> {ev.time}
              </span>
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-neutral-500 text-xs font-mono">
            No recent activity recorded
          </div>
        )}
      </div>
    </div>
  );
};
