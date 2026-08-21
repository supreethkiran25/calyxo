import React from 'react';
import { Activity, Clock, AlertCircle, Radio, Sparkles } from 'lucide-react';
import { getFreshnessState, FRESHNESS_THRESHOLDS, FRESHNESS_LEVELS } from '../../services/health/DataFreshnessHelper';

export { getFreshnessState, FRESHNESS_THRESHOLDS, FRESHNESS_LEVELS };

/**
 * DataFreshnessBadge Component
 * Canonical States: LIVE, RECENT, STALE, UNAVAILABLE, ESTIMATED
 */
export default function DataFreshnessBadge({
  source = 'Apple Health',
  timestamp,
  metricType = 'DEFAULT',
  isEstimated = false,
  statusOverride = null,
  className = '',
  showSource = true
}) {
  const freshness = statusOverride
    ? {
        status: statusOverride,
        label: statusOverride === 'ESTIMATED' ? 'Estimated' : statusOverride === 'LIVE' ? 'LIVE' : statusOverride,
        color:
          statusOverride === 'ESTIMATED'
            ? 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30'
            : statusOverride === 'LIVE'
            ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
            : statusOverride === 'STALE'
            ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
            : 'text-muted bg-muted/10 border-card-border'
      }
    : getFreshnessState(timestamp, metricType, isEstimated);

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-bold tracking-tight select-none ${freshness.color} ${className}`}
      title={
        freshness.status === 'ESTIMATED'
          ? 'Estimated value derived from verified algorithms'
          : timestamp
          ? `Last updated: ${new Date(timestamp).toLocaleTimeString()}`
          : 'No data recorded'
      }
    >
      {freshness.status === 'LIVE' ? (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
      ) : freshness.status === 'ESTIMATED' ? (
        <Sparkles className="w-3 h-3 text-indigo-400 flex-shrink-0" />
      ) : freshness.status === 'STALE' ? (
        <AlertCircle className="w-3 h-3 text-amber-400 flex-shrink-0" />
      ) : freshness.status === 'UNAVAILABLE' ? (
        <Radio className="w-3 h-3 text-muted flex-shrink-0" />
      ) : (
        <Clock className="w-3 h-3 text-emerald-400 flex-shrink-0" />
      )}

      <span>{freshness.label}</span>

      {showSource && source && (
        <>
          <span className="opacity-40">•</span>
          <span className="truncate max-w-[120px] font-medium">{source}</span>
        </>
      )}
    </div>
  );
}
