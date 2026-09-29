import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Search, X, Filter, Dumbbell, Play, Plus, ChevronRight, User, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { loadExercisesData, searchAndRankExercises, getExerciseImage } from '../../utils/exerciseSearch';
import InteractiveBodyMap from './InteractiveBodyMap';
import ExerciseDetailModal from './ExerciseDetailModal';
import { Chip, EmptyState } from '../../design-system/components/UIPrimitives';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const MUSCLE_FILTERS = [
  { id: 'all', label: 'All Muscles' },
  { id: 'chest', label: 'Chest' },
  { id: 'back', label: 'Back' },
  { id: 'shoulders', label: 'Shoulders' },
  { id: 'biceps', label: 'Biceps' },
  { id: 'triceps', label: 'Triceps' },
  { id: 'quads', label: 'Quads' },
  { id: 'hamstrings', label: 'Hamstrings' },
  { id: 'glutes', label: 'Glutes' },
  { id: 'abs', label: 'Abs & Core' },
  { id: 'calves', label: 'Calves' }
];

const EQUIPMENT_FILTERS = [
  { id: 'all', label: 'All Equipment' },
  { id: 'barbell', label: 'Barbell' },
  { id: 'dumbbell', label: 'Dumbbell' },
  { id: 'body weight', label: 'Bodyweight' },
  { id: 'cable', label: 'Cable' },
  { id: 'machine', label: 'Machine' },
  { id: 'kettlebell', label: 'Kettlebell' }
];

const DIFFICULTY_FILTERS = [
  { id: 'all', label: 'All Levels' },
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' }
];

