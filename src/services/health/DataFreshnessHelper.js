/**
 * Calyxo Data Freshness Classification Utilities
 * Canonical Freshness States: LIVE, RECENT, STALE, UNAVAILABLE, ESTIMATED
 */

export const FRESHNESS_LEVELS = {
  LIVE: 'LIVE',
  RECENT: 'RECENT',
  FRESH: 'RECENT',
  AGING: 'AGING',
  STALE: 'STALE',
  UNAVAILABLE: 'UNAVAILABLE',
  ESTIMATED: 'ESTIMATED'
};

export const FRESHNESS_THRESHOLDS = {
  HEART_RATE: { live: 30 * 1000, fresh: 15 * 60 * 1000, stale: 60 * 60 * 1000 },
  STEPS: { fresh: 30 * 60 * 1000, stale: 2 * 60 * 60 * 1000 },
  ACTIVE_CALORIES: { fresh: 30 * 60 * 1000, stale: 2 * 60 * 60 * 1000 },
  SLEEP: { fresh: 24 * 60 * 60 * 1000, stale: 36 * 60 * 60 * 1000 },
  RECOVERY: { fresh: 12 * 60 * 60 * 1000, stale: 24 * 60 * 60 * 1000 },
  WATER: { fresh: 3 * 60 * 60 * 1000, stale: 12 * 60 * 60 * 1000 },
  BLOOD_PRESSURE: { fresh: 6 * 60 * 60 * 1000, stale: 24 * 60 * 60 * 1000 },
  DEFAULT: { fresh: 30 * 60 * 1000, stale: 4 * 60 * 60 * 1000 }
};

export function getMetricFreshness(metricType, timestamp, isEstimated = false) {
  return getFreshnessState(timestamp, metricType, isEstimated).status;
}

/**
 * Computes freshness classification for a given timestamp and metric
 */
export function getFreshnessState(timestamp, metricType = 'DEFAULT', isEstimated = false) {
  if (isEstimated) {
    return {
      status: 'ESTIMATED',
      label: 'Estimated',
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30'
    };
  }

  if (!timestamp) {
    return {
      status: 'UNAVAILABLE',
      label: 'No data available',
      color: 'text-muted bg-muted/10 border-card-border'
    };
  }

  const now = Date.now();
  const ageMs = Math.max(0, now - new Date(timestamp).getTime());
  const normalizedType = String(metricType || 'DEFAULT').toUpperCase();
  const thresholds = FRESHNESS_THRESHOLDS[normalizedType] || FRESHNESS_THRESHOLDS.DEFAULT;

  if (thresholds.live && ageMs <= thresholds.live) {
    return {
      status: 'LIVE',
      label: 'LIVE',
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
    };
  }

  if (ageMs <= thresholds.fresh) {
    const mins = Math.max(1, Math.floor(ageMs / 60000));
    return {
      status: 'RECENT',
      label: mins === 1 ? 'Just now' : `${mins}m ago`,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
    };
  }

  if (ageMs > thresholds.stale) {
    const hours = Math.floor(ageMs / 3600000);
    return {
      status: 'STALE',
      label: hours > 24 ? `Stale: ${Math.floor(hours / 24)}d ago` : `Stale: ${hours}h ago`,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30'
    };
  }

  const mins = Math.floor(ageMs / 60000);
  return {
    status: 'RECENT',
    label: `${mins}m ago`,
    color: 'text-muted bg-card-bg border-card-border'
  };
}
