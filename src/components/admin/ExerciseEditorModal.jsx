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
      secondary_muscles: formData.secondary_muscles.split(',').map(s => s.trim()).filter(Boolean)
    };
    await saveAdminExercise(payload);
    setLoading(false);
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl overflow-hidden p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Dumbbell className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">{initialData ? 'Edit Exercise' : 'Create New Exercise'}</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-neutral-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="text-neutral-400 font-medium block mb-1">Exercise Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Incline Dumbbell Bench Press"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-neutral-400 font-medium block mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none"
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
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none"
              >
                {['Beginner', 'Intermediate', 'Advanced'].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-neutral-400 font-medium block mb-1">Target Muscle</label>
              <input
                type="text"
                required
                value={formData.muscle}
                onChange={(e) => setFormData({ ...formData, muscle: e.target.value })}
                placeholder="e.g. Pectoralis Major"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none"
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
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-neutral-400 font-medium block mb-1">Secondary Muscles (comma separated)</label>
            <input
              type="text"
              value={formData.secondary_muscles}
              onChange={(e) => setFormData({ ...formData, secondary_muscles: e.target.value })}
              placeholder="e.g. Triceps, Front Shoulders"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="text-neutral-400 font-medium block mb-1">Instructions Step-by-Step</label>
            <textarea
              rows="3"
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              placeholder="Describe execution technique..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="text-neutral-400 font-medium block mb-1">Image / Video Banner URL</label>
            <input
              type="text"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
            >
              <Save className="w-3.5 h-3.5" /> Save Exercise
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExerciseEditorModal;