export default function ExerciseLibraryBrowser({
  onSelectExercise = null,
  onAddToWorkout = null,
  onStartExercise = null,
  selectionMode = false // if true, picking for workout
}) {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('all');
  const [selectedEquipment, setSelectedEquipment] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [showBodyMap, setShowBodyMap] = useState(false);
  const [activeExerciseDetail, setActiveExerciseDetail] = useState(null);

  const triggerHaptic = useCallback(async (style = ImpactStyle.Light) => {
    try {
      if (Capacitor.isNativePlatform()) {
        await Haptics.impact({ style });
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    let mounted = true;
    loadExercisesData().then(data => {
      if (mounted) {
        setExercises(data || []);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, []);

  // Handle muscle selection from Interactive Body Map
  const handleBodyMapSelectMuscle = (slug) => {
    if (!slug) {
      setSelectedMuscle('all');
    } else {
      // Map anatomical slug to search muscle filter
      const s = slug.toLowerCase();
      if (s.includes('chest')) setSelectedMuscle('chest');
      else if (s.includes('deltoid')) setSelectedMuscle('shoulders');
      else if (s.includes('bicep')) setSelectedMuscle('biceps');
      else if (s.includes('tricep')) setSelectedMuscle('triceps');
      else if (s.includes('lats') || s.includes('trap')) setSelectedMuscle('back');
      else if (s.includes('quad')) setSelectedMuscle('quads');
      else if (s.includes('hamstring')) setSelectedMuscle('hamstrings');
      else if (s.includes('glute')) setSelectedMuscle('glutes');
      else if (s.includes('abs') || s.includes('oblique')) setSelectedMuscle('abs');
      else if (s.includes('calf') || s.includes('calves')) setSelectedMuscle('calves');
      else setSelectedMuscle(slug);
    }
  };

  // Filter exercises
  const filteredExercises = useMemo(() => {
    let list = exercises;

    // Search query ranking
    if (searchQuery.trim().length > 0) {
      list = searchAndRankExercises(searchQuery, exercises);
    }

    // Muscle filtering
    if (selectedMuscle !== 'all') {
      const targetM = selectedMuscle.toLowerCase();
      list = list.filter(ex => {
        const bodyPart = (ex.body_part || '').toLowerCase();
        const target = (ex.target || '').toLowerCase();
        const category = (ex.category || '').toLowerCase();
        const name = (ex.name || '').toLowerCase();
        return bodyPart.includes(targetM) || target.includes(targetM) || category.includes(targetM) || name.includes(targetM);
      });
    }

    // Equipment filtering
    if (selectedEquipment !== 'all') {
      const eq = selectedEquipment.toLowerCase();
      list = list.filter(ex => {
        const itemEq = (ex.equipment || '').toLowerCase();
        return itemEq.includes(eq);
      });
    }

    // Difficulty filtering
    if (selectedDifficulty !== 'all') {
      const diff = selectedDifficulty.toLowerCase();
      list = list.filter(ex => {
        const itemDiff = (ex.difficulty || '').toLowerCase();
        return itemDiff.includes(diff);
      });
    }

    return list;
  }, [exercises, searchQuery, selectedMuscle, selectedEquipment, selectedDifficulty]);

  return (
    <div className="space-y-4 w-full">
      {/* Search Bar & Body Map Toggle */}
      <div className="flex gap-2">
        <div className="flex-1 relative flex items-center">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search 1,300+ exercises (e.g. Bench Press, Squat, Pull Up)..."
            className="w-full min-h-[46px] pl-10 pr-9 rounded-2xl bg-surface border border-card-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-accent transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 p-1 text-muted-foreground hover:text-foreground cursor-pointer border-none bg-transparent"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            triggerHaptic();
            setShowBodyMap(prev => !prev);
          }}
          className={`min-h-[46px] px-3.5 rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            showBodyMap
              ? 'bg-accent text-accent-foreground border-accent shadow-sm'
              : 'bg-surface text-muted-foreground border-card-border hover:text-foreground'
          }`}
        >
          <User className="w-4 h-4" />
          <span className="hidden sm:inline">Body Map</span>
        </button>
      </div>

      {/* Interactive Body Map Collapsible */}
      <AnimatePresence>
        {showBodyMap && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <InteractiveBodyMap
              selectedMuscle={selectedMuscle !== 'all' ? selectedMuscle : null}
              onSelectMuscle={handleBodyMapSelectMuscle}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Muscle Filter Chips */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {MUSCLE_FILTERS.map(m => (
          <Chip
            key={m.id}
            label={m.label}
            selected={selectedMuscle === m.id}
            onClick={() => setSelectedMuscle(m.id)}
          />
        ))}
      </div>

      {/* Secondary Equipment Filter Chips */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {EQUIPMENT_FILTERS.map(eq => (
          <Chip
            key={eq.id}
            label={eq.label}
            selected={selectedEquipment === eq.id}
            onClick={() => setSelectedEquipment(eq.id)}
          />
        ))}
      </div>

      {/* Exercise Count & Active Filter Indicator */}
      <div className="flex items-center justify-between text-xs text-muted-foreground font-mono px-1">
        <span>
          {filteredExercises.length} {filteredExercises.length === 1 ? 'exercise' : 'exercises'} found
        </span>
        {(selectedMuscle !== 'all' || selectedEquipment !== 'all' || selectedDifficulty !== 'all' || searchQuery) && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedMuscle('all');
              setSelectedEquipment('all');
              setSelectedDifficulty('all');
            }}
            className="text-accent hover:underline cursor-pointer font-bold"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Exercise List */}
      {loading ? (
        <div className="p-8 text-center text-muted-foreground font-mono text-xs">
          Loading exercise database...
        </div>
      ) : filteredExercises.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="No Exercises Found"
          description="Try broadening your search query or resetting your equipment and muscle filters."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchQuery('');
            setSelectedMuscle('all');
            setSelectedEquipment('all');
            setSelectedDifficulty('all');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {filteredExercises.slice(0, 50).map((exercise) => {
            const imgUrl = getExerciseImage(exercise) || exercise.gif_url || exercise.image;
            return (
              <div
                key={exercise.id || exercise.name}
                onClick={() => {
                  triggerHaptic();
                  if (onSelectExercise) {
                    onSelectExercise(exercise);
                  } else {
                    setActiveExerciseDetail(exercise);
                  }
                }}
                className="p-3 rounded-2xl bg-surface border border-card-border hover:border-card-border/80 flex items-center justify-between gap-3 cursor-pointer transition-all active:scale-[0.99] group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Thumbnail */}
                  <div className="w-12 h-12 rounded-xl bg-black border border-card-border/60 overflow-hidden shrink-0 flex items-center justify-center">
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={exercise.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      <Dumbbell className="w-5 h-5 text-accent" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-foreground capitalize truncate group-hover:text-accent transition-colors">
                      {exercise.name}
                    </h4>
                    <p className="text-[11px] text-muted-foreground capitalize mt-0.5 truncate font-mono">
                      {exercise.target || exercise.body_part} • {exercise.equipment || 'Bodyweight'}
                    </p>
                  </div>
                </div>

                {/* Quick Add or Chevron */}
                {onAddToWorkout ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerHaptic(ImpactStyle.Medium);
                      onAddToWorkout(exercise);
                    }}
                    className="p-2 rounded-xl bg-accent text-accent-foreground hover:brightness-110 active:scale-95 transition-all cursor-pointer border-none shrink-0"
                    title="Add to Workout"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                  </button>
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Exercise Detail Modal */}
      <ExerciseDetailModal
        isOpen={Boolean(activeExerciseDetail)}
        onClose={() => setActiveExerciseDetail(null)}
        exercise={activeExerciseDetail}
        onAddToWorkout={onAddToWorkout}
        onStartExercise={onStartExercise}
      />
    </div>
  );
}
