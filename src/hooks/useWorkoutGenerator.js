import { useState, useCallback } from "react";
import { WORKOUTS_DB } from "../data/mockData";

export function useWorkoutGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateWorkout = useCallback((preferences) => {
    setIsGenerating(true);

    return new Promise((resolve) => {
      setTimeout(() => {
        const { goal, duration, equipment, muscleGroup } = preferences;

        let filtered = WORKOUTS_DB.filter(w => {
          const matchGoal = !goal || w.goal.includes(goal);
          const matchEquipment = equipment === "Any" || w.equipment === equipment;
          const matchMuscle = muscleGroup === "All" || w.muscle === muscleGroup;
          return matchGoal && matchEquipment && matchMuscle;
        });

        // Smart logic: Pick one compound, two isolation, one core/cardio
        const workout = [];
        const compounds = filtered.filter(w => w.difficulty === "Advanced" || w.difficulty === "Intermediate");
        const isolations = filtered.filter(w => w.difficulty === "Beginner");

        if (compounds.length > 0) workout.push(compounds[Math.floor(Math.random() * compounds.length)]);
        if (isolations.length > 0) workout.push(isolations[Math.floor(Math.random() * isolations.length)]);
        if (isolations.length > 1) workout.push(isolations[(Math.floor(Math.random() * (isolations.length - 1)) + 1)]);

        setIsGenerating(false);
        resolve(workout.filter(Boolean));
      }, 1500);
    });
  }, []);

  return { generateWorkout, isGenerating };
}
