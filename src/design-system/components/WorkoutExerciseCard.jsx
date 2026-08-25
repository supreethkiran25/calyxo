import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, Clock, Edit2, Trash2 } from 'lucide-react';
import { getExerciseImage, getDistinctFallback } from '../../utils/exerciseSearch';

export default function WorkoutExerciseCard({
  exercise = {},
  onOpenDetail = () => {},
  onEdit = () => {},
  onDelete = () => {}
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState(() => exercise.gif_url || exercise.image || getExerciseImage(exercise));

  const isCardio = exercise.category === 'Cardio';
  const setsCount = Array.isArray(exercise.sets) ? exercise.sets.length : Number(exercise.sets || 1);
  const reps = exercise.reps || 10;
  const weight = Number(exercise.weight) || 0;
  const volume = isCardio ? 0 : Math.round((weight || 0) * (Number(reps) || 10) * setsCount);

  return (
    <div className="p-3.5 sm:p-4 rounded-2xl bg-surface border border-card-border hover:border-accent/40 transition-all flex items-center justify-between gap-3 shadow-xs">
      {/* Exercise Media + Details */}
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Media Thumbnail with Skeleton & Fallback */}
        <div 
          onClick={() => onOpenDetail(exercise)}
          className="relative w-14 h-14 rounded-xl bg-surface-subtle border border-card-border overflow-hidden shrink-0 cursor-pointer hover:scale-105 transition-transform"
        >
          {!imageLoaded && (
            <div className="absolute inset-0 bg-surface-subtle animate-pulse flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-muted" />
            </div>
          )}
          <img
            src={imageSrc}
            alt={exercise.name}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageSrc(getDistinctFallback(exercise.name));
              setImageLoaded(true);
            }}
            className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
        </div>

        {/* Name & Muscle Info */}
        <div className="min-w-0">
          <h4 
            onClick={() => onOpenDetail(exercise)}
            className="text-xs sm:text-sm font-bold text-foreground truncate hover:text-accent transition-colors cursor-pointer"
          >
            {exercise.name}
          </h4>
          <div className="flex items-center gap-2 text-[10px] font-mono text-secondary mt-1">
            <span className="px-1.5 py-0.5 rounded bg-surface-subtle border border-card-border/60 uppercase text-secondary">
              {exercise.category || 'Strength'}
            </span>
            {!isCardio && (
              <span className="font-semibold text-foreground">
                {weight > 0 ? `${weight} kg` : 'Bodyweight'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Metrics & Actions */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right">
          {isCardio ? (
            <span className="text-xs font-black text-accent font-mono flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {exercise.duration || 30} mins
            </span>
          ) : (
            <div className="flex flex-col items-end">
              <span className="text-xs sm:text-sm font-black text-accent font-mono">
                {setsCount} Sets × {reps} Reps
              </span>
              {volume > 0 && (
                <span className="text-[9px] font-mono text-muted">
                  {volume} kg vol
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 border-l border-card-border pl-2">
          <button
            onClick={() => onEdit(exercise)}
            className="p-1.5 rounded-lg text-muted hover:text-foreground transition-colors cursor-pointer border-none bg-transparent"
            title="Edit exercise log"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(exercise.id)}
            className="p-1.5 rounded-lg text-muted hover:text-rose-500 transition-colors cursor-pointer border-none bg-transparent"
            title="Delete exercise log"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
