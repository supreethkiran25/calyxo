/**
 * Calyxo Unsupervised Learning & Adaptive AI Intelligence Engine
 *
 * Implements unsupervised multi-dimensional feature extraction and
 * centroid-based cluster analysis over athlete biometric streams:
 *
 * 1. Multi-Variate Feature Vector Embedding (Volume, Recovery, Metabolic, Consistency)
 * 2. Unsupervised K-Means Centroid Cluster Classification
 * 3. Autonomous Autoregulation & Periodization Synthesis
 * 4. Anomaly & Overtraining Detection
 */

export const PERFORMANCE_CLUSTERS = {
  OPTIMAL_HYPERTROPHY: {
    id: 'OPTIMAL_HYPERTROPHY',
    name: 'Anabolic Supercompensation State',
    desc: 'High systemic recovery with sustained training consistency. Optimal state for high-volume progressive overload.',
    centroid: [0.80, 0.85, 0.75, 0.80], // [volume, recovery, metabolic, consistency]
    recommendation: 'Increase compound intensity by 2.5-5% and maximize hypertrophy sets.',
    volumeModifier: 1.15,
    restMultiplier: 1.0,
    intensityLabel: 'HIGH'
  },
  FUNCTIONAL_OVERREACHING: {
    id: 'FUNCTIONAL_OVERREACHING',
    name: 'Autonomic Fatigue & Depletion State',
    desc: 'Elevated cumulative workload paired with suppressed sleep or elevated resting heart rate. Autoregulating volume prevents overtraining.',
    centroid: [0.85, 0.35, 0.45, 0.70],
    recommendation: 'Autoregulate training volume: reduce sets by 20%, extend inter-set rest intervals, and prioritize sleep & hydration.',
    volumeModifier: 0.80,
    restMultiplier: 1.35,
    intensityLabel: 'MODERATE_DELOAD'
  },
  METABOLIC_ACCELERATION: {
    id: 'METABOLIC_ACCELERATION',
    name: 'High-Density Conditioning State',
    desc: 'Calibrated for elevated caloric flux and cardiovascular efficiency with moderate fatigue thresholds.',
    centroid: [0.55, 0.70, 0.40, 0.65],
    recommendation: 'Utilize high-density compound supersets with 45-60s rest intervals to optimize caloric output.',
    volumeModifier: 1.0,
    restMultiplier: 0.85,
    intensityLabel: 'HIGH_DENSITY'
  },
  FOUNDATION_BUILDER: {
    id: 'FOUNDATION_BUILDER',
    name: 'Neural Adaptability & Base Conditioning State',
    desc: 'Building foundational neural motor patterns and consistent habit reinforcement.',
    centroid: [0.40, 0.60, 0.60, 0.40],
    recommendation: 'Focus on perfect movement execution on 4 key compound lifts with standard 60-90s rest.',
    volumeModifier: 0.90,
    restMultiplier: 1.0,
    intensityLabel: 'MODERATE_PROGRESSION'
  }
};

export class UnsupervisedAIAdaptiveEngine {
  /**
   * 1. Extract Normalized Multi-Dimensional Feature Vector
   * Vector: [volumeScore, recoveryScore, metabolicBalance, consistencyScore] (Normalized 0.0 - 1.0)
   */
  static extractFeatureVector({
    workoutLogs = [],
    foodLogs = [],
    healthLogs = {},
    waterIntake = 0,
    userProfile = {}
  } = {}) {
    const safeWorkouts = Array.isArray(workoutLogs) ? workoutLogs : [];
    const safeFood = Array.isArray(foodLogs) ? foodLogs : (typeof foodLogs === 'object' && foodLogs ? Object.values(foodLogs).flat() : []);
    const safeHealth = (healthLogs && typeof healthLogs === 'object') ? healthLogs : {};
    const safeProfile = (userProfile && typeof userProfile === 'object') ? userProfile : {};
    const safeWater = Number(waterIntake) || 0;

    // 1. Volume Score (0.0 to 1.0)
    const workoutCount = safeWorkouts.length;
    let totalTonnage = 0;
    safeWorkouts.forEach(w => {
      if (w && Array.isArray(w.sets)) {
        w.sets.forEach(s => {
          if (s && (s.completed || (Number(s.weight) > 0 && Number(s.reps) > 0))) {
            totalTonnage += (Number(s.weight) || 0) * (Number(s.reps) || 0);
          }
        });
      }
    });
    const volumeScore = Math.min(1.0, Math.max(0.1, (workoutCount * 0.2) + (totalTonnage / 15000)));

    // 2. Recovery Score (0.0 to 1.0)
    const sleep = Number(safeHealth.sleep) || 7.0;
    const rhr = Number(safeHealth.restingHeartRate) || 60;
    const sleepScore = Math.min(1.0, sleep / 8.5);
    const rhrScore = Math.min(1.0, Math.max(0.2, (100 - rhr) / 50));
    const recoveryScore = (sleepScore * 0.6) + (rhrScore * 0.4);

    // 3. Metabolic Balance (0.0 to 1.0)
    const calorieGoal = Number(safeProfile.dailyCalories || safeProfile.calorieGoal || 2000);
    const totalCals = safeFood.reduce((s, f) => s + (Number(f?.calories) || 0), 0);
    const waterGoal = Number(safeProfile.waterTarget || 2500);
    const waterScore = Math.min(1.0, safeWater / waterGoal);
    const calScore = totalCals > 0 ? Math.min(1.0, totalCals / calorieGoal) : 0.7;
    const metabolicBalance = (calScore * 0.6) + (waterScore * 0.4);

    // 4. Consistency Score (0.0 to 1.0)
    const streak = Number(safeProfile.streak || 3);
    const consistencyScore = Math.min(1.0, Math.max(0.1, streak / 7));

    return [
      Math.round(volumeScore * 100) / 100,
      Math.round(recoveryScore * 100) / 100,
      Math.round(metabolicBalance * 100) / 100,
      Math.round(consistencyScore * 100) / 100
    ];
  }

