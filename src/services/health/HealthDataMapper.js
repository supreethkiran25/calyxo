/**
 * Calyxo Native Health Data Integration - Data Mapper & Idempotent Deduplicator
 * Maps Apple HealthKit & Android Health Connect records into Calyxo schemas
 */

export class HealthDataMapper {
  /**
   * Map OS workout category to Calyxo workout schema
   */
  static mapWorkoutCategory(rawType = '') {
    const t = String(rawType).toLowerCase().trim();
    if (t.includes('walk')) return { category: 'Activity', typeName: 'Walking' };
    if (t.includes('run') || t.includes('jog')) return { category: 'Cardio', typeName: 'Running' };
    if (t.includes('cycl') || t.includes('bike')) return { category: 'Cardio', typeName: 'Cycling' };
    if (t.includes('swim')) return { category: 'Cardio', typeName: 'Swimming' };
    if (t.includes('strength') || t.includes('gym') || t.includes('weight') || t.includes('lift')) return { category: 'Workout History', typeName: 'Strength Training' };
    if (t.includes('yoga') || t.includes('stretch') || t.includes('pilates')) return { category: 'Mobility', typeName: 'Yoga & Flexibility' };
    if (t.includes('hiit') || t.includes('crossfit')) return { category: 'Cardio', typeName: 'HIIT Session' };
    return { category: 'Activity', typeName: 'General Exercise' };
  }

  /**
   * Normalize platform workout record into Calyxo schema with unique platformRecordId
   */
  static normalizeWorkoutRecord(rawRecord = {}, platformName = 'Apple Health') {
    const { category, typeName } = this.mapWorkoutCategory(rawRecord.type || rawRecord.workoutType);
    
    // Idempotent record ID combining platform, date timestamp, and type
    const recordId = rawRecord.id || rawRecord.platformRecordId || `hk_${platformName.replace(/\s+/g, '').toLowerCase()}_${rawRecord.timestamp || Date.now()}_${typeName.replace(/\s+/g, '').toLowerCase()}`;

    return {
      id: recordId,
      platformRecordId: recordId,
      title: rawRecord.title || rawRecord.name || `${typeName} (${platformName})`,
      type: typeName,
      category,
      durationMin: Number(rawRecord.durationMin || rawRecord.duration || 30),
      caloriesBurned: Math.round(Number(rawRecord.caloriesBurned || rawRecord.calories || 150)),
      avgHeartRate: rawRecord.avgHeartRate ? Math.round(Number(rawRecord.avgHeartRate)) : null,
      startTime: rawRecord.startTime || 'Logged',
      endTime: rawRecord.endTime || 'Logged',
      timestamp: Number(rawRecord.timestamp) || Date.now(),
      source: rawRecord.source || platformName,
      importedAt: Date.now()
    };
  }

  /**
   * Filter out duplicate workouts that already exist in Calyxo database or cache
   */
  static filterDuplicateWorkouts(incoming = [], existing = []) {
    const existingIds = new Set(existing.map(w => w.platformRecordId || w.id));
    return incoming.filter(w => !existingIds.has(w.platformRecordId || w.id));
  }
}
