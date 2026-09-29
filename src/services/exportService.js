// Calyxo Comprehensive Data Portability & Backup Engine
// Benchmarked against GymMane / Hevy data portability standards

import { supabase } from '../lib/supabaseClient.js';
import { isMockMode } from '../lib/dbService.js';

/**
 * Trigger file download helper
 */
function downloadFile(content, fileName, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * 1. Export Workouts as CSV (Hevy / GymMane compatible format)
 */
export function exportWorkoutsAsCsv(workoutLogs = []) {
  const headers = [
    'Date',
    'Workout Title',
    'Duration (min)',
    'Exercise Name',
    'Set Order',
    'Set Type',
    'Weight (kg)',
    'Reps',
    'RPE',
    'RIR',
    'Completed'
  ];

  const rows = [headers.join(',')];

  workoutLogs.forEach(w => {
    const dateStr = new Date(Number(w.timestamp) || Date.now()).toISOString().split('T')[0];
    const title = `"${(w.name || w.title || 'Workout').replace(/"/g, '""')}"`;
    const dur = Math.round(Number(w.duration) || 0);

    const exercises = Array.isArray(w.exercises) ? w.exercises : [];
    if (exercises.length === 0) {
      rows.push([dateStr, title, dur, '"General Exercise"', 1, 'Working', w.weight || 0, w.reps || 0, '', '', 'TRUE'].join(','));
      return;
    }

    exercises.forEach(ex => {
      const exName = `"${(ex.name || 'Exercise').replace(/"/g, '""')}"`;
      const sets = Array.isArray(ex.sets) ? ex.sets : [];
      if (sets.length === 0) {
        rows.push([dateStr, title, dur, exName, 1, 'Working', 0, 0, '', '', 'TRUE'].join(','));
        return;
      }

      sets.forEach((s, sIdx) => {
        rows.push([
          dateStr,
          title,
          dur,
          exName,
          sIdx + 1,
          s.type || 'Working',
          s.weight || 0,
          s.reps || 0,
          s.rpe || '',
          s.rir !== undefined ? s.rir : '',
          s.completed !== false ? 'TRUE' : 'FALSE'
        ].join(','));
      });
    });
  });

  const csvContent = rows.join('\n');
  const dateTag = new Date().toISOString().split('T')[0];
  downloadFile(csvContent, `calyxo_workouts_${dateTag}.csv`, 'text/csv;charset=utf-8;');
}

/**
 * 2. Export Nutrition as CSV
 */
export function exportNutritionAsCsv(foodLogs = []) {
  const headers = ['Date', 'Meal Slot', 'Food Item', 'Calories (kcal)', 'Protein (g)', 'Carbs (g)', 'Fat (g)'];
  const rows = [headers.join(',')];

  foodLogs.forEach(f => {
    const dateStr = new Date(Number(f.timestamp) || Date.now()).toISOString().split('T')[0];
    const slot = f.mealSlot || f.mealType || 'Meal';
    const name = `"${(f.name || 'Food').replace(/"/g, '""')}"`;
    rows.push([dateStr, slot, name, f.calories || 0, f.protein || 0, f.carbs || 0, f.fat || 0].join(','));
  });

  const csvContent = rows.join('\n');
  const dateTag = new Date().toISOString().split('T')[0];
  downloadFile(csvContent, `calyxo_nutrition_${dateTag}.csv`, 'text/csv;charset=utf-8;');
}

/**
 * 3. Export Weight & Measurements as CSV
 */
export function exportMeasurementsAsCsv(weightLogs = [], measurements = {}) {
  const headers = [
    'Date',
    'Weight (kg)',
    'Chest (cm)',
    'Waist (cm)',
    'Hips (cm)',
    'Neck (cm)',
    'Left Arm (cm)',
    'Right Arm (cm)',
    'Left Thigh (cm)',
    'Right Thigh (cm)',
    'Calves (cm)'
  ];
  const rows = [headers.join(',')];

  weightLogs.forEach(w => {
    const dateStr = new Date(Number(w.timestamp) || Date.now()).toISOString().split('T')[0];
    rows.push([
      dateStr,
      w.weight || '',
      measurements.chest || '',
      measurements.waist || '',
      measurements.hips || '',
      measurements.neck || '',
      measurements.leftArm || '',
      measurements.rightArm || '',
      measurements.leftThigh || '',
      measurements.rightThigh || '',
      measurements.calves || ''
    ].join(','));
  });

  const csvContent = rows.join('\n');
  const dateTag = new Date().toISOString().split('T')[0];
  downloadFile(csvContent, `calyxo_measurements_${dateTag}.csv`, 'text/csv;charset=utf-8;');
}

/**
 * 4. Export Complete Single JSON Backup
 */
export function exportFullBackupJson(data = {}) {
  const backupObject = {
    version: '2.0.0',
    exportedAt: new Date().toISOString(),
    platform: 'Calyxo Mobile OS',
    data: {
      userProfile: data.userProfile || {},
      workoutLogs: data.workoutLogs || [],
      foodLogs: data.foodLogs || [],
      weightLogs: data.weightLogs || [],
      waterIntake: data.waterIntake || 0,
      measurements: data.measurements || {},
      routines: data.routines || []
    }
  };

  const jsonStr = JSON.stringify(backupObject, null, 2);
  const dateTag = new Date().toISOString().split('T')[0];
  downloadFile(jsonStr, `calyxo_full_backup_${dateTag}.json`, 'application/json');
}

/**
 * 5. Import and Parse Full Backup JSON
 */
export function parseBackupJson(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || (!parsed.data && !parsed.workoutLogs)) {
      throw new Error('Invalid Calyxo backup file schema.');
    }
    return parsed.data || parsed;
  } catch (err) {
    throw new Error(`Failed to parse backup: ${err.message}`);
  }
}

/**
 * Legacy Fine-tuning export
 */
export async function exportTrainingLogs() {
  let logs = [];
  if (!isMockMode) {
    const { data, error } = await supabase.from('TrainingLogs').select('*').eq('rating', 1);
    if (error) throw error;
    logs = data || [];
  }
  exportTrainingLogsFromClient(logs);
}

export async function exportTrainingLogsFromClient(logs) {
  const positiveLogs = (logs || []).filter(log => log.rating === 1);
  const jsonlContent = positiveLogs.map(log => JSON.stringify({
    contents: [
      { role: "user", parts: [{ text: log.user_query }] },
      { role: "model", parts: [{ text: log.bot_response }] }
    ]
  })).join('\n');
  downloadFile(jsonlContent, 'calyxo_fine_tuning.jsonl', 'application/x-jsonlines');
}
