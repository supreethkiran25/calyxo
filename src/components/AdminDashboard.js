"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, Users, Search, RefreshCw, Edit3, UserCheck, 
  Trash2, Mail, Calendar, Settings, AlertTriangle
} from 'lucide-react';
import { useRBACStore } from '../store/useRBACStore';
import { useStore } from '../store/useStore';

export default function AdminDashboard({ onNotification }) {
  const rbac = useRBACStore();
  const user = useStore(state => state.user);
  const currentUserId = user?.uid;

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    rbac.getAdminUserList();
  }, []);

  const handleRoleChange = async (targetUserId, newRole) => {
    if (targetUserId === currentUserId) {
      if (!window.confirm("You are changing your OWN role. Doing this will revoke your Admin access and redirect you. Proceed?")) {
        return;
      }
    }

    const success = await rbac.changeUserRole(targetUserId, newRole);
    if (success) {
      if (onNotification) onNotification(`User role updated to ${newRole.toUpperCase()}! 🛡️`);
    } else {
      if (onNotification) onNotification("Role change failed.");
    }
  };

  // Filter users by search query
  const filteredUsers = rbac.adminUsers.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // System aggregates
  const counts = rbac.adminUsers.reduce((acc, u) => {
    if (u.role === 'admin') acc.admins += 1;
    else if (u.role === 'trainer') acc.trainers += 1;
    else if (u.role === 'dietitian') acc.dietitians += 1;
    else acc.users += 1;
    return acc;
  }, { users: 0, trainers: 0, dietitians: 0, admins: 0 });

  return (
    <div className="space-y-6 select-text pb-20">
      
      {/* Overview Diagnostics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {[
          { label: 'Total Clients', value: counts.users, icon: '👥', color: 'from-acid-green/10 to-transparent border-acid-green/20' },
          { label: 'Total Trainers', value: counts.trainers, icon: '💪', color: 'from-orange/10 to-transparent border-orange/20' },
          { label: 'Total Dietitians', value: counts.dietitians, icon: '🍽️', color: 'from-blue-400/10 to-transparent border-blue-400/20' },
          { label: 'System Admins', value: counts.admins, icon: '🛡️', color: 'from-red-500/10 to-transparent border-destructive/20' }
        ].map((stat, idx) => (
          <div key={idx} className={`glass bg-gradient-to-br ${stat.color} border p-5 rounded-2xl flex items-center justify-between`}>
            <div>
              <span className="text-[10px] text-muted font-black uppercase tracking-wider block">{stat.label}</span>
              <span className="text-xl font-black text-foreground mt-1.5 block">{stat.value}</span>
            </div>
            <div className="text-xl">{stat.icon}</div>
          </div>
        ))}
      </div>

      {/* User Management Panel */}
      <div className="glass p-6 rounded-3xl border border-card-border space-y-6">
        
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h3 className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck className="w-4.5 h-4.5 text-acid-green animate-pulse" />
              User RBAC Directory
            </h3>
            <p className="text-[10px] text-muted font-bold uppercase mt-0.5">List system registrations and adjust access privileges</p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface border border-card-border rounded-xl pl-9 pr-3 py-2 text-xs focus:border-acid-green focus:outline-none"
              />
            </div>

            <button
              onClick={() => rbac.getAdminUserList()}
              className="p-2.5 rounded-xl bg-surface border border-card-border hover:border-acid-green text-muted hover:text-foreground cursor-pointer transition-all shrink-0"
              title="Refresh Directory"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* User Data Table */}
        <div className="overflow-x-auto border border-card-border rounded-2xl">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-surface border-b border-card-border text-[9px] font-black uppercase tracking-wider text-muted">
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Registered Date</th>
                <th className="p-4">Role Privileges</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border text-xs">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-10 text-muted">No users found.</td>
                </tr>
              ) : (
                filteredUsers.map((item) => (
                  <tr key={item.uid} className="hover:bg-surface/20 transition-colors">
                    <td className="p-4 font-bold text-foreground">{item.name || 'Anonymous User'}</td>
                    <td className="p-4 font-semibold text-muted">{item.email}</td>
                    <td className="p-4 text-muted">{item.createdAt || 'N/A'}</td>
                    <td className="p-4">
                      <select
                        value={item.role || 'user'}
                        onChange={(e) => handleRoleChange(item.uid, e.target.value)}
                        className="bg-surface border border-card-border rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-acid-green cursor-pointer uppercase font-black tracking-wider"
                      >
                        <option value="user">User</option>
                        <option value="trainer">Trainer</option>
                        <option value="dietitian">Dietitian</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
