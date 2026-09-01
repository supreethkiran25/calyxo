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
      {/* 1. Header */}
      <AdminPageHeader
        title="Workout Library"
        description="Master database of exercises, muscle biomechanics, and multimedia assets"
        badge={`${exercises.length} items`}
        actions={
          <div className="flex items-center gap-2">
            <label className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5 text-neutral-400" />
              <span>Import JSON</span>
              <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
            </label>
            <button
              onClick={handleExportJSON}
              className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-neutral-400" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={() => { setModalData(null); setIsModalOpen(true); }}
              className="px-3.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold flex items-center gap-1.5 border border-neutral-700 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Exercise</span>
            </button>
          </div>
        }
      />

      {/* 2. Search and Multi-Select Filters */}
      <div className="p-3 bg-neutral-900/90 border border-neutral-800/80 rounded-xl space-y-3">
        <AdminSearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search exercises by title or muscle..."
          onClear={() => setSearch('')}
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono">
          <select
            value={bodyPartFilter}
            onChange={(e) => setBodyPartFilter(e.target.value)}
            className="bg-neutral-950 border border-neutral-800 text-neutral-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-neutral-700 capitalize cursor-pointer"
          >
            <option value="">All Body Parts</option>
            {BODY_PARTS_LIST.map(bp => (
              <option key={bp} value={bp} className="capitalize">{bp}</option>
            ))}
          </select>

          <select
            value={targetMuscleFilter}
            onChange={(e) => setTargetMuscleFilter(e.target.value)}
            className="bg-neutral-950 border border-neutral-800 text-neutral-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-neutral-700 capitalize cursor-pointer"
          >
            <option value="">All Muscles</option>
            {TARGET_MUSCLES_LIST.map(tm => (
              <option key={tm} value={tm} className="capitalize">{tm}</option>
            ))}
          </select>

          <select
            value={equipmentFilter}
            onChange={(e) => setEquipmentFilter(e.target.value)}
            className="bg-neutral-950 border border-neutral-800 text-neutral-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-neutral-700 capitalize cursor-pointer"
          >
            <option value="">All Equipment</option>
            {EQUIPMENT_LIST.map(eq => (
              <option key={eq} value={eq} className="capitalize">{eq}</option>
            ))}
          </select>

          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="bg-neutral-950 border border-neutral-800 text-neutral-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-neutral-700 capitalize cursor-pointer"
          >
            <option value="">All Difficulties</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* 3. Bulk Action Floating Toolbar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-2.5 flex items-center gap-3 text-xs text-white z-40 shadow-2xl">
          <span className="font-mono">{selectedIds.length} selected</span>
          <button
            onClick={handleBulkDelete}
            className="px-3 py-1 rounded-lg bg-rose-950/40 text-rose-400 border border-rose-900/50 hover:bg-rose-900/60 font-semibold cursor-pointer transition-colors"
          >
            Delete Selected
          </button>
        </div>
      )}

      {/* 4. Exercise Cards Grid */}
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
                className={`bg-neutral-900/90 border rounded-xl p-3.5 flex flex-col justify-between group transition-colors relative ${
                  isSelected ? 'border-neutral-500 bg-neutral-800/40' : 'border-neutral-800/80 hover:border-neutral-700'
                }`}
              >
                <div>
                  {/* Image Container */}
                  <div className="h-36 rounded-lg overflow-hidden bg-neutral-950 relative mb-3 border border-neutral-800 flex items-center justify-center p-2">
                    <img
                      src={ex.gif_url || ex.image_url}
                      alt={ex.name || ex.title}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                      }}
                      className="w-full h-full object-contain"
                    />

                    {/* Category Badge */}
                    <span className="absolute top-2 left-2 bg-neutral-900/90 text-neutral-300 border border-neutral-700 text-[10px] font-mono rounded px-1.5 py-0.5 capitalize">
                      {ex.body_part || ex.category || 'General'}
                    </span>

                    {/* Difficulty Badge */}
                    <span className={`absolute top-2 right-2 text-[10px] font-mono px-1.5 py-0.5 rounded border capitalize ${getDifficultyBadge(ex.difficulty)}`}>
                      {ex.difficulty || 'beginner'}
                    </span>
                  </div>

                  {/* Exercise Title */}
                  <h3 className="text-xs font-bold text-white group-hover:text-neutral-200 transition-colors capitalize line-clamp-1">
                    {ex.name || ex.title}
                  </h3>

                  {/* Muscle / Equipment */}
                  <p className="text-[11px] text-neutral-400 font-mono mt-0.5 capitalize">
                    {ex.target || ex.muscle || 'abs'} • {ex.equipment || 'body weight'}
                  </p>

                  {/* Instructions snippet */}
                  {ex.instructions && (
                    <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed mt-1.5 font-sans">
                      {ex.instructions}
                    </p>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="pt-2.5 mt-2.5 border-t border-neutral-800/80 flex items-center justify-between text-xs">
                  <button
                    onClick={() => handleToggleSelect(ex.id)}
                    className="text-neutral-500 hover:text-white cursor-pointer"
                  >
                    {isSelected ? <CheckSquare className="w-3.5 h-3.5 text-neutral-200" /> : <Square className="w-3.5 h-3.5" />}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPreviewExercise(ex)}
                      className="text-neutral-300 hover:text-white text-[11px] font-mono font-medium cursor-pointer px-1.5 py-0.5"
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
                      className="p-1 rounded text-neutral-400 hover:text-rose-400 cursor-pointer"
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
      <div className="bg-neutral-950/60 border border-neutral-800 rounded-xl p-3.5 flex items-center justify-between text-xs text-neutral-400 font-mono">
        <span>
          Showing {(page - 1) * ITEMS_PER_PAGE + 1} - {Math.min(page * ITEMS_PER_PAGE, exercises.length)} of {exercises.length} exercises
        </span>
        <div className="flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
            className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 disabled:opacity-30 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span>Page {page} of {totalPages}</span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
            className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 disabled:opacity-30 cursor-pointer"
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
