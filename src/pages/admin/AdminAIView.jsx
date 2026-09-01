import React, { useState, useEffect } from 'react';
import { Bot, Cpu, ThumbsUp, ThumbsDown, MessageSquare, RefreshCw, Save } from 'lucide-react';
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
        title="AI Engine"
        description="Model runtime, system personas, context telemetry, and training feedback logs"
        badge={model}
        actions={
          <button
            onClick={loadAiData}
            className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-neutral-500 ${loading ? 'animate-spin' : ''}`} />
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
          subtitle="Total logged sessions"
        />
        <AdminStatCard
          title="Feedback Logs"
          value={trainingLogs.length.toString()}
          icon={ThumbsUp}
          subtitle={`${ratingRate}% positive rate`}
        />
        <AdminStatCard
          title="Active Model"
          value={model}
          icon={Cpu}
          subtitle="Google Gemini API"
        />
        <AdminStatCard
          title="Engine Status"
          value="Operational"
          icon={Bot}
          subtitle="Normal latency"
        />
      </div>

      {/* 3. Model Settings & System Prompt */}
      <div className="bg-neutral-900/90 border border-neutral-800/80 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
              <Cpu className="w-4 h-4 text-neutral-400" /> Model & Persona Configuration
            </h3>
            <p className="text-xs text-neutral-400 font-mono mt-0.5">Parameters applied to all Calyxo AI endpoints</p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="text-neutral-300 font-mono font-medium block mb-1.5">Default Engine Model</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-neutral-700 cursor-pointer"
            >
              <option value="gemini-2.0-flash">Gemini 2.0 Flash — Fast & Efficient</option>
              <option value="gemini-1.5-flash">Gemini 1.5 Flash — Balanced Speed & Quality</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro — Deep Analysis</option>
            </select>
          </div>

          <div>
            <label className="text-neutral-300 font-mono font-medium block mb-1.5">Global System Prompt</label>
            <textarea
              rows="4"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="System prompt instruction sent to Gemini API..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white focus:outline-none focus:border-neutral-700 leading-relaxed font-sans"
            />
          </div>

          <div className="flex justify-end pt-2 border-t border-neutral-800/80">
            <button
              disabled={saving}
              onClick={handleSaveConfig}
              className="px-3.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs border border-neutral-700 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5 text-neutral-400" />
              <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Training Logs Table */}
      <div className="bg-neutral-900/90 border border-neutral-800/80 rounded-xl overflow-hidden">
        <div className="p-3.5 border-b border-neutral-800/80 flex items-center justify-between">
          <h3 className="text-xs font-semibold text-white tracking-tight flex items-center gap-2 font-mono uppercase">
            <MessageSquare className="w-3.5 h-3.5 text-neutral-400" /> Training Logs ({trainingLogs.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          {trainingLogs.length === 0 ? (
            <AdminEmptyState
              title="No training feedback logs recorded yet"
              description="User evaluations from AI coach conversations will appear here."
            />
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 bg-neutral-950/60 text-neutral-400 font-mono uppercase text-[10px]">
                  <th className="p-3.5 font-bold">User Query</th>
                  <th className="p-3.5 font-bold">AI Response</th>
                  <th className="p-3.5 font-bold">Rating</th>
                  <th className="p-3.5 font-bold">User ID</th>
                  <th className="p-3.5 text-right font-bold">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-sans">
                {trainingLogs.map((log, idx) => (
                  <tr key={log.id || idx} className="hover:bg-neutral-800/40 transition-colors">
                    <td className="p-3.5 max-w-xs truncate text-white font-medium">{log.user_query}</td>
                    <td className="p-3.5 max-w-md truncate text-neutral-300">{log.bot_response}</td>
                    <td className="p-3.5">
                      {log.rating === 1 ? (
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-semibold px-2 py-0.5 rounded inline-flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3" /> Helpful
                        </span>
                      ) : (
                        <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-mono font-semibold px-2 py-0.5 rounded inline-flex items-center gap-1">
                          <ThumbsDown className="w-3 h-3" /> Improvement
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-neutral-400 max-w-[120px] truncate">{log.userId || log.user_id || 'Anonymous'}</td>
                    <td className="p-3.5 text-right font-mono text-[11px] text-neutral-500">
                      {log.timestamp || log.created_at ? new Date(log.timestamp || log.created_at).toLocaleString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAIView;

