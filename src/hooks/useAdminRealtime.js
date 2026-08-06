import { useEffect, useState, useCallback } from 'react';
import { subscribeToAdminRealtime } from '../services/adminRealtimeService';

/**
 * Custom hook to integrate Supabase Realtime into Admin components
 * @param {Array<string>} tables - Array of table names to listen to
 * @param {Function} onDataChange - Callback function when payload changes occur
 * @param {boolean} showToasts - Enable toast alerts for real-time changes
 */
export const useAdminRealtime = (tables = ['user_profiles', 'subscriptions', 'admin_audit_logs'], onDataChange, showToasts = false) => {
  const [status, setStatus] = useState('CONNECTING'); // 'CONNECTED' | 'CONNECTING' | 'CLOSED'
  const [lastEvent, setLastEvent] = useState(null);

  const handlePayload = useCallback((payload, tableName) => {
    setLastEvent({ payload, tableName, timestamp: Date.now() });
    if (typeof onDataChange === 'function') {
      onDataChange(payload, tableName);
    }
  }, [onDataChange]);

  const handleStatusChange = useCallback((channelStatus) => {
    if (channelStatus === 'SUBSCRIBED') {
      setStatus('CONNECTED');
    } else if (channelStatus === 'CLOSED' || channelStatus === 'CHANNEL_ERROR') {
      setStatus('CLOSED');
    } else {
      setStatus('CONNECTING');
    }
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToAdminRealtime({
      tables,
      onPayload: handlePayload,
      onStatusChange: handleStatusChange,
      showToasts
    });

    return () => {
      unsubscribe();
    };
  }, [tables.join(','), handlePayload, handleStatusChange, showToasts]);

  return { status, lastEvent, isConnected: status === 'CONNECTED' };
};

export default useAdminRealtime;
