import React, { useState, useEffect } from 'react';
import { Bot, Sparkles, Cpu, Clock, DollarSign, CheckCircle, AlertTriangle, ThumbsUp, ThumbsDown, MessageSquare, Database, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { getAdminSettings, saveAdminSettings, getAdminTrainingLogs } from '../../services/adminService';
import { supabase } from '../../lib/supabaseClient';

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

    // Split realtime channels for logs and sessions
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
      toast.success('AI Configuration & System Prompt successfully saved live!');
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Bot className="w-6 h-6 text-purple-400" /> AI System, Models & Self-Training Hub
          </h1>
          <p className="text-xs text-neutral-400 font-mono mt-0.5">
            Configure Gemini AI engine, monitor live token volume, system prompt & user feedback ratings
          </p>
        </div>
        <button
          onClick={loadAiData}
          className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 text-purple-400 ${loading ? 'animate-spin' : ''}`} /> Refresh Telemetry
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
          <span className="text-xs text-neutral-400 font-medium block">Total User Chat Sessions</span>
          <span className="text-2xl font-bold text-purple-400 block mt-1">{chatSessionCount.toLocaleString()}</span>
          <span className="text-[10px] text-neutral-500 font-mono mt-1 block">Live Supabase Storage</span>
        </div>
        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
          <span className="text-xs text-neutral-400 font-medium block">AI Training Ratings Logged</span>
          <span className="text-2xl font-bold text-emerald-400 block mt-1">{trainingLogs.length}</span>
          <span className="text-[10px] text-neutral-500 font-mono mt-1 block">{ratingRate}% Positive Feedback Rate</span>
        </div>
        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
          <span className="text-xs text-neutral-400 font-medium block">Active Engine Model</span>
          <span className="text-sm font-bold text-indigo-400 block mt-1 font-mono truncate">{model}</span>
          <span className="text-[10px] text-neutral-500 font-mono mt-1 block">Google Gemini API</span>
        </div>
        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
          <span className="text-xs text-neutral-400 font-medium block">Average Response Latency</span>
          <span className="text-sm font-bold text-amber-400 block mt-1 font-mono">Latency tracking coming soon</span>
          <span className="text-[10px] text-neutral-500 font-mono mt-1 block">Real-time Telemetry</span>
        </div>
      </div>

      {/* Model Settings & System Prompt */}
      <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-purple-400" /> Active AI Model & Global Persona Configuration
          </h3>
          <span className="text-xs text-purple-400 font-mono bg-purple-500/10 px-2.5 py-1 rounded border border-purple-500/20">
            Live Settings Engine
          </span>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="text-neutral-300 font-bold uppercase tracking-wider block mb-1.5">Default AI Engine Model</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-purple-500"
            >
              <option value="gemini-2.0-flash">Gemini 2.0 Flash — Fastest & Lowest Latency</option>
              <option value="gemini-1.5-flash">Gemini 1.5 Flash — Balanced Speed & Quality</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro — Deep Analysis & Long Context</option>
            </select>
          </div>

          <div>
            <label className="text-neutral-300 font-bold uppercase tracking-wider block mb-1.5">Global System Prompt Instruction</label>
            <textarea
              rows="4"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="System prompt instruction sent to Gemini API..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white font-mono focus:outline-none focus:border-purple-500 leading-relaxed"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              disabled={saving}
              onClick={handleSaveConfig}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-purple-500/20 cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Saving Settings...' : 'Save AI Configuration'}
            </button>
          </div>
        </div>
      </div>

      {/* AI Self-Training & Feedback Logs Table */}
      <div className="rounded-3xl bg-neutral-900/60 border border-neutral-800/80 overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-purple-400" /> AI Coach Self-Training Logs ({trainingLogs.length})
          </h3>
          <span className="text-xs text-neutral-400 font-mono">User Ratings & Query Telemetry</span>
        </div>

        <div className="overflow-x-auto">
          {trainingLogs.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-400 font-mono">
              No training feedback logs recorded yet. User 👍 / 👎 ratings will appear here in real time.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-950/80 border-b border-neutral-800 text-neutral-400 font-mono uppercase text-[11px]">
                <tr>
                  <th className="p-4 font-bold">User Query</th>
                  <th className="p-4 font-bold">AI Coach Response</th>
                  <th className="p-4 font-bold">Feedback Rating</th>
                  <th className="p-4 font-bold">User ID</th>
                  <th className="p-4 font-bold text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-mono">
                {trainingLogs.map((log, idx) => (
                  <tr key={log.id || idx} className="hover:bg-neutral-800/40 transition-colors">
                    <td className="p-4 font-sans max-w-xs truncate text-white font-medium">{log.user_query}</td>
                    <td className="p-4 font-sans max-w-md truncate text-neutral-300">{log.bot_response}</td>
                    <td className="p-4">
                      {log.rating === 1 ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1 w-max">
                          <ThumbsUp className="w-3 h-3" /> Helpful (1)
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold flex items-center gap-1 w-max">
                          <ThumbsDown className="w-3 h-3" /> Needs Improvement (0)
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-neutral-400 max-w-[120px] truncate">{log.userId || log.user_id || 'Anonymous'}</td>
                    <td className="p-4 text-right text-neutral-500">
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
