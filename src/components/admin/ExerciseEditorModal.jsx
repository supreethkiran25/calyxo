import React, { useState, useEffect } from 'react';
import { X, Dumbbell, Save } from 'lucide-react';
import { saveAdminExercise } from '../../services/adminService';

const ExerciseEditorModal = ({ isOpen, onClose, initialData, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Chest',
    muscle: 'Pectoralis Major',
    secondary_muscles: 'Triceps, Deltoids',
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    instructions: '',
    image_url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        title: initialData.name || initialData.title || '',
        muscle: initialData.target || initialData.muscle || '',
        category: initialData.body_part || initialData.category || 'Chest',
        secondary_muscles: Array.isArray(initialData.secondary_muscles) ? initialData.secondary_muscles.join(', ') : (initialData.secondary_muscles || '')
      });
    } else {
      setFormData({
        title: '',
        category: 'Chest',
        muscle: 'Pectoralis Major',
        secondary_muscles: 'Triceps, Deltoids',
        equipment: 'Barbell',
        difficulty: 'Intermediate',
        instructions: '',
        image_url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400'
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      ...formData,
      secondary_muscles: typeof formData.secondary_muscles === 'string'
        ? formData.secondary_muscles.split(',').map(s => s.trim()).filter(Boolean)
        : formData.secondary_muscles
    };
    await saveAdminExercise(payload);
    setLoading(false);
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Dumbbell className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">{initialData ? 'Edit exercise' : 'Add exercise'}</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-neutral-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="text-neutral-400 font-medium block mb-1">Exercise title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Incline Dumbbell Press"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-neutral-400 font-medium block mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
              >
                {['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-neutral-400 font-medium block mb-1">Difficulty</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
              >
                {['Beginner', 'Intermediate', 'Advanced'].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-neutral-400 font-medium block mb-1">Target muscle</label>
              <input
                type="text"
                required
                value={formData.muscle}
                onChange={(e) => setFormData({ ...formData, muscle: e.target.value })}
                placeholder="e.g. Pectoralis Major"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-neutral-400 font-medium block mb-1">Equipment</label>
              <input
                type="text"
                required
                value={formData.equipment}
                onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
                placeholder="e.g. Barbell, Dumbbells"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-neutral-400 font-medium block mb-1">Secondary muscles</label>
            <input
              type="text"
              value={formData.secondary_muscles}
              onChange={(e) => setFormData({ ...formData, secondary_muscles: e.target.value })}
              placeholder="e.g. Triceps, Front Shoulders"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-neutral-400 font-medium block mb-1">Instructions</label>
            <textarea
              rows="3"
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              placeholder="Execution technique instructions..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-neutral-400 font-medium block mb-1">Image / GIF URL</label>
            <input
              type="text"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-neutral-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" /> Save exercise
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExerciseEditorModal;
