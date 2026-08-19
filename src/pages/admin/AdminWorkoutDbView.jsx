import React, { useState, useEffect } from 'react';
import {
  Dumbbell,
  Search,
  Plus,
  Download,
  Upload,
  Trash2,
  Edit,
  Copy,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Square,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { getAdminExercises, deleteAdminExercise, saveAdminExercise } from '../../services/adminService';
import ExerciseEditorModal from '../../components/admin/ExerciseEditorModal';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import useDebounce from '../../hooks/useDebounce';

const ITEMS_PER_PAGE = 24;

const BODY_PARTS_LIST = [
  'waist', 'chest', 'back', 'shoulders', 'upper arms', 'lower arms', 'upper legs', 'lower legs', 'cardio', 'neck'
];

const TARGET_MUSCLES_LIST = [
  'abs', 'biceps', 'triceps', 'quads', 'hamstrings', 'glutes', 'lats', 'pectoralis', 'delts', 'traps', 'calves', 'obliques', 'forearms'
];

const EQUIPMENT_LIST = [
  'body weight', 'dumbbell', 'barbell', 'cable', 'leverage machine', 'smith machine', 'band', 'kettlebell', 'assisted'
];

const ExercisePreviewModal = ({ exercise, onClose }) => {
  if (!exercise) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4 relative">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div>
            <span className="text-[11px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
              {exercise.body_part || exercise.category} • {exercise.equipment}
            </span>
            <h3 className="text-lg font-semibold text-white capitalize mt-1">{exercise.name || exercise.title}</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-neutral-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-60 rounded-lg bg-neutral-950 p-2 flex items-center justify-center relative border border-neutral-800">
            <img
              src={exercise.gif_url || exercise.image_url}
              alt={exercise.name}
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
              }}
            />
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 space-y-1">
              <span className="text-neutral-500 block text-[11px]">Primary target muscle</span>
              <span className="text-blue-400 font-medium capitalize text-sm">{exercise.target || exercise.muscle}</span>
            </div>

            {exercise.secondary_muscles && exercise.secondary_muscles.length > 0 && (
              <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 space-y-1">
                <span className="text-neutral-500 block text-[11px]">Secondary muscles</span>
                <span className="text-neutral-300 capitalize text-xs">{exercise.secondary_muscles.join(', ')}</span>
              </div>
            )}

            <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 space-y-1">
              <span className="text-neutral-500 block text-[11px]">Difficulty & Equipment</span>
              <span className="text-white font-medium capitalize text-xs">{exercise.difficulty || 'beginner'} • {exercise.equipment}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-neutral-800">
          <span className="text-xs font-semibold text-white block">Instructions</span>
          <p className="text-xs text-neutral-400 leading-relaxed max-h-40 overflow-y-auto custom-scrollbar bg-neutral-950 p-3 rounded-lg border border-neutral-800">
            {exercise.instructions || 'No detailed instructions provided.'}
          </p>
        </div>
      </div>
    </div>
  );
};

