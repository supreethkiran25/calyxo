import React, { useState, useEffect } from 'react';
import { Bot, Cpu, ThumbsUp, ThumbsDown, MessageSquare, RefreshCw, Camera } from 'lucide-react';
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
  const [scanStats, setScanStats] = useState({ totalScans: 0, scanAccuracy: 0 });

  const loadAiData = async () => {
    setLoading(true);
    try {
      const [settings, logs, sessionsRes, scanRes] = await Promise.all([
        getAdminSettings(),
        getAdminTrainingLogs(),
        supabase.from('chat_sessions').select('*', { count: 'exact', head: true }),
        supabase.from('nutrition_logs').select('scan_confidence', { count: 'exact' }).eq('scan_source', 'camera')
      ]);

      if (settings?.active_ai_model) setModel(settings.active_ai_model);
      if (settings?.ai_system_prompt) setSystemPrompt(settings.ai_system_prompt);
      setTrainingLogs(logs || []);
      if (sessionsRes?.count !== null) setChatSessionCount(sessionsRes.count || 0);

      const totalScans = scanRes.count || (scanRes.data ? scanRes.data.length : 0);
      const highConfScans = (scanRes.data || []).filter(r => r.scan_confidence === 'high').length;
      const scanAccuracy = totalScans > 0 ? Math.round((highConfScans / totalScans) * 100) : 0;
      setScanStats({ totalScans, scanAccuracy });
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight flex items-center gap-2">
            <Bot className="w-5 h-5 text-violet-400" /> AI Hub
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Model configuration, prompt settings, and training feedback
          </p>
        </div>
        <button
          onClick={loadAiData}
          className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-neutral-500 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-medium">
              Chat sessions
            </span>
            <MessageSquare className="w-4 h-4 text-neutral-600" />
          </div>
          <div className="text-2xl font-semibold text-violet-400">{chatSessionCount.toLocaleString()}</div>
          <div className="text-[11px] text-neutral-500">Total logged sessions</div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-medium">
              Feedback logs
            </span>
            <ThumbsUp className="w-4 h-4 text-neutral-600" />
          </div>
          <div className="text-2xl font-semibold text-violet-400">{trainingLogs.length}</div>
          <div className="text-[11px] text-neutral-500">{ratingRate}% positive rate</div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-medium">
              Active engine model
            </span>
            <Cpu className="w-4 h-4 text-neutral-600" />
          </div>
          <div className="text-sm font-medium text-white truncate mt-1">{model}</div>
          <div className="text-[11px] text-neutral-500">Google Gemini API</div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-medium">
              Food scans
            </span>
            <Camera className="w-4 h-4 text-neutral-600" />
          </div>
          <div className="text-2xl font-semibold text-white">{scanStats.totalScans}</div>
          <div className="text-[11px] text-neutral-500">{scanStats.scanAccuracy}% high confidence</div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-medium">
              Response latency
            </span>
            <Bot className="w-4 h-4 text-neutral-600" />
          </div>
          <div className="text-sm font-medium text-neutral-500 mt-1">Latency tracking coming soon</div>
          <div className="text-[11px] text-neutral-500">Telemetry engine</div>
        </div>
      </div>

      {/* Model Settings & System Prompt */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-neutral-500" /> Model & persona configuration
          </h3>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="text-neutral-300 font-medium block mb-1.5">Default AI engine model</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="gemini-2.0-flash">Gemini 2.0 Flash — Fast & efficient</option>
              <option value="gemini-1.5-flash">Gemini 1.5 Flash — Balanced speed & quality</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro — Deep analysis</option>
            </select>
          </div>

          <div>
            <label className="text-neutral-300 font-medium block mb-1.5">Global system prompt</label>
            <textarea
              rows="4"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="System prompt instruction sent to Gemini API..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none leading-relaxed"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              disabled={saving}
              onClick={handleSaveConfig}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save configuration'}
            </button>
          </div>
        </div>
      </div>

      {/* Training Logs Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-neutral-500" /> Training logs ({trainingLogs.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          {trainingLogs.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-600">
              No training feedback logs recorded yet
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-950 border-b border-neutral-800 text-[11px] uppercase tracking-wider text-neutral-500 font-medium">
                <tr>
                  <th className="p-4">User query</th>
                  <th className="p-4">AI response</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4">User ID</th>
                  <th className="p-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {trainingLogs.map((log, idx) => (
                  <tr key={log.id || idx} className="hover:bg-neutral-800/50 transition-colors">
                    <td className="p-4 max-w-xs truncate text-white font-medium">{log.user_query}</td>
                    <td className="p-4 max-w-md truncate text-neutral-300">{log.bot_response}</td>
                    <td className="p-4">
                      {log.rating === 1 ? (
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-medium px-2 py-0.5 rounded inline-flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3" /> Helpful
                        </span>
                      ) : (
                        <span className="bg-red-500/10 text-red-400 border border-red-500/20 text-[11px] font-medium px-2 py-0.5 rounded inline-flex items-center gap-1">
                          <ThumbsDown className="w-3 h-3" /> Needs improvement
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-mono text-[11px] text-neutral-400 max-w-[120px] truncate">{log.userId || log.user_id || 'Anonymous'}</td>
                    <td className="p-4 text-right font-mono text-[11px] text-neutral-500">
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
