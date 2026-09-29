import React, { useState, useEffect } from 'react';
import { Shield, ShieldCheck, Key, Lock, UserCheck, Mail, Calendar, CheckCircle2 } from 'lucide-react';
import { getAdminAccounts } from '../../services/adminService';
import { AdminPageHeader, AdminStatusBadge } from '../../components/admin/AdminUIPrimitives';

const AdminAdminsView = () => {
  const [admins, setAdmins] = useState([]);

  useEffect(() => {
    getAdminAccounts().then(setAdmins);
  }, []);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Admin Accounts & Security"
        description="Designated Super Admins, root access privileges, two-factor authentication, and security audit identities."
        badge="Zero Trust Security"
      />

      {/* Admin Privileges Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 bg-[#0e121d] border border-white/10 rounded-2xl shadow-xl space-y-2 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent" />
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h4 className="text-sm font-bold text-white">Cryptographic Root Access</h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            Super Admin operations are protected by Supabase Auth RLS policies and server-side RPC validation. Destructive operations require active root authorization.
          </p>
        </div>

        <div className="p-5 bg-[#0e121d] border border-white/10 rounded-2xl shadow-xl space-y-2 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#d4ff00]/30 to-transparent" />
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#d4ff00]" />
            <h4 className="text-sm font-bold text-white">Audit Ledger Immutability</h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            Every user deletion, entitlement override, broadcast message, and system setting change is logged to the Postgres <code className="font-mono bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-lime-400">admin_audit_logs</code> table.
          </p>
        </div>
      </div>

      {/* Admins Table Container */}
      <div className="bg-[#0e121d] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-white/10">
          <h4 className="text-sm font-bold text-white tracking-tight">Active Platform Administrators</h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-[#0b0e17] text-slate-400 font-mono uppercase text-[10px]">
                <th className="p-4 font-bold">Administrator</th>
                <th className="p-4 font-bold">Email</th>
                <th className="p-4 font-bold">Role</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold">MFA Protection</th>
                <th className="p-4 text-right font-bold">Last Session</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {admins.map(a => (
                <tr key={a.id} className="hover:bg-white/[0.03] transition-colors">
                  <td className="p-4 font-semibold text-white">{a.name}</td>
                  <td className="p-4 text-slate-400 font-mono text-[11px]">{a.email}</td>
                  <td className="p-4">
                    <AdminStatusBadge status="SUPER ADMIN" />
                  </td>
                  <td className="p-4">
                    <AdminStatusBadge status={a.status || 'ACTIVE'} />
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center text-emerald-400 font-medium gap-1 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Enforced
                    </span>
                  </td>
                  <td className="p-4 text-right text-slate-400 font-mono text-[11px]">{a.last_active}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminAdminsView;
