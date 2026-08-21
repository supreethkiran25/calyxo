/**
 * Calyxo Production-Grade Event-Sourced Sync & Conflict Resolution Engine
 *
 * Provides:
 * 1. Immutable event outbox queue with idempotent deduplication keys.
 * 2. Entity-specific conflict resolution (Workouts, Hydration, Settings, Biometrics).
 * 3. Offline-first local durability with automatic reconnection synchronization.
 */

export const SYNC_OPERATIONS = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  APPEND_LOG: 'APPEND_LOG'
};

export const ENTITY_TYPES = {
  WORKOUT_LOG: 'WORKOUT_LOG',
  WATER_LOG: 'WATER_LOG',
  MEAL_LOG: 'MEAL_LOG',
  HEALTH_METRIC: 'HEALTH_METRIC',
  USER_SETTINGS: 'USER_SETTINGS',
  CHALLENGE_EVENT: 'CHALLENGE_EVENT'
};

/**
 * Creates an immutable sync event
 */
export function createSyncEvent({
  entityType,
  entityId,
  operation = SYNC_OPERATIONS.CREATE,
  payload = {},
  userId = 'anonymous',
  source = 'calyxo_client'
}) {
  const timestamp = Date.now();
  const eventId = `evt_${entityType}_${entityId}_${timestamp}_${Math.random().toString(36).substring(2, 7)}`;
  const dedupeKey = `${entityType}_${entityId}_${operation}_${payload?.date || Math.floor(timestamp / 1000)}`;

  return {
    eventId,
    dedupeKey,
    entityType,
    entityId,
    operation,
    payload,
    userId,
    source,
    timestamp,
    version: 1,
    syncStatus: 'PENDING', // PENDING | SYNCED | FAILED
    retryCount: 0,
    createdAt: new Date(timestamp).toISOString()
  };
}

/**
 * Conflict Resolution Strategy Matrix
 */
export const ConflictResolver = {
  /**
   * Workouts: Merges sets; preserves highest completed weight & reps per set
   */
  resolveWorkoutConflict(localWorkout, incomingWorkout) {
    if (!localWorkout) return incomingWorkout;
    if (!incomingWorkout) return localWorkout;

    const setMap = new Map();
    (localWorkout.sets || []).forEach((s, idx) => {
      const key = s.id || `set_${idx}`;
      setMap.set(key, s);
    });

    (incomingWorkout.sets || []).forEach((inSet, idx) => {
      const key = inSet.id || `set_${idx}`;
      if (!setMap.has(key)) {
        setMap.set(key, inSet);
      } else {
        const localSet = setMap.get(key);
        const localTonnage = (localSet.weight || 0) * (localSet.reps || 0);
        const inTonnage = (inSet.weight || 0) * (inSet.reps || 0);
        if (inTonnage >= localTonnage || inSet.completed) {
          setMap.set(key, { ...localSet, ...inSet });
        }
      }
    });

    return {
      ...localWorkout,
      ...incomingWorkout,
      sets: Array.from(setMap.values()),
      lastUpdatedAt: Math.max(localWorkout.lastUpdatedAt || 0, incomingWorkout.lastUpdatedAt || 0)
    };
  },

  /**
   * Hydration: Event-based additive merge with unique timestamp deduplication
   */
  resolveHydrationConflict(localEvents = [], incomingEvents = []) {
    const map = new Map();
    [...localEvents, ...incomingEvents].forEach((evt) => {
      const key = evt.id || `${evt.timestamp}_${evt.amount}`;
      if (!map.has(key)) {
        map.set(key, evt);
      }
    });
    return Array.from(map.values()).sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
  },

  /**
   * User Settings: Timestamp-ordered last write wins
   */
  resolveSettingsConflict(localSettings, incomingSettings) {
    const localTime = new Date(localSettings?.updatedAt || 0).getTime();
    const inTime = new Date(incomingSettings?.updatedAt || 0).getTime();
    return inTime >= localTime ? incomingSettings : localSettings;
  },

  /**
   * Biometric Health Metrics: Preserve multi-source readings without overwriting distinct hardware records
   */
  resolveBiometricConflict(localMetrics = [], incomingMetrics = []) {
    const map = new Map();
    [...localMetrics, ...incomingMetrics].forEach((m) => {
      const key = `${m.metricType}_${m.source}_${Math.floor((m.timestamp || 0) / 60000)}`;
      if (!map.has(key)) {
        map.set(key, m);
      }
    });
    return Array.from(map.values());
  },
  resolveBiometricsConflict(localMetrics = [], incomingMetrics = []) {
    return this.resolveBiometricConflict(localMetrics, incomingMetrics);
  }
};

/**
 * Outbox Sync Queue Manager
 */
export class OutboxSyncManager {
  constructor() {
    this.queue = [];
    this.isSyncing = false;
    this.listeners = [];
  }

  enqueue(event) {
    // Check if duplicate dedupeKey already exists in pending queue
    const exists = this.queue.some((e) => e.dedupeKey === event.dedupeKey);
    if (exists) {
      return false; // Deduplicated
    }

    this.queue.push(event);
    this.persistLocal();
    this.notify();
    return true;
  }

  queueEvent({ entityType, entityId, operation, payload, userId = 'user_default', source = 'app' }) {
    const event = createSyncEvent({
      entityType,
      entityId,
      operation,
      payload,
      userId,
      source
    });
    this.enqueue(event);
    return event;
  }

  getQueueLength() {
    return this.queue.length;
  }

  resolveConflict(entityType, localEntity, incomingEntity) {
    if (entityType === 'workouts') {
      return ConflictResolver.resolveWorkoutConflict(localEntity, incomingEntity);
    }
    if (entityType === 'hydration') {
      return ConflictResolver.resolveHydrationConflict(localEntity, incomingEntity);
    }
    if (entityType === 'settings') {
      return ConflictResolver.resolveSettingsConflict(localEntity, incomingEntity);
    }
    return ConflictResolver.resolveBiometricConflict(localEntity, incomingEntity);
  }

  getPendingCount() {
    return this.queue.length;
  }

  persistLocal() {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('calyxo_outbox_queue_v1', JSON.stringify(this.queue));
      } catch (e) {}
    }
  }

  restoreLocal() {
    if (typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem('calyxo_outbox_queue_v1');
        if (saved) this.queue = JSON.parse(saved);
      } catch (e) {
        this.queue = [];
      }
    }
  }

  async flush(syncHandler) {
    if (this.isSyncing || this.queue.length === 0 || (typeof navigator !== 'undefined' && !navigator.onLine)) {
      return;
    }

    this.isSyncing = true;
    const pending = [...this.queue];

    for (const evt of pending) {
      try {
        if (typeof syncHandler === 'function') {
          await syncHandler(evt);
        }
        // Remove successfully processed event
        this.queue = this.queue.filter((e) => e.eventId !== evt.eventId);
        this.persistLocal();
      } catch (err) {
        evt.retryCount = (evt.retryCount || 0) + 1;
        if (evt.retryCount > 5) {
          // Dead letter discard after 5 failed retries
          this.queue = this.queue.filter((e) => e.eventId !== evt.eventId);
        }
      }
    }

    this.isSyncing = false;
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach((l) => l({ pendingCount: this.queue.length, isSyncing: this.isSyncing }));
  }
}

export const syncManager = new OutboxSyncManager();
export const syncEngine = syncManager;
export default syncManager;
