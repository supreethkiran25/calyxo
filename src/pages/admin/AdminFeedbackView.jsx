import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import { toast } from 'sonner';
import { getAdminFeedback, updateFeedbackStatus } from '../../services/adminService';
import { supabase } from '../../lib/supabaseClient';
import { useAdminRealtime } from '../../hooks/useAdminRealtime';
import {
  AdminPageHeader,
  AdminStatusBadge,
  AdminEmptyState,
  AdminLoadingSkeleton
} from '../../components/admin/AdminUIPrimitives';

const AdminFeedbackView = () => {
  const [feedback, setFeedback] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [replyModalData, setReplyModalData] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [targetStatus, setTargetStatus] = useState('Resolved');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchFeedback = useCallback(async () => {
    try {
      const list = await getAdminFeedback({ status: statusFilter });
      setFeedback(list || []);
    } catch (e) {
      toast.error('Failed to load feedback tickets.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  // Real-time updates
  useAdminRealtime(['user_feedback'], () => {
    fetchFeedback();
  });

  const handleSendReply = async () => {
    if (!replyModalData || !replyText.trim()) {
      toast.error('Please enter a response message.');
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
        // Fallback if edge function is not deployed
      }

      await updateFeedbackStatus(replyModalData.id, targetStatus, replyText);
      toast.success(`Ticket marked as ${targetStatus}.`);
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
      {/* 1. Header */}
      <AdminPageHeader
        title="Feedback & Support"
        description="Athlete support requests, bug reports, and customer resolution workflow"
        badge={`${feedback.length} tickets`}
        actions={
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-neutral-950 border border-neutral-800 text-neutral-300 text-xs font-mono rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-neutral-700 cursor-pointer"
          >
            <option value="">All Tickets</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        }
      />

      {/* 2. Tickets List */}
      <div className="space-y-3">
        {loading ? (
          <AdminLoadingSkeleton rows={4} />
        ) : feedback.length === 0 ? (
          <AdminEmptyState
            title="No support tickets match this filter"
            description="All athlete feedback and bug reports have been addressed."
          />
        ) : (
          feedback.map(fb => (
            <div key={fb.id} className="bg-neutral-900/90 border border-neutral-800/80 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                    {fb.type || 'Support'}
                  </span>
                  <h3 className="font-semibold text-white text-sm tracking-tight">{fb.title}</h3>
                </div>
                <AdminStatusBadge status={fb.status || 'Pending'} />
              </div>

              <div className="bg-neutral-950 rounded-lg p-3 text-xs text-neutral-300 leading-relaxed border border-neutral-800/80 font-sans">
                {fb.message}
              </div>

              {fb.reply && (
                <div className="bg-neutral-950/60 border border-neutral-800 rounded-lg p-3 space-y-1">
                  <span className="text-[10px] font-mono text-neutral-400 block uppercase">Admin Response ({fb.status}):</span>
                  <p className="text-xs text-neutral-300">{fb.reply}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 text-xs border-t border-neutral-800/60">
                <span className="text-neutral-500 font-mono text-[11px]">From: {fb.user || 'Athlete'} ({fb.email}) • {fb.created_at}</span>
                <button
                  onClick={() => { setReplyModalData(fb); setReplyText(fb.reply || ''); setTargetStatus('Resolved'); }}
                  className="bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded-lg px-3 py-1.5 transition-colors cursor-pointer"
                >
                  {fb.reply ? 'Update Response' : 'Reply & Resolve'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reply Modal */}
      {replyModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-semibold text-white">Reply to {replyModalData.user}</h3>
              <button onClick={() => setReplyModalData(null)} className="p-1 rounded-lg text-neutral-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-neutral-300 block">Status Update</label>
              <select
                value={targetStatus}
                onChange={(e) => setTargetStatus(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-neutral-700 font-mono cursor-pointer"
              >
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-neutral-300 block">Response Message</label>
              <textarea
                rows="4"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type response message..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-neutral-700 leading-relaxed font-sans"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
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
                className="bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded-lg px-4 py-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                {sending ? 'Saving...' : 'Send Response'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFeedbackView;