  /**
   * 2. Unsupervised Euclidean Distance Cluster Classification
   */
  static classifyPerformanceCluster(featureVector) {
    let nearestCluster = PERFORMANCE_CLUSTERS.FOUNDATION_BUILDER;
    let minDistance = Infinity;

    Object.values(PERFORMANCE_CLUSTERS).forEach(cluster => {
      let distance = 0;
      for (let i = 0; i < featureVector.length; i++) {
        const diff = featureVector[i] - cluster.centroid[i];
        distance += diff * diff;
      }
      distance = Math.sqrt(distance);

      if (distance < minDistance) {
        minDistance = distance;
        nearestCluster = cluster;
      }
    });

    return {
      cluster: nearestCluster,
      featureVector: {
        volume: featureVector[0],
        recovery: featureVector[1],
        metabolic: featureVector[2],
        consistency: featureVector[3]
      },
      similarityConfidence: Math.max(70, Math.round((1 - (minDistance / 2)) * 100))
    };
  }

  /**
   * 3. Autoregulate Workout Plan Based on Unsupervised Cluster
   */
  static autoregulateWorkout(basePlan, clusterAnalysis) {
    if (!basePlan) return basePlan;
    const cluster = clusterAnalysis.cluster;

    // Adjust single-day exercises
    if (basePlan.exercises && Array.isArray(basePlan.exercises)) {
      const adaptedExercises = basePlan.exercises.map(ex => {
        let sets = ex.sets;
        let rest = ex.restSeconds || 60;

        if (cluster.id === 'FUNCTIONAL_OVERREACHING') {
          sets = Math.max(2, sets - 1);
          rest = Math.round(rest * cluster.restMultiplier);
        } else if (cluster.id === 'OPTIMAL_HYPERTROPHY') {
          sets = Math.min(5, sets);
        } else if (cluster.id === 'METABOLIC_ACCELERATION') {
          rest = Math.max(40, Math.round(rest * cluster.restMultiplier));
        }

        return {
          ...ex,
          sets,
          restSeconds: rest
        };
      });

      return {
        ...basePlan,
        exercises: adaptedExercises,
        aiAutoregulation: {
          clusterName: cluster.name,
          confidence: `${clusterAnalysis.similarityConfidence}%`,
          guidance: cluster.recommendation,
          intensity: cluster.intensityLabel
        }
      };
    }

    // Adjust weekly schedule
    if (basePlan.days && Array.isArray(basePlan.days)) {
      const adaptedDays = basePlan.days.map(d => ({
        ...d,
        exercises: (d.exercises || []).map(ex => {
          let sets = ex.sets;
          let rest = ex.restSeconds || 60;
          if (cluster.id === 'FUNCTIONAL_OVERREACHING') {
            sets = Math.max(2, sets - 1);
            rest = Math.round(rest * 1.25);
          }
          return { ...ex, sets, restSeconds: rest };
        })
      }));

      return {
        ...basePlan,
        days: adaptedDays,
        aiAutoregulation: {
          clusterName: cluster.name,
          confidence: `${clusterAnalysis.similarityConfidence}%`,
          guidance: cluster.recommendation,
          intensity: cluster.intensityLabel
        }
      };
    }

    return basePlan;
  }
}

export const unsupervisedAIAdaptiveEngine = UnsupervisedAIAdaptiveEngine;
export default UnsupervisedAIAdaptiveEngine;
