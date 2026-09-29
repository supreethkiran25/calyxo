import React, { useState, useEffect } from 'react';
import { Layers, Check, Crown, Shield, Zap, Sparkles, ArrowRight } from 'lucide-react';
import { getAdminTopPlans } from '../../services/adminService';
import { AdminPageHeader, AdminStatusBadge } from '../../components/admin/AdminUIPrimitives';

const AdminPlansView = () => {
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    getAdminTopPlans().then(setPlans);
  }, []);

  const planTiers = [
    {
      code: 'HIGH',
      name: 'High Plan (Monthly)',
      price: '₹2',
      period: '/ month',
      badge: 'POPULAR',
      badgeColor: 'bg-[#d4ff00]/15 text-[#d4ff00] border-[#d4ff00]/30',
      isPrimary: true,
      features: [
        'Unlimited AI Nutrition & Food Vision Scans',
        'Personalized Adaptive Workout Generation',
        'Calyxo Apple Watch & Wear OS Live Telemetry',
        'Streak Freeze Vault & Progress Protection',
        'Direct Chat with Calyxo AI Head Coach'
      ]
    },
    {
      code: 'HIGH_ANNUAL',
      name: 'High Plan (Annual Pass)',
      price: '₹199',
      period: '/ year',
      badge: 'BEST VALUE',
      badgeColor: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
      isPrimary: false,
      features: [
        'All Monthly High Plan Entitlements Included',
        'Priority AI Inference Queue & Ultra-Low Latency',
        'Biometric Advanced Muscle Fatigue Modeling',
        'Early Beta Access to Wearable Sync 2.0',
        'Unlimited Historical Health Data Export'
      ]
    },
    {
      code: 'FREE',
      name: 'Free Athlete Tier',
      price: '₹0',
      period: 'forever',
      badge: 'STANDARD',
      badgeColor: 'bg-slate-800 text-slate-400 border-white/10',
      isPrimary: false,
      features: [
        'Manual Workout & Exercise Logging',
        'Standard Food Database Nutritional Search',
        'Basic Calorie & Macro Target Gauges',
        'Community Leaderboards & Badges',
        'Single Device Sync'
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Subscription Plans & Pricing Architecture"
        description="SaaS product pricing architecture, entitlement locks, feature boundaries, and subscriber distribution across tiers."
        badge="Razorpay Active Catalog"
      />

      {/* Plan Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {planTiers.map((tier) => {
          const stats = plans.find(p => p.badge === tier.code || (tier.code === 'HIGH' && p.plan.includes('Premium')) || (tier.code === 'HIGH_ANNUAL' && p.plan.includes('Pro'))) || {};
          return (
            <div
              key={tier.code}
              className={`bg-[#0e121d] border rounded-2xl p-6 shadow-2xl flex flex-col justify-between space-y-6 transition-all relative overflow-hidden ${
                tier.isPrimary ? 'border-[#d4ff00]/40 ring-1 ring-[#d4ff00]/30' : 'border-white/10 hover:border-white/20'
              }`}
            >
              {tier.isPrimary && (
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#d4ff00] to-transparent" />
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                    {tier.name}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tier.badgeColor}`}>
                    {tier.badge}
                  </span>
                </div>

                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black tracking-tight text-white font-sans">{tier.price}</span>
                  <span className="text-xs text-slate-400 font-mono">{tier.period}</span>
                </div>

                <div className="p-3 bg-[#141724] rounded-xl border border-white/5 flex items-center justify-between text-xs font-sans">
                  <span className="text-slate-400">Active Subscribers:</span>
                  <span className="font-bold text-white font-mono">{(stats.subscribers ?? 0).toLocaleString()}</span>
                </div>

                <div className="space-y-2.5 pt-3 border-t border-white/5 text-xs">
                  <span className="font-semibold text-slate-300 block uppercase tracking-wider text-[10px]">Entitled Features:</span>
                  <ul className="space-y-2">
                    {tier.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-300 text-xs">
                        <Check className="w-3.5 h-3.5 text-[#d4ff00] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminPlansView;
