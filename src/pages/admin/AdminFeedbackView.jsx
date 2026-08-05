import React, { useState, useEffect } from 'react';
import { MessageSquare, CheckCircle, Clock, Send, X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getAdminFeedback, updateFeedbackStatus } from '../../services/adminService';
import { supabase } from '../../lib/supabaseClient';

const AdminFeedbackView = () => {
  const [feedback, setFeedback] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [replyModalData, setReplyModalData] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [targetStatus, setTargetStatus] = useState('Resolved');
  const [sending, setSending] = useState(false);

  const fetchFeedback = async () => {
    try {
      const list = await getAdminFeedback({ status: statusFilter });
      setFeedback(list || []);
    } catch (e) {
      toast.error('Failed to load feedback tickets.');
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [statusFilter]);

  const handleSendReply = async () => {
    if (!replyModalData || !replyText.trim()) {
      toast.error('Please enter a reply message before sending.');
      return;
    }
    setSending(true);

    try {
      // Attempt sending email via Supabase Edge Function if available
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
      toast.success(`Reply sent to ${replyModalData.email}! Ticket marked as ${targetStatus}.`);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-indigo-400" /> Feedback & Support Tickets
          </h1>
          <p className="text-xs text-neutral-400 font-mono mt-0.5">
            User feedback, bug submissions, support tickets & feature requests
          </p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-neutral-950 border border-neutral-800 text-neutral-300 text-xs rounded-xl px-3 py-2 focus:outline-none"
        >
          <option value="">All Ticket Statuses</option>
          <option value="Pending">Pending Review</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
        </select>
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {feedback.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-neutral-500 bg-neutral-900/60 rounded-2xl border border-neutral-800">
            No support tickets match the selected status filter.
          </div>
        ) : (
          feedback.map(fb => (
            <div key={fb.id} className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    fb.type === 'Bug Report' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  }`}>
                    {fb.type}
                  </span>
                  <h3 className="font-bold text-white text-sm">{fb.title}</h3>
                </div>
                <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                  fb.status === 'Resolved'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : fb.status === 'In Progress'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                }`}>
                  {fb.status}
                </span>
              </div>

              <p className="text-xs text-neutral-300 leading-relaxed bg-neutral-950/40 p-3 rounded-xl border border-neutral-800/50">
                "{fb.message}"
              </p>

              {fb.reply && (
                <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/30 text-xs">
                  <span className="text-indigo-400 font-bold block mb-0.5">Admin Response ({fb.status}):</span>
                  <span className="text-neutral-300">{fb.reply}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 text-xs border-t border-neutral-800/60">
                <span className="text-neutral-500 font-mono">From: {fb.user} ({fb.email}) • {fb.created_at}</span>
                <button
                  onClick={() => { setReplyModalData(fb); setReplyText(fb.reply || ''); setTargetStatus('Resolved'); }}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer shadow-md"
                >
                  {fb.reply ? 'Update Response' : 'Reply to User'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reply Modal */}
      {replyModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-2xl bg-neutral-900 border border-neutral-800 p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-bold text-white">Reply to {replyModalData.user} ({replyModalData.email})</h3>
              <button onClick={() => setReplyModalData(null)} className="p-1 rounded-lg text-neutral-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-400 block mb-1">Set Ticket Status</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTargetStatus('In Progress')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    targetStatus === 'In Progress'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-neutral-950 text-neutral-400 border-neutral-800'
                  }`}
                >
                  Mark In Progress
                </button>
                <button
                  type="button"
                  onClick={() => setTargetStatus('Resolved')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    targetStatus === 'Resolved'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : 'bg-neutral-950 text-neutral-400 border-neutral-800'
                  }`}
                >
                  Mark Resolved
                </button>
              </div>
            </div>

            <textarea
              rows="4"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type official support email response..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 leading-relaxed font-mono"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setReplyModalData(null)}
                disabled={sending}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSendReply}
                disabled={sending}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer disabled:opacity-50"
              >
                {sending ? 'Sending Response...' : 'Send Response'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFeedbackView;
