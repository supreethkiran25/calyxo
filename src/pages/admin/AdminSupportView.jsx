import React, { useState, useEffect } from 'react';
import { MessageSquare, CheckCircle, Clock, AlertCircle, Plus, Send, X, User } from 'lucide-react';
import { toast } from 'sonner';
import { getAdminFeedback, updateFeedbackStatus, createSupportTicketAdmin } from '../../services/adminService';
import { AdminPageHeader, AdminStatusBadge, AdminLoadingSkeleton } from '../../components/admin/AdminUIPrimitives';

const AdminSupportView = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [newTicketModal, setNewTicketModal] = useState(false);
  const [newTicketForm, setNewTicketForm] = useState({
    title: '',
    message: '',
    user_email: '',
    user_name: '',
    type: 'Support'
  });

  const fetchTickets = async () => {
    try {
      const data = await getAdminFeedback();
      setTickets(data || []);
      if (!selectedTicket && data && data.length > 0) {
        setSelectedTicket(data[0]);
        setReplyText(data[0].reply || '');
      }
    } catch (e) {
      console.warn('Error loading support tickets:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedTicket) return;
    try {
      await updateFeedbackStatus(selectedTicket.id, newStatus, replyText);
      toast.success(`Ticket marked as ${newStatus}`);
      setSelectedTicket({ ...selectedTicket, status: newStatus, reply: replyText });
      fetchTickets();
    } catch (e) {
      toast.error('Failed to update ticket status.');
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!newTicketForm.title || !newTicketForm.message) return;
    try {
      await createSupportTicketAdmin(newTicketForm);
      toast.success('Support ticket created.');
      setNewTicketModal(false);
      setNewTicketForm({ title: '', message: '', user_email: '', user_name: '', type: 'Support' });
      fetchTickets();
    } catch (err) {
      toast.error('Failed to create ticket: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Support & Feedback Operations"
        description="Athlete help inquiries, bug reports, and resolution response workflows."
        badge={`${tickets.length} Inquiries`}
        actions={
          <button
            onClick={() => setNewTicketModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-[#d4ff00] hover:bg-[#a3e635] text-slate-950 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-[#d4ff00]/10"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Ticket</span>
          </button>
        }
      />

      {/* Grid: Tickets List & Active Ticket Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Tickets Queue */}
        <div className="lg:col-span-1 bg-[#0e121d] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-4 border-b border-white/10 bg-[#090c14]">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Ticket Queue</h4>
          </div>

          {loading ? (
            <div className="p-4"><AdminLoadingSkeleton rows={5} /></div>
          ) : tickets.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No support tickets filed.
            </div>
          ) : (
            <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto scrollbar-thin">
              {tickets.map(t => {
                const isSelected = selectedTicket?.id === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => { setSelectedTicket(t); setReplyText(t.reply || ''); }}
                    className={`p-4 transition-colors cursor-pointer text-xs space-y-1.5 ${
                      isSelected ? 'bg-[#181d30] border-l-4 border-[#d4ff00]' : 'hover:bg-[#141828]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white truncate max-w-[160px]">{t.title}</span>
                      <AdminStatusBadge status={t.status || 'Open'} />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>{t.user_name || t.user_email}</span>
                      <span className="font-mono text-slate-500">{t.type}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Active Ticket Resolution Inspector */}
        <div className="lg:col-span-2 bg-[#0e121d] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-5">
          {selectedTicket ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">{selectedTicket.title}</h3>
                    <AdminStatusBadge status={selectedTicket.status || 'Open'} />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Submitted by <strong className="text-slate-200">{selectedTicket.user_name || 'Athlete'}</strong> ({selectedTicket.user_email})
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUpdateStatus('Resolved')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Mark Resolved
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('Closed')}
                    className="px-3 py-1.5 rounded-xl bg-[#141724] hover:bg-[#1a1f30] text-slate-300 border border-white/10 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Close Ticket
                  </button>
                </div>
              </div>

              {/* Message Content */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Inquiry Body</span>
                <div className="p-4 bg-[#141724] border border-white/5 rounded-xl text-slate-200 text-xs leading-relaxed">
                  {selectedTicket.message}
                </div>
              </div>

              {/* Communication & Reply Box */}
              <div className="space-y-3 pt-4 border-t border-white/10">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Official Admin Reply</span>
                <textarea
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type official reply to athlete..."
                  className="w-full bg-[#141724] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#d4ff00]/60 font-sans"
                />
                <div className="flex justify-end">
                  <button
                    onClick={() => handleUpdateStatus('In Progress')}
                    className="px-4 py-2 bg-[#d4ff00] hover:bg-[#a3e635] text-slate-950 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-[#d4ff00]/10"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send & Save Response</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="py-24 text-center text-slate-400">
              Select a support ticket from the queue to view and resolve.
            </div>
          )}
        </div>
      </div>

      {/* New Ticket Modal */}
      {newTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-[#090c14] border border-white/15 rounded-2xl p-6 space-y-4 shadow-2xl text-slate-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white">Create Support Ticket</h3>
              <button onClick={() => setNewTicketModal(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Subject / Issue Title</label>
                <input
                  type="text"
                  required
                  value={newTicketForm.title}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, title: e.target.value })}
                  className="w-full bg-[#141724] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#d4ff00]/60"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Athlete Email</label>
                  <input
                    type="email"
                    required
                    value={newTicketForm.user_email}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, user_email: e.target.value })}
                    className="w-full bg-[#141724] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#d4ff00]/60"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Athlete Name</label>
                  <input
                    type="text"
                    value={newTicketForm.user_name}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, user_name: e.target.value })}
                    className="w-full bg-[#141724] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#d4ff00]/60"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Detailed Message</label>
                <textarea
                  rows={3}
                  required
                  value={newTicketForm.message}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, message: e.target.value })}
                  className="w-full bg-[#141724] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#d4ff00]/60"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setNewTicketModal(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-[#d4ff00] text-slate-950 font-bold hover:bg-[#a3e635] shadow-lg shadow-[#d4ff00]/10"
                >
                  File Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSupportView;