const AdminWorkoutDbView = () => {
  const [exercises, setExercises] = useState([]);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [bodyPartFilter, setBodyPartFilter] = useState('');
  const [targetMuscleFilter, setTargetMuscleFilter] = useState('');
  const [equipmentFilter, setEquipmentFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');

  const [modalData, setModalData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [previewExercise, setPreviewExercise] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchExercises = async () => {
    setLoading(true);
    try {
      const list = await getAdminExercises({
        search: debouncedSearch,
        bodyPart: bodyPartFilter,
        targetMuscle: targetMuscleFilter,
        equipment: equipmentFilter,
        difficulty: difficultyFilter
      });
      setExercises(list || []);
    } catch (e) {
      toast.error('Failed to load exercise library.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, [debouncedSearch, bodyPartFilter, targetMuscleFilter, equipmentFilter, difficultyFilter]);

  useEffect(() => {
    setPage(1);
    setSelectedIds([]);
  }, [debouncedSearch, bodyPartFilter, targetMuscleFilter, equipmentFilter, difficultyFilter]);

  const totalPages = Math.ceil(exercises.length / ITEMS_PER_PAGE) || 1;
  const currentExercises = exercises.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleToggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleDuplicate = async (ex) => {
    const copyData = {
      ...ex,
      id: undefined,
      title: `${ex.name || ex.title} (Copy)`,
      name: `${ex.name || ex.title} (Copy)`
    };
    try {
      await saveAdminExercise(copyData);
      toast.success(`Duplicated exercise.`);
      fetchExercises();
    } catch (err) {
      toast.error('Failed to duplicate exercise.');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteAdminExercise(deleteTarget.id);
      toast.success(`Deleted exercise "${deleteTarget.name || deleteTarget.title}".`);
      fetchExercises();
    } catch (err) {
      toast.error('Failed to delete exercise.');
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    try {
      for (const id of selectedIds) {
        await deleteAdminExercise(id);
      }
      toast.success(`Bulk deleted ${selectedIds.length} exercises.`);
      setSelectedIds([]);
      fetchExercises();
    } catch (err) {
      toast.error('Failed bulk delete.');
    }
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exercises, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `calyxo_master_exercises_${Date.now()}.json`;
    a.click();
    toast.success('Exported exercise JSON.');
  };

  const handleImportJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const imported = JSON.parse(evt.target.result);
        if (Array.isArray(imported)) {
          let count = 0;
          for (const item of imported) {
            await saveAdminExercise(item);
            count++;
          }
          fetchExercises();
          toast.success(`Imported ${count} exercises.`);
        }
      } catch (err) {
        toast.error('Invalid JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const getDifficultyBadge = (diff) => {
    const d = (diff || 'beginner').toLowerCase();
    if (d === 'intermediate') return 'bg-amber-500/10 text-amber-300 border-amber-500/20';
    if (d === 'advanced') return 'bg-red-500/10 text-red-400 border-red-500/20';
    return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight flex items-center gap-2">
            Exercise database
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Master exercise library and training content — {exercises.length} items
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          <label className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors">
            <Upload className="w-3.5 h-3.5 text-neutral-400" /> Import JSON
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>
          <button
            onClick={handleExportJSON}
            className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-neutral-400" /> Export JSON
          </button>
          <button
            onClick={() => { setModalData(null); setIsModalOpen(true); }}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add exercise
          </button>
        </div>
      </div>

      {/* Control & Search Bar */}
      <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search exercises..."
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <select
            value={bodyPartFilter}
            onChange={(e) => setBodyPartFilter(e.target.value)}
            className="bg-neutral-950 border border-neutral-800 text-neutral-300 text-xs rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none capitalize"
          >
            <option value="">All body parts</option>
            {BODY_PARTS_LIST.map(bp => (
              <option key={bp} value={bp} className="capitalize">{bp}</option>
            ))}
          </select>

          <select
            value={targetMuscleFilter}
            onChange={(e) => setTargetMuscleFilter(e.target.value)}
            className="bg-neutral-950 border border-neutral-800 text-neutral-300 text-xs rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none capitalize"
          >
            <option value="">All muscles</option>
            {TARGET_MUSCLES_LIST.map(tm => (
              <option key={tm} value={tm} className="capitalize">{tm}</option>
            ))}
          </select>

          <select
            value={equipmentFilter}
            onChange={(e) => setEquipmentFilter(e.target.value)}
            className="bg-neutral-950 border border-neutral-800 text-neutral-300 text-xs rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none capitalize"
          >
            <option value="">All equipment</option>
            {EQUIPMENT_LIST.map(eq => (
              <option key={eq} value={eq} className="capitalize">{eq}</option>
            ))}
          </select>

          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="bg-neutral-950 border border-neutral-800 text-neutral-300 text-xs rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none capitalize"
          >
            <option value="">All difficulties</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 flex items-center gap-3 text-xs text-white z-40">
          <span className="font-medium">{selectedIds.length} selected</span>
          <button
            onClick={handleBulkDelete}
            className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 font-semibold cursor-pointer"
          >
            Delete selected
          </button>
        </div>
      )}

      {/* Exercise Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs font-mono text-neutral-500">
          Loading exercises...
        </div>
      ) : currentExercises.length === 0 ? (
        <div className="p-12 text-center text-xs font-mono text-neutral-500">
          No matching exercises found
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {currentExercises.map(ex => {
            const isSelected = selectedIds.includes(ex.id);
            return (
              <div
                key={ex.id}
                className={`bg-neutral-900 border rounded-xl p-4 flex flex-col justify-between group transition-colors relative ${
                  isSelected ? 'border-blue-500 bg-blue-500/5' : 'border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div>
                  {/* Image Container */}
                  <div className="h-40 rounded-lg overflow-hidden bg-neutral-950 relative mb-3 border border-neutral-800 flex items-center justify-center p-2">
                    <img
                      src={ex.gif_url || ex.image_url}
                      alt={ex.name || ex.title}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                      }}
                      className="w-full h-full object-contain"
                    />

                    {/* Category Badge top-left */}
                    <span className="absolute top-2 left-2 bg-black/60 text-blue-300 border border-blue-500/20 text-[10px] font-mono rounded px-2 py-0.5 capitalize">
                      {ex.body_part || ex.category || 'general'}
                    </span>

                    {/* Difficulty Badge top-right */}
                    <span className={`absolute top-2 right-2 text-[10px] font-medium px-2 py-0.5 rounded border capitalize ${getDifficultyBadge(ex.difficulty)}`}>
                      {ex.difficulty || 'beginner'}
                    </span>
                  </div>

                  {/* Exercise Title */}
                  <h3 className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors capitalize line-clamp-1">
                    {ex.name || ex.title}
                  </h3>

                  {/* Muscle / Equipment */}
                  <p className="text-[11px] text-neutral-400 font-mono mt-0.5 capitalize">
                    {ex.target || ex.muscle || 'abs'} • {ex.equipment || 'body weight'}
                  </p>

                  {/* Instructions snippet */}
                  {ex.instructions && (
                    <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed mt-1.5">
                      {ex.instructions}
                    </p>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="pt-3 mt-3 border-t border-neutral-800 flex items-center justify-between text-xs">
                  <button
                    onClick={() => handleToggleSelect(ex.id)}
                    className="text-neutral-500 hover:text-white cursor-pointer"
                  >
                    {isSelected ? <CheckSquare className="w-4 h-4 text-blue-400" /> : <Square className="w-4 h-4" />}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPreviewExercise(ex)}
                      className="text-blue-400 hover:text-blue-300 text-[11px] font-medium cursor-pointer px-1.5 py-0.5"
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => handleDuplicate(ex)}
                      className="p-1 rounded text-neutral-400 hover:text-white cursor-pointer"
                      title="Duplicate"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => { setModalData(ex); setIsModalOpen(true); }}
                      className="p-1 rounded text-neutral-400 hover:text-white cursor-pointer"
                      title="Edit"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(ex)}
                      className="p-1 rounded text-neutral-400 hover:text-red-400 cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 flex items-center justify-between text-[11px] text-neutral-500 font-mono">
        <span>
          Showing {(page - 1) * ITEMS_PER_PAGE + 1} - {Math.min(page * ITEMS_PER_PAGE, exercises.length)} of {exercises.length} exercises
        </span>
        <div className="flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
            className="p-1 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 disabled:opacity-30 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span>Page {page} of {totalPages}</span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
            className="p-1 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 disabled:opacity-30 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Modals */}
      <ExerciseEditorModal
        isOpen={isModalOpen}
        initialData={modalData}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchExercises}
      />

      <ExercisePreviewModal
        exercise={previewExercise}
        onClose={() => setPreviewExercise(null)}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete exercise"
        description={`Are you sure you want to delete "${deleteTarget?.name || deleteTarget?.title}"?`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default AdminWorkoutDbView;
