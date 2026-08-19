import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner';

/**
 * Creates a real-time subscription listener for specific database tables
 * @param {Object} options
 * @param {Array<string>} options.tables - List of tables to listen to (e.g. ['user_profiles', 'subscriptions', 'admin_audit_logs', 'user_feedback'])
 * @param {Function} options.onPayload - Callback function triggered when a Postgres change occurs
 * @param {Function} options.onStatusChange - Callback function triggered when connection status changes
 * @param {boolean} options.showToasts - Whether to display toast notifications on key events (e.g. new user signup)
 * @returns {Function} Unsubscribe function
 */
export const subscribeToAdminRealtime = ({
  tables = ['user_profiles', 'subscriptions', 'admin_audit_logs', 'user_feedback'],
  onPayload = () => {},
  onStatusChange = () => {},
  showToasts = false
}) => {
  const channelName = `admin_realtime_${Math.random().toString(36).substring(2, 9)}`;
  let channel = supabase.channel(channelName);

  tables.forEach(tableName => {
    channel = channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: tableName },
      (payload) => {
        if (showToasts) {
          if (tableName === 'user_profiles' && payload.eventType === 'INSERT') {
            toast.info(`⚡ Realtime: New user registered (${payload.new?.email || 'New Athlete'})`);
          } else if (tableName === 'subscriptions' && (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE')) {
            if (payload.new?.status === 'Active' && payload.new?.plan === 'HIGH') {
              toast.success(`⚡ Realtime: High plan subscription activated!`);
            }
          } else if (tableName === 'user_feedback' && payload.eventType === 'INSERT') {
            toast.warning(`⚡ Realtime: New feedback submitted`);
          }
        }

        if (typeof onPayload === 'function') {
          onPayload(payload, tableName);
        }
      }
    );
  });

  channel.subscribe((status) => {
    if (typeof onStatusChange === 'function') {
      onStatusChange(status);
    }
  });

  return () => {
    supabase.removeChannel(channel);
  };
};
