import React, { useState, useEffect } from 'react';
import { MessageSquare, CheckCircle, Clock, Send, X } from 'lucide-react';
import { getAdminFeedback, updateFeedbackStatus } from '../../services/adminService';

const AdminFeedbackView = () => {
  const [feedback, setFeedback] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [replyModalData, setReplyModalData] = useState(null);
  const [replyText, setReplyText] = useState('');

  const fetchFeedback = async () => {
    const list = await getAdminFeedback({ status: statusFilter });
    setFeedback(list);
  };

  useEffect(() => {
    fetchFeedback();
  }, [statusFilter]);

  const handleSendReply = async () => {
    if (!replyModalData || !replyText) return;
    await updateFeedbackStatus(replyModalData.id, 'Resolved', replyText);
    alert(`Reply sent directly to ${replyModalData.email}! Ticket resolved.`);
    setReplyModalData(null);
    setReplyText('');
    fetchFeedback();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
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
          <option value="Resolved">Resolved</option>
        </select>
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {feedback.map(fb => (
          <div key={fb.id} className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  fb.type === 'Bug Report' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                }`}>
                  {fb.type}
                </span>
                <h3 className="font-bold text-white text-sm">{fb.title}</h3>
              </div>
              <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full ${
                fb.status === 'Resolved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'
              }`}>
                {fb.status}
              </span>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed bg-neutral-950/40 p-3 rounded-xl border border-neutral-800/50">
              "{fb.message}"
            </p>

            {fb.reply && (
              <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/30 text-xs">
                <span className="text-indigo-400 font-bold block mb-0.5">Admin Response:</span>
                <span className="text-neutral-300">{fb.reply}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 text-xs border-t border-neutral-800/60">
              <span className="text-neutral-500 font-mono">From: {fb.user} ({fb.email}) • {fb.created_at}</span>
              {fb.status === 'Pending' && (
                <button
                  onClick={() => { setReplyModalData(fb); setReplyText(''); }}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                >
                  Reply & Resolve
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Reply Modal */}
      {replyModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-2xl bg-neutral-900 border border-neutral-800 p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-bold text-white">Reply to {replyModalData.user}</h3>
              <button onClick={() => setReplyModalData(null)}><X className="w-4 h-4 text-neutral-400" /></button>
            </div>
            <textarea
              rows="4"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your official reply..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setReplyModalData(null)} className="px-4 py-2 text-xs text-neutral-400">Cancel</button>
              <button onClick={handleSendReply} className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl">Send Reply</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFeedbackView;
