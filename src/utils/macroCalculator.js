/**
 * Utility for computing accurate BMI, BMR, TDEE, Calorie Goals, and Macro Targets
 * supporting both Metric (kg/cm) and Imperial (lbs/inches) unit systems.
 */

export function calculateMacroTargets(params = {}) {
  const {
    weight = 70,
    height = 175,
    age = 25,
    gender = 'male',
    activity = 1.55,
    goal = 'lose',
    units = 'metric'
  } = params;

  const numWeight = Number(weight) || 70;
  const numHeight = Number(height) || 175;
  const numAge = Math.max(Number(age) || 25, 10);
  const numActivity = Number(activity) || 1.55;

  const isImperial = units === 'imperial';
  const wkg = isImperial ? numWeight / 2.20462 : numWeight;
  const hcm = isImperial ? numHeight * 2.54 : numHeight;

  const hm = hcm / 100;
  const bmi = hm > 0 ? Number((wkg / (hm * hm)).toFixed(1)) : 22.0;

  let bmiStatus = 'Normal Weight';
  if (bmi < 18.5) bmiStatus = 'Underweight';
  else if (bmi >= 25 && bmi < 30) bmiStatus = 'Overweight';
  else if (bmi >= 30) bmiStatus = 'Obese';

  let bodyType = 'Mesomorph';
  if (bmi < 18.5) bodyType = 'Ectomorph';
  else if (bmi < 25) bodyType = bmi < 21 ? 'Ectomorph' : 'Mesomorph';
  else bodyType = 'Endomorph';

  let bmrRaw = gender === 'male'
    ? (10 * wkg) + (6.25 * hcm) - (5 * numAge) + 5
    : (10 * wkg) + (6.25 * hcm) - (5 * numAge) - 161;

  const bmr = Math.max(Math.round(bmrRaw), 800);
  const tdee = Math.round(bmr * numActivity);

  let calorieGoal = tdee;
  const isLoss = goal === 'lose' || goal === 'lose_body_fat' || goal === 'fat_loss';
  const isGain = goal === 'gains' || goal === 'build_muscle' || goal === 'muscle_gain' || goal === 'get_stronger';

  if (isLoss) calorieGoal = tdee - 500;
  else if (isGain) calorieGoal = tdee + 350;

  const minCals = gender === 'male' ? 1500 : 1200;
  calorieGoal = Math.max(calorieGoal, minCals);

  // Protein multiplier: 2.2g/kg if high_protein or gain, else 2.0g/kg
  const proteinMultiplier = (params.nutritionPriority === 'high_protein' || isGain) ? 2.2 : 2.0;
  const protein = Math.min(Math.max(Math.round(wkg * proteinMultiplier), 60), 260);
  // Fat: 25% of calories divided by 9 cal/g (30g - 150g)
  const fat = Math.min(Math.max(Math.round((calorieGoal * 0.25) / 9), 30), 150);
  // Carbs: Remaining calories / 4 cal/g (minimum 50g)
  const carbs = Math.max(Math.round((calorieGoal - (protein * 4) - (fat * 9)) / 4), 50);

  return {
    bmi,
    bmiStatus,
    bodyType,
    bmr,
    tdee,
    calorieGoal,
    dailyCalories: calorieGoal,
    protein,
    proteinTarget: protein,
    carbs,
    fat,
    targetMacros: { protein, carbs, fat },
    wkg: Number(wkg.toFixed(1)),
    hcm: Number(hcm.toFixed(1))
  };
}

/**
 * Universal Nutrition Value Formatter across Browser, PWA, and Mobile.
 * Rules:
 * - Calories: Always whole numbers (e.g. 0, 125, 1532), never 125.0 or 125.00
 * - Macros (protein, carbs, fat, fiber):
 *   - Integer if mathematically whole (e.g. 24.0 -> "24", 0 -> "0")
 *   - 1 decimal place if fractional (e.g. 24.500 -> "24.5", 12.25 -> "12.3")
 */
export function formatNutritionValue(val, isCalorie = false) {
  const num = Number(val) || 0;
  if (num === 0) return '0';
  if (isCalorie) return String(Math.round(num));
  const rounded = Math.round(num * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

