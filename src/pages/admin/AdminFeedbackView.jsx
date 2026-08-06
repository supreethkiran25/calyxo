import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { toast } from 'sonner';
import { getAdminFeedback, updateFeedbackStatus } from '../../services/adminService';
import { supabase } from '../../lib/supabaseClient';
import { useAdminRealtime } from '../../hooks/useAdminRealtime';

const AdminFeedbackView = () => {
  const [feedback, setFeedback] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [replyModalData, setReplyModalData] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [targetStatus, setTargetStatus] = useState('Resolved');
  const [sending, setSending] = useState(false);

  const fetchFeedback = useCallback(async () => {
    try {
      const list = await getAdminFeedback({ status: statusFilter });
      setFeedback(list || []);
    } catch (e) {
      toast.error('Failed to load feedback tickets.');
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  // Subscribe to realtime feedback tickets
  useAdminRealtime(['user_feedback'], () => {
    fetchFeedback();
  });

  const handleSendReply = async () => {
    if (!replyModalData || !replyText.trim()) {
      toast.error('Please enter a reply message before sending.');
      return;
    }
    setSending(true);

    try {
      try {
        await supabase.functions.invoke('send-reply-email', {
          body: {
            feedbackEmail: replyModalData.email,
            replyText,
            feedbackTitle: replyModalData.title
          }
        });
      } catch (edgeErr) {
        // Fallback: non-fatal if edge function is not configured
      }

      await updateFeedbackStatus(replyModalData.id, targetStatus, replyText);
      toast.success(`Reply sent. Ticket marked as ${targetStatus}.`);
      setReplyModalData(null);
      setReplyText('');
      fetchFeedback();
    } catch (err) {
      toast.error('Failed to send reply: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">Feedback and support</h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Support tickets and user-reported issues
          </p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-neutral-950 border border-neutral-800 text-neutral-300 text-xs rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none self-start sm:self-auto"
        >
          <option value="">All status filters</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
        </select>
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {feedback.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-neutral-500 bg-neutral-900 rounded-xl border border-neutral-800">
            No support tickets match the selected status filter.
          </div>
        ) : (
          feedback.map(fb => (
            <div key={fb.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${
                    fb.type === 'Bug Report'
                      ? 'bg-red-500/10 text-red-400 border-red-500/20'
                      : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  }`}>
                    {fb.type}
                  </span>
                  <h3 className="font-semibold text-white text-sm">{fb.title}</h3>
                </div>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${
                  fb.status === 'Resolved'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : fb.status === 'In Progress'
                    ? 'bg-violet-500/10 text-violet-400 border-violet-500/20'
                    : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                }`}>
                  {fb.status}
                </span>
              </div>

              <div className="bg-neutral-950 rounded-lg p-3 text-xs text-neutral-300 leading-relaxed border border-neutral-800">
                {fb.message}
              </div>

              {fb.reply && (
                <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3 space-y-1">
                  <span className="text-[11px] text-blue-400 font-medium block">Admin response ({fb.status}):</span>
                  <p className="text-xs text-neutral-300">{fb.reply}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 text-xs border-t border-neutral-800">
                <span className="text-neutral-500 font-mono text-[11px]">From: {fb.user} ({fb.email}) • {fb.created_at}</span>
                <button
                  onClick={() => { setReplyModalData(fb); setReplyText(fb.reply || ''); setTargetStatus('Resolved'); }}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg px-3 py-1.5 transition-colors cursor-pointer"
                >
                  {fb.reply ? 'Update response' : 'Reply & resolve'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reply Modal */}
      {replyModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-semibold text-white">Reply to {replyModalData.user}</h3>
              <button onClick={() => setReplyModalData(null)} className="p-1 rounded-lg text-neutral-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-300 block">Status update</label>
              <select
                value={targetStatus}
                onChange={(e) => setTargetStatus(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-300 block">Response message</label>
              <textarea
                rows="4"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type response message..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-xs text-white focus:border-blue-500 focus:outline-none leading-relaxed"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setReplyModalData(null)}
                disabled={sending}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSendReply}
                disabled={sending}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg px-4 py-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                {sending ? 'Sending...' : 'Send response'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFeedbackView;
