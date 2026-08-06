import React, { useState } from 'react';
import { X, Bell, Send } from 'lucide-react';
import { sendAdminNotification } from '../../services/adminService';

const NotificationComposerModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    audience: 'Everyone',
    cta_label: 'View feature',
    cta_link: '/user/dashboard',
    image_url: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await sendAdminNotification(formData);
      if (typeof onSuccess === 'function') onSuccess();
      onClose();
    } catch (err) {
      console.error('[NotificationComposerModal] Error broadcasting notification:', err);
      setError(err.message || 'Failed to broadcast notification. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Bell className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">Broadcast notification</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-neutral-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="text-neutral-400 font-medium block mb-1">Audience</label>
            <div className="grid grid-cols-3 gap-2">
              {['Everyone', 'Premium Users', 'Free Users'].map(aud => (
                <button
                  key={aud}
                  type="button"
                  onClick={() => setFormData({ ...formData, audience: aud })}
                  className={`py-1.5 rounded-lg font-medium transition-colors border cursor-pointer ${
                    formData.audience === aud
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      : 'bg-neutral-950 text-neutral-400 border-neutral-800'
                  }`}
                >
                  {aud}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-neutral-400 font-medium block mb-1">Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Notification title..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-neutral-400 font-medium block mb-1">Body</label>
            <textarea
              rows="3"
              required
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              placeholder="Notification message body..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-neutral-400 font-medium block mb-1">CTA label</label>
              <input
                type="text"
                value={formData.cta_label}
                onChange={(e) => setFormData({ ...formData, cta_label: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-neutral-400 font-medium block mb-1">Deep link</label>
              <input
                type="text"
                value={formData.cta_link}
                onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-neutral-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" /> Send broadcast
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NotificationComposerModal;
