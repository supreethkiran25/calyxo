import React, { useState, useEffect } from 'react';
import { Bot, Cpu, ThumbsUp, ThumbsDown, MessageSquare, RefreshCw, Save, Sparkles, Terminal } from 'lucide-react';
import { toast } from 'sonner';
import { getAdminSettings, saveAdminSettings, getAdminTrainingLogs } from '../../services/adminService';
import { supabase } from '../../lib/supabaseClient';
import {
  AdminPageHeader,
  AdminStatCard,
  AdminLoadingSkeleton,
  AdminEmptyState
} from '../../components/admin/AdminUIPrimitives';

const AdminAIView = () => {
  const [model, setModel] = useState('gemini-2.0-flash');
  const [systemPrompt, setSystemPrompt] = useState(
    'You are Calyxo AI Coach, an elite, motivational, evidence-based fitness and nutrition assistant.'
  );
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [trainingLogs, setTrainingLogs] = useState([]);
  const [chatSessionCount, setChatSessionCount] = useState(0);

  const loadAiData = async () => {
    setLoading(true);
    try {
      const [settings, logs, sessionsRes] = await Promise.all([
        getAdminSettings(),
        getAdminTrainingLogs(),
        supabase.from('chat_sessions').select('*', { count: 'exact', head: true })
      ]);

      if (settings?.active_ai_model) setModel(settings.active_ai_model);
      if (settings?.ai_system_prompt) setSystemPrompt(settings.ai_system_prompt);
      setTrainingLogs(logs || []);
      if (sessionsRes?.count !== null) setChatSessionCount(sessionsRes.count || 0);
    } catch (err) {
      // Non-fatal error handling
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAiData();

    const channelLogs = supabase
      .channel('admin_ai_logs_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'TrainingLogs' }, () => loadAiData())
      .subscribe();

    const channelSessions = supabase
      .channel('admin_ai_sessions_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_sessions' }, () => loadAiData())
      .subscribe();

    return () => {
      supabase.removeChannel(channelLogs);
      supabase.removeChannel(channelSessions);
    };
  }, []);

  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      await saveAdminSettings({
        active_ai_model: model,
        ai_system_prompt: systemPrompt
      });
      toast.success('AI configuration saved successfully.');
    } catch (err) {
      toast.error('Failed to save AI configuration: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const positiveLogsCount = trainingLogs.filter(l => l.rating === 1).length;
  const ratingRate = trainingLogs.length > 0 ? Math.round((positiveLogsCount / trainingLogs.length) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <AdminPageHeader
        title="AI Engine & Neural Coach"
        description="Gemini LLM model configuration, system persona directives, token telemetry, and training reinforcement feedback logs."
        badge={model}
        actions={
          <button
            onClick={loadAiData}
            className="px-3.5 py-1.5 rounded-xl bg-[#141724] hover:bg-[#1a1f30] border border-white/10 text-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        }
      />

      {/* 2. Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard
          title="Chat Sessions"
          value={chatSessionCount.toLocaleString()}
          icon={MessageSquare}
          subtitle="Storage: chat_sessions"
        />
        <AdminStatCard
          title="Feedback Logs"
          value={trainingLogs.length.toString()}
          icon={ThumbsUp}
          subtitle={`Satisfaction: ${ratingRate}% positive`}
        />
        <AdminStatCard
          title="Active Model"
          value={model}
          icon={Cpu}
          subtitle="Provider: Google Gemini"
        />
        <AdminStatCard
          title="Engine Status"
          value="Operational"
          icon={Bot}
          subtitle="Realtime Streaming"
        />
      </div>

      {/* 3. Model Settings & System Prompt */}
      <div className="bg-[#0e121d] border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#d4ff00]/30 to-transparent" />
        
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#d4ff00]" /> Model & Persona Configuration
            </h3>
            <p className="text-xs text-slate-400 font-sans mt-0.5">Directives applied to all Calyxo AI coach endpoints</p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="text-slate-300 font-semibold block mb-1.5">Default Engine Model</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-[#141724] border border-white/10 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-[#d4ff00]/60 cursor-pointer"
            >
              <option value="gemini-2.0-flash">Gemini 2.0 Flash — Fast & Efficient (Production)</option>
              <option value="gemini-1.5-flash">Gemini 1.5 Flash — Balanced Speed & Quality</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro — Deep Analysis</option>
            </select>
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1.5">Global System Prompt Directive</label>
            <textarea
              rows="4"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="System prompt instruction sent to Gemini API..."
              className="w-full bg-[#141724] border border-white/10 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-[#d4ff00]/60 leading-relaxed font-sans text-xs"
            />
          </div>

          <div className="flex justify-end pt-2 border-t border-white/10">
            <button
              disabled={saving}
              onClick={handleSaveConfig}
              className="px-4 py-2 rounded-xl bg-[#d4ff00] hover:bg-[#a3e635] text-slate-950 font-bold text-xs transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-lg shadow-[#d4ff00]/10"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Training Logs Table */}
      <div className="bg-[#0e121d] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#090c14]">
          <h3 className="text-xs font-bold text-white tracking-tight flex items-center gap-2 uppercase">
            <MessageSquare className="w-3.5 h-3.5 text-[#d4ff00]" /> Training Logs ({trainingLogs.length})
          </h3>
        </div>

        {trainingLogs.length === 0 ? (
          <div className="p-12 text-center text-xs font-sans text-slate-400">
            No AI training or prompt evaluation logs recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-[#07090e] text-slate-400 font-semibold tracking-wider text-[11px] uppercase">
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">User Prompt</th>
                  <th className="p-4">Response Snippet</th>
                  <th className="p-4">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {trainingLogs.slice(0, 20).map((log, idx) => (
                  <tr key={idx} className="hover:bg-[#141828]/50 transition-colors">
                    <td className="p-4 font-mono text-slate-400 whitespace-nowrap text-[11px]">
                      {log.created_at ? new Date(log.created_at).toLocaleDateString() : 'Recent'}
                    </td>
                    <td className="p-4 text-white font-medium max-w-xs truncate">
                      {log.prompt || '--'}
                    </td>
                    <td className="p-4 text-slate-300 max-w-sm truncate">
                      {log.response || '--'}
                    </td>
                    <td className="p-4">
                      {log.rating === 1 ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-mono text-[11px]">
                          <ThumbsUp className="w-3 h-3" /> Positive
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-400 font-mono text-[11px]">
                          Neutral
                        </span>
                      )}
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

export default AdminAIView;
