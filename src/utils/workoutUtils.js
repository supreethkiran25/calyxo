/**
 * Helper to calculate estimated calories burned for workout entries
 * based on category, duration, sets, reps, and weight.
 */
export const calculateWorkoutCaloriesBurned = (item) => {
  if (!item) return 0;
  if (item.caloriesBurned && Number(item.caloriesBurned) > 0) {
    return Number(item.caloriesBurned);
  }
  
  const category = item.category || 'Strength';
  const sets = Number(item.sets) || 1;
  const reps = Number(item.reps) || 1;
  const weight = Number(item.weight) || 0;
  const duration = Number(item.duration) || 0;

  if (category === 'Cardio') {
    const mins = duration > 0 ? duration : (sets * reps * 0.5) || 15;
    return Math.round(mins * 8.5);
  } else {
    const baseSetBurn = 14 * sets;
    const repBurn = reps * 0.4 * sets;
    const weightBurn = weight > 0 ? (weight * 0.08 * sets) : 0;
    return Math.max(30, Math.round(baseSetBurn + repBurn + weightBurn));
  }
};
