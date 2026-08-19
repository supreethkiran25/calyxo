import { useEffect, useState, useRef, useCallback } from 'react';
import { subscribeToAdminRealtime } from '../services/adminRealtimeService';

/**
 * Custom hook to integrate Supabase Realtime into Admin components safely
 * with ref-based callback persistence and debounce protection to prevent infinite loops.
 * 
 * @param {Array<string>} tables - Array of table names to listen to
 * @param {Function} onDataChange - Callback function when payload changes occur
 * @param {boolean} showToasts - Enable toast alerts for real-time changes
 */
export const useAdminRealtime = (tables = ['user_profiles', 'subscriptions', 'admin_audit_logs'], onDataChange, showToasts = false) => {
  const [status, setStatus] = useState('CONNECTING'); // 'CONNECTED' | 'CONNECTING' | 'CLOSED'
  const [lastEvent, setLastEvent] = useState(null);

  // Store onDataChange in a ref so inline callbacks never trigger reconnect loops
  const onDataChangeRef = useRef(onDataChange);
  useEffect(() => {
    onDataChangeRef.current = onDataChange;
  }, [onDataChange]);

  // Debounce ref to prevent multiple rapid database re-fetches
  const debounceTimerRef = useRef(null);

  const stableTablesKey = Array.isArray(tables) ? [...tables].sort().join(',') : String(tables);

  const handlePayload = useCallback((payload, tableName) => {
    setLastEvent({ payload, tableName, timestamp: Date.now() });

    if (typeof onDataChangeRef.current === 'function') {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        if (typeof onDataChangeRef.current === 'function') {
          onDataChangeRef.current(payload, tableName);
        }
      }, 350);
    }
  }, []);

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
    const tableList = stableTablesKey.split(',').filter(Boolean);
    if (tableList.length === 0) return;

    const unsubscribe = subscribeToAdminRealtime({
      tables: tableList,
      onPayload: handlePayload,
      onStatusChange: handleStatusChange,
      showToasts
    });

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      unsubscribe();
    };
  }, [stableTablesKey, handlePayload, handleStatusChange, showToasts]);

  return { status, lastEvent, isConnected: status === 'CONNECTED' };
};

export default useAdminRealtime;
