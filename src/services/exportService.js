// Export logs service — replaces /api/export-logs Next.js route
// Runs entirely client-side now

import { supabase } from '../lib/supabaseClient';

const isMockFirebase = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL === "https://mock.supabase.co";

export async function exportTrainingLogs() {
  let logs = [];

  if (!isMockFirebase) {
    const { data, error } = await supabase.from('TrainingLogs').select('*').eq('rating', 1);
    if (error) throw error;
    logs = data || [];
  }

  // Convert logs to Gemini JSONL format
  const jsonlContent = logs.map(log => JSON.stringify({
    contents: [
      { role: "user", parts: [{ text: log.user_query }] },
      { role: "model", parts: [{ text: log.bot_response }] }
    ]
  })).join('\n');

  // Trigger browser download
  const blob = new Blob([jsonlContent], { type: 'application/x-jsonlines' });
  const url = URL.createObjectURL(blob);
  const downloadAnchor = document.createElement('a');
  downloadAnchor.href = url;
  downloadAnchor.download = 'calyxo_fine_tuning.jsonl';
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  URL.revokeObjectURL(url);
}

export async function exportTrainingLogsFromClient(logs) {
  // Filter to only positive logs
  const positiveLogs = (logs || []).filter(log => log.rating === 1);

  // Convert logs to Gemini JSONL format
  const jsonlContent = positiveLogs.map(log => JSON.stringify({
    contents: [
      { role: "user", parts: [{ text: log.user_query }] },
      { role: "model", parts: [{ text: log.bot_response }] }
    ]
  })).join('\n');

  // Trigger browser download
  const blob = new Blob([jsonlContent], { type: 'application/x-jsonlines' });
  const url = URL.createObjectURL(blob);
  const downloadAnchor = document.createElement('a');
  downloadAnchor.href = url;
  downloadAnchor.download = 'calyxo_fine_tuning.jsonl';
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  URL.revokeObjectURL(url);
}
