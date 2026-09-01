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
  ArrowRight,
  Clock,
  Radio
} from 'lucide-react';

/**
 * 1. Platform Health Strip — Operational Indicators
 */
export const PlatformHealthStrip = () => {
  const items = [
    { label: 'Platform Engine', value: 'Operational', icon: ShieldCheck },
    { label: 'Auth Gateway', value: 'Active', icon: Zap },
    { label: 'Razorpay Gateway', value: 'Connected', icon: Activity },
    { label: 'PostgreSQL Database', value: 'Connected', icon: Database },
    { label: 'Gemini AI Engine', value: 'Ready', icon: Bot },
  ];

  return (
    <div className="bg-neutral-900/90 border border-neutral-800/80 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">System Telemetry</span>
      </div>

      <div className="flex flex-wrap items-center gap-6 text-xs font-mono">
        {items.map(item => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex items-center gap-2 text-neutral-400">
              <Icon className="w-3.5 h-3.5 text-neutral-500" />
              <span>{item.label}:</span>
              <span className="font-semibold text-emerald-400">
                {item.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * 2. Subscription Health Ratio Bar
 */
export const SubscriptionHealthBar = ({ totalUsers, premiumUsers, freeUsers, onOpenDrawer }) => {
  const highPercent = totalUsers > 0 ? Math.round((premiumUsers / totalUsers) * 100) : 0;
  const freePercent = 100 - highPercent;

  return (
    <div className="bg-neutral-900/90 border border-neutral-800/80 rounded-xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-400" /> Subscription Ratio
          </h4>
          <p className="text-[11px] text-neutral-400 font-mono mt-0.5">High Plan entitlements vs Free athletes</p>
        </div>

        {onOpenDrawer && (
          <button
            onClick={onOpenDrawer}
            className="text-xs font-mono font-medium text-neutral-300 hover:text-white flex items-center gap-1 cursor-pointer"
          >
            View members <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Stacked Progress Bar */}
      <div className="h-2.5 w-full bg-neutral-950 rounded-full overflow-hidden flex p-0.5 border border-neutral-800">
        <div
          style={{ width: `${Math.max(highPercent, 5)}%` }}
          className="bg-amber-500 h-full rounded-full transition-all duration-300"
          title={`High Plan: ${premiumUsers} (${highPercent}%)`}
        />
        <div
          style={{ width: `${freePercent}%` }}
          className="bg-neutral-700 h-full rounded-full transition-all duration-300"
          title={`Free Tier: ${freeUsers} (${freePercent}%)`}
        />
      </div>

      <div className="flex items-center justify-between text-xs font-mono pt-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="text-neutral-300">High Plan ({premiumUsers})</span>
          <span className="font-bold text-amber-400">{highPercent}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-neutral-600" />
          <span className="text-neutral-300">Free Tier ({freeUsers})</span>
          <span className="font-bold text-neutral-400">{freePercent}%</span>
        </div>
      </div>
    </div>
  );
};

/**
 * 3. Platform Activity Telemetry Grid
 */
export const FitnessPlatformTelemetry = ({ meals = 0, workouts = 0, calories = 0, aiCount = 0 }) => {
  return (
    <div className="bg-neutral-900/90 border border-neutral-800/80 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
          <Activity className="w-4 h-4 text-neutral-300" /> Platform Activity Telemetry
        </h4>
        <span className="text-[10px] font-mono text-neutral-500">Live Database Logs</span>
      </div>

      <div className="grid grid-cols-2 gap-3 font-mono">
        <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
          <div className="flex items-center gap-2 text-neutral-400 text-[11px]">
            <Utensils className="w-3.5 h-3.5 text-neutral-400" /> Meals Logged
          </div>
          <span className="text-lg font-bold text-white block mt-1">{meals.toLocaleString()}</span>
        </div>

        <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
          <div className="flex items-center gap-2 text-neutral-400 text-[11px]">
            <Dumbbell className="w-3.5 h-3.5 text-neutral-400" /> Workouts Completed
          </div>
          <span className="text-lg font-bold text-white block mt-1">{workouts.toLocaleString()}</span>
        </div>

        <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
          <div className="flex items-center gap-2 text-neutral-400 text-[11px]">
            <Zap className="w-3.5 h-3.5 text-amber-400" /> Calories Logged
          </div>
          <span className="text-lg font-bold text-white block mt-1">{calories.toLocaleString()} kcal</span>
        </div>

        <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
          <div className="flex items-center gap-2 text-neutral-400 text-[11px]">
            <Bot className="w-3.5 h-3.5 text-neutral-400" /> AI Coach Requests
          </div>
          <span className="text-lg font-bold text-white block mt-1">{aiCount.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

/**
 * 4. Live Platform Activity Stream
 */
export const LivePlatformActivityStream = ({ events }) => {
  return (
    <div className="bg-neutral-900/90 border border-neutral-800/80 rounded-xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-emerald-400" /> Live Activity Feed
        </h4>
        <span className="text-[10px] font-mono text-neutral-400">
          Realtime Stream
        </span>
      </div>

      <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar pr-1">
        {events && events.length > 0 ? (
          events.map(ev => (
            <div key={ev.id} className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800/80 text-xs flex items-center justify-between hover:border-neutral-700 transition-colors">
              <div className="space-y-0.5 min-w-0 pr-2">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded uppercase border bg-neutral-900 text-neutral-300 border-neutral-700">
                    {ev.badge}
                  </span>
                  <span className="font-semibold text-white truncate">{ev.title}</span>
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

