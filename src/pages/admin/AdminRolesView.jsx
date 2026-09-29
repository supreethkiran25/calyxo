import React from 'react';
import { 
  ShieldAlert, 
  User, 
  Check, 
  X as XIcon, 
  Lock, 
  Sparkles, 
  Database, 
  CreditCard, 
  Users, 
  Terminal,
  ShieldCheck,
  Activity,
  Layers,
  KeyRound
} from 'lucide-react';
import { AdminPageHeader } from '../../components/admin/AdminUIPrimitives';
import { SUPER_ADMIN_EMAILS } from '../../services/adminService';

const AdminRolesView = () => {
  const roleDefinitions = [
    {
      role: 'Super Admin',
      badge: 'Full Operational Control',
      badgeColor: 'bg-[#d4ff00]/15 text-[#d4ff00] border-[#d4ff00]/30',
      description: 'Platform creators & authorized operators with global read/write access, database oversight, billing entitlements, and system configuration.',
      icon: ShieldAlert,
      iconBg: 'bg-[#d4ff00]/10 text-[#d4ff00] border border-[#d4ff00]/30',
      activeHolders: SUPER_ADMIN_EMAILS,
      stats: '2 Authorized Identities'
    },
    {
      role: 'User (Athlete)',
      badge: 'Self-Service Athlete',
      badgeColor: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
      description: 'Registered athletes and fitness members who track workouts, log nutrition, converse with Calyxo AI Coach, and access subscription features.',
      icon: User,
      iconBg: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30',
      activeHolders: ['All Authenticated Supabase Athletes'],
      stats: 'Global Member Base'
    }
  ];

  const permissions = [
    {
      category: 'Platform Operations & CRM',
      items: [
        { name: 'Access Calyxo Admin CRM & System Analytics', superAdmin: true, user: false, note: 'Strict server-side RPC verification' },
        { name: 'View Global Athlete Directory & 360 Biometric Profiles', superAdmin: true, user: false, note: 'Protected by Supabase Admin policies' },
        { name: 'Suspend or Delete User Accounts', superAdmin: true, user: false, note: 'Super Admin authorization only' },
        { name: 'Direct In-App & WebPush Notification Broadcasting', superAdmin: true, user: false, note: 'Push service orchestration' },
        { name: 'Inspect Security Audit Logs & Real-Time Telemetry', superAdmin: true, user: false, note: 'Comprehensive audit trails' }
      ]
    },
    {
      category: 'Subscriptions & Billing Operations',
      items: [
        { name: 'Grant or Revoke High / Annual Subscription Passes', superAdmin: true, user: false, note: 'Instant entitlement provisioning' },
        { name: 'View Live Razorpay Transactions & Revenue Reports', superAdmin: true, user: false, note: 'Direct database transaction audit' },
        { name: 'Subscribe / Manage Personal Subscription Plan', superAdmin: true, user: true, note: 'Razorpay payment gateway integration' },
        { name: 'Restore Purchased Subscriptions', superAdmin: true, user: true, note: 'Deterministic receipt verification' }
      ]
    },
    {
      category: 'Health Databases & AI Engine',
      items: [
        { name: 'Manage Global Workout & Exercise Database', superAdmin: true, user: false, note: '1,300+ muscle-targeted movements' },
        { name: 'Manage Food & Nutrition Database Items', superAdmin: true, user: false, note: 'Standardized macronutrient library' },
        { name: 'Configure Gemini AI Model Parameters & Prompts', superAdmin: true, user: false, note: 'AI engine routing and token limits' },
        { name: 'Log Personal Workouts, Meals, and Weight Metrics', superAdmin: true, user: true, note: 'Athlete self-tracking database' },
        { name: 'Converse with 24/7 Calyxo AI Fitness & Diet Coach', superAdmin: true, user: true, note: 'Unlimited in High Plan, capped in Free' }
      ]
    },
    {
      category: 'Security & System Configuration',
      items: [
        { name: 'Toggle Platform Maintenance Mode & Feature Flags', superAdmin: true, user: false, note: 'Global ecosystem switch' },
        { name: 'Export Global CRM & Telemetry Data (CSV / JSON)', superAdmin: true, user: false, note: 'Database snapshot export' },
        { name: 'Update Personal Profile, Biometrics & Daily Routine', superAdmin: true, user: true, note: 'Self-serve settings drawer' }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <AdminPageHeader
        title="Roles & Authorization"
        description="Authoritative two-role access control enforced by Supabase Auth sessions, PostgreSQL Row-Level Security (RLS), and server-side RPC guards."
        badge="2 Authorized Roles"
      />

      {/* 2. Two Authoritative Roles Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roleDefinitions.map((r, i) => {
          const Icon = r.icon;
          return (
            <div 
              key={i} 
              className="bg-[#0e121d] border border-white/10 rounded-2xl p-5 space-y-4 hover:border-white/20 transition-all shadow-xl relative overflow-hidden"
            >
              {/* Subtle top gloss */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent" />
              
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${r.iconBg}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white font-sans tracking-tight">{r.role}</h3>
                    <span className="text-xs text-slate-400 font-sans">{r.stats}</span>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${r.badgeColor}`}>
                  {r.badge}
                </span>
              </div>

              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                {r.description}
              </p>

              <div className="pt-3 border-t border-white/5 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Authorized Entities:</span>
                <div className="flex flex-wrap gap-1.5">
                  {r.activeHolders.map((holder, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-[#141724] border border-white/10 text-xs text-slate-200 font-mono">
                      {holder}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Comprehensive Privilege Matrix */}
      <div className="bg-[#0e121d] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 sm:p-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#090c14]">
          <div>
            <h4 className="text-sm font-bold text-white font-sans tracking-wide">Authoritative Capability Matrix</h4>
            <p className="text-xs text-slate-400 font-sans mt-0.5">Two-tier privilege boundary mapped to PostgreSQL database permissions</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-[#d4ff00]" /> Super Admin
            </span>
            <span className="text-slate-600 font-mono">•</span>
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-cyan-400" /> User
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-[#07090e] text-slate-400 font-semibold tracking-wider text-[11px] uppercase">
                <th className="p-4 w-7/12">Operational Capability</th>
                <th className="p-4 text-center w-2/12">
                  <div className="flex flex-col items-center">
                    <span className="text-[#d4ff00] font-bold">Super Admin</span>
                    <span className="text-[10px] text-slate-500 font-mono">Global RLS Bypass</span>
                  </div>
                </th>
                <th className="p-4 text-center w-2/12">
                  <div className="flex flex-col items-center">
                    <span className="text-cyan-400 font-bold">User</span>
                    <span className="text-[10px] text-slate-500 font-mono">Self-Scoped Only</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {permissions.map((group, gIdx) => (
                <React.Fragment key={gIdx}>
                  <tr className="bg-[#121624]/60">
                    <td colSpan={3} className="px-4 py-2 text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      {group.category}
                    </td>
                  </tr>
                  {group.items.map((item, iIdx) => (
                    <tr key={iIdx} className="hover:bg-[#141828]/50 transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-slate-200">{item.name}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{item.note}</div>
                      </td>
                      <td className="p-4 text-center">
                        {item.superAdmin ? (
                          <span className="inline-flex w-6 h-6 rounded-full bg-[#d4ff00]/15 text-[#d4ff00] border border-[#d4ff00]/30 items-center justify-center mx-auto shadow-xs">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="inline-flex w-6 h-6 rounded-full bg-slate-800 text-slate-500 items-center justify-center mx-auto">
                            <XIcon className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {item.user ? (
                          <span className="inline-flex w-6 h-6 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 items-center justify-center mx-auto shadow-xs">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="inline-flex w-6 h-6 rounded-full bg-slate-800/80 text-slate-600 items-center justify-center mx-auto">
                            <Lock className="w-3 h-3 text-slate-500" />
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Security Notice Footer */}
        <div className="p-4 bg-[#090c14] border-t border-white/10 flex items-center gap-3 text-xs text-slate-400">
          <ShieldCheck className="w-5 h-5 text-[#d4ff00] shrink-0" />
          <span>
            Database enforcement: Row-Level Security (RLS) restricts standard <strong className="text-slate-200">Users</strong> to rows matching <code className="px-1.5 py-0.5 rounded bg-black/40 text-slate-300 font-mono text-[10px]">auth.uid() = user_id</code>. Only verified <strong className="text-slate-200">Super Admins</strong> are granted administrative RPC access.
          </span>
        </div>
      </div>
    </div>
  );
};

export default AdminRolesView;
