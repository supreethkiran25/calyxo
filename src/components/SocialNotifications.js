import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Heart, MessageCircle, UserPlus, Check, CheckCircle2, Star, Trophy, Loader2 } from 'lucide-react';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../lib/socialService';

export default function SocialNotifications({ currentUserId, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchNotifs = async () => {
      setLoading(true);
      const data = await getNotifications(currentUserId);
      
      // Mock data if empty for demonstration
      const displayData = data.length > 0 ? data : [
        { id: '1', type: 'like', text: 'Sarah liked your post', read: false, timestamp: Date.now() - 1000 * 60 * 5, user: { username: 'sarahfit' } },
        { id: '2', type: 'comment', text: 'Mike commented on your workout', read: false, timestamp: Date.now() - 1000 * 60 * 30, user: { username: 'mike_lifts' } },
        { id: '3', type: 'follow', text: 'Alex started following you', read: true, timestamp: Date.now() - 1000 * 60 * 60 * 2, user: { username: 'alex_run' } },
        { id: '4', type: 'club_invite', text: 'You were invited to "Morning Runners"', read: true, timestamp: Date.now() - 1000 * 60 * 60 * 24, user: { username: 'admin' } },
      ];

      if (mounted) {
        setNotifications(displayData);
        setLoading(false);
      }
    };
    fetchNotifs();
    return () => { mounted = false; };
  }, [currentUserId]);

  const handleMarkRead = async (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    await markNotificationRead(currentUserId, id);
  };

  const handleMarkAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    await markAllNotificationsRead(currentUserId);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'like': return <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />;
      case 'comment': return <MessageCircle className="w-4 h-4 text-blue-500 fill-blue-500" />;
      case 'follow': return <UserPlus className="w-4 h-4 text-acid-green" />;
      case 'club_invite': return <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />;
      case 'achievement': return <Trophy className="w-4 h-4 text-orange-500" />;
      default: return <Bell className="w-4 h-4 text-muted" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="absolute top-16 right-4 w-80 md:w-96 max-h-[80vh] bg-surface border border-card-border rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50">
      
      {/* Header */}
      <div className="p-4 border-b border-card-border flex items-center justify-between glass sticky top-0">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-acid-green text-accent-foreground text-[10px] font-bold">
              {unreadCount} new
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button 
              onClick={handleMarkAllRead}
              className="p-1.5 rounded-lg hover:bg-white/5 text-acid-green transition-colors"
              title="Mark all as read"
            >
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-2">
        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-6 h-6 text-muted animate-spin" />
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-1">
            <AnimatePresence>
              {notifications.map((notif) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => !notif.read && handleMarkRead(notif.id)}
                  className={`w-full flex items-start gap-3 p-3 rounded-xl transition-colors ${
                    notif.read ? 'opacity-70 hover:bg-surface/50' : 'bg-surface border border-acid-green/20 hover:border-acid-green/50 cursor-pointer'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-card-border shrink-0 flex items-center justify-center overflow-hidden">
                    {notif.user?.photoURL ? (
                      <img src={notif.user.photoURL} alt="" className="w-full h-full object-cover" />
                    ) : (
                      getIcon(notif.type)
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${notif.read ? 'text-muted' : 'text-foreground font-semibold'}`}>
                      {notif.text}
                    </p>
                    <p className="text-[10px] font-medium text-muted mt-1">
                      {new Date(notif.timestamp).toLocaleString()}
                    </p>
                  </div>
                  
                  {!notif.read && (
                    <div className="w-2 h-2 rounded-full bg-acid-green shrink-0 mt-2" />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center text-muted">
            <Bell className="w-10 h-10 mb-4 opacity-20" />
            <p className="text-xs font-medium">No notifications yet.</p>
          </div>
        )}
      </div>

    </div>
  );
}
