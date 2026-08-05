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
  Info,
  Flame,
  Layers,
  X,
  Play,
  ArrowRight
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

// Exercise GIF & Details Preview Modal
const ExercisePreviewModal = ({ exercise, onClose }) => {
  if (!exercise) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl rounded-3xl bg-neutral-900 border border-neutral-800 p-6 space-y-4 shadow-2xl overflow-hidden relative">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              {exercise.body_part || exercise.category} • {exercise.equipment}
            </span>
            <h3 className="text-xl font-extrabold text-white capitalize mt-1">{exercise.name || exercise.title}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* GIF / Image Frame */}
          <div className="h-64 rounded-2xl bg-white p-2 flex items-center justify-center relative overflow-hidden border border-neutral-700">
            <img
              src={exercise.gif_url || exercise.image_url}
              alt={exercise.name}
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
              }}
            />
            <span className="absolute top-3 right-3 px-2 py-0.5 rounded bg-emerald-600 text-white font-black text-[9px] uppercase tracking-wider">
              GIF
            </span>
          </div>

          {/* Exercise Info */}
          <div className="space-y-3 text-xs font-mono">
            <div className="p-3 rounded-2xl bg-neutral-950/60 border border-neutral-800 space-y-1">
              <span className="text-neutral-500 block">Primary Target Muscle</span>
              <span className="text-indigo-400 font-bold capitalize text-sm">{exercise.target || exercise.muscle}</span>
            </div>

            {exercise.secondary_muscles && exercise.secondary_muscles.length > 0 && (
              <div className="p-3 rounded-2xl bg-neutral-950/60 border border-neutral-800 space-y-1">
                <span className="text-neutral-500 block">Secondary Muscles</span>
                <span className="text-neutral-300 capitalize">{exercise.secondary_muscles.join(', ')}</span>
              </div>
            )}

            <div className="p-3 rounded-2xl bg-neutral-950/60 border border-neutral-800 space-y-1">
              <span className="text-neutral-500 block">Difficulty & Equipment</span>
              <span className="text-emerald-400 font-bold capitalize">{exercise.difficulty || 'beginner'} • {exercise.equipment}</span>
            </div>
          </div>
        </div>

        {/* Step-by-step Instructions */}
        <div className="space-y-2 pt-2 border-t border-neutral-800">
          <span className="text-xs font-bold text-white block">Step-by-Step Execution Guide</span>
          <p className="text-xs text-neutral-300 leading-relaxed max-h-40 overflow-y-auto custom-scrollbar bg-neutral-950/60 p-3 rounded-2xl border border-neutral-800">
            {exercise.instructions || 'No detailed instructions provided for this exercise.'}
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

  const handleBulkExport = () => {
    const selectedData = exercises.filter(e => selectedIds.includes(e.id));
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(selectedData, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `calyxo_selected_exercises_${Date.now()}.json`;
    a.click();
    toast.success(`Exported ${selectedData.length} selected exercises.`);
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exercises, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `calyxo_master_exercises_dataset_${Date.now()}.json`;
    a.click();
    toast.success('Exported master exercise dataset JSON.');
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
          toast.success(`Successfully imported ${count} exercises to library!`);
        }
      } catch (err) {
        toast.error('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Dumbbell className="w-6 h-6 text-indigo-400" /> WORKOUTS LIBRARY & MASTER DATABASE
          </h1>
          <p className="text-xs text-neutral-400 font-mono mt-0.5">
            Synchronized with user app workout library ({exercises.length} exercises loaded)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
            <Upload className="w-4 h-4 text-indigo-400" /> Import JSON
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>
          <button
            onClick={handleExportJSON}
            className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4 text-neutral-400" /> Export JSON
          </button>
          <button
            onClick={() => { setModalData(null); setIsModalOpen(true); }}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/25 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Exercise
          </button>
        </div>
      </div>

      {/* Control & Search Bar (Matching User App Library Filters) */}
      <div className="p-5 rounded-3xl bg-neutral-900/80 border border-neutral-800 space-y-4 shadow-2xl">
        <div className="relative w-full font-mono">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search exercises by name, muscle, equipment..."
            className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
          <select
            value={bodyPartFilter}
            onChange={(e) => setBodyPartFilter(e.target.value)}
            className="bg-neutral-950 border border-neutral-800 text-neutral-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none capitalize"
          >
            <option value="">All Body Parts</option>
            {BODY_PARTS_LIST.map(bp => (
              <option key={bp} value={bp} className="capitalize">{bp}</option>
            ))}
          </select>

          <select
            value={targetMuscleFilter}
            onChange={(e) => setTargetMuscleFilter(e.target.value)}
            className="bg-neutral-950 border border-neutral-800 text-neutral-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none capitalize"
          >
            <option value="">All Target Muscles</option>
            {TARGET_MUSCLES_LIST.map(tm => (
              <option key={tm} value={tm} className="capitalize">{tm}</option>
            ))}
          </select>

          <select
            value={equipmentFilter}
            onChange={(e) => setEquipmentFilter(e.target.value)}
            className="bg-neutral-950 border border-neutral-800 text-neutral-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none capitalize"
          >
            <option value="">All Equipment</option>
            {EQUIPMENT_LIST.map(eq => (
              <option key={eq} value={eq} className="capitalize">{eq}</option>
            ))}
          </select>

          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="bg-neutral-950 border border-neutral-800 text-neutral-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none capitalize"
          >
            <option value="">All Difficulties</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="p-3 rounded-2xl bg-indigo-950/80 border border-indigo-500/40 flex items-center justify-between text-xs text-white shadow-2xl animate-fade-in">
          <span className="font-mono font-bold text-indigo-300">
            {selectedIds.length} Exercise{selectedIds.length > 1 ? 's' : ''} Selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkExport}
              className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 font-bold border border-neutral-700 flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Export Selected JSON
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Exercise Cards Grid (Exact User App Library Cards) */}
      {loading ? (
        <div className="p-12 text-center text-xs font-mono text-neutral-500 animate-pulse">
          Loading master exercise database...
        </div>
      ) : currentExercises.length === 0 ? (
        <div className="p-12 text-center text-xs font-mono text-neutral-500">
          No matching exercises found. Try resetting filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {currentExercises.map(ex => {
            const isSelected = selectedIds.includes(ex.id);
            return (
              <div
                key={ex.id}
                className={`rounded-2xl bg-neutral-900 border transition-all p-3.5 space-y-3 flex flex-col justify-between group shadow-xl relative overflow-hidden ${
                  isSelected ? 'border-indigo-500 bg-indigo-950/20' : 'border-neutral-800 hover:border-neutral-700'
                }`}
              >
                {/* Admin Select Checkbox */}
                <button
                  onClick={() => handleToggleSelect(ex.id)}
                  className="absolute top-5 left-5 z-20 p-1 rounded-lg bg-black/80 text-white hover:text-indigo-400 cursor-pointer shadow-md"
                >
                  {isSelected ? <CheckSquare className="w-4 h-4 text-indigo-400" /> : <Square className="w-4 h-4 text-neutral-400" />}
                </button>

                {/* White Image Container with GIF badge */}
                <div className="h-44 rounded-xl bg-white p-2 flex items-center justify-center relative overflow-hidden border border-neutral-700">
                  <img
                    src={ex.gif_url || ex.image_url}
                    alt={ex.name || ex.title}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                    }}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-neutral-800 text-white font-black text-[9px] uppercase tracking-wider font-mono">
                    GIF
                  </span>
                </div>

                {/* Exercise Meta Information */}
                <div className="space-y-1.5">
                  <h3 className="font-bold text-white text-sm capitalize truncate leading-tight group-hover:text-indigo-400 transition-colors">
                    {ex.name || ex.title}
                  </h3>
                  <div className="text-[11px] font-mono text-indigo-400 font-bold capitalize">
                    Target: {ex.target || ex.muscle || 'abs'}
                  </div>
                </div>

                {/* Card Footer Action Tags */}
                <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-[10px] font-mono">
                  <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 font-bold uppercase tracking-wider">
                    {ex.equipment || 'body weight'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setPreviewExercise(ex)}
                      className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-0.5 cursor-pointer"
                    >
                      VIEW GIF →
                    </button>
                    <button
                      onClick={() => handleDuplicate(ex)}
                      className="p-1 rounded bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
                      title="Duplicate Exercise"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => { setModalData(ex); setIsModalOpen(true); }}
                      className="p-1 rounded bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
                      title="Edit Exercise"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(ex)}
                      className="p-1 rounded bg-red-950/40 text-red-400 hover:bg-red-900/60 cursor-pointer"
                      title="Delete Exercise"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      <div className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-2xl flex items-center justify-between text-xs text-neutral-400 font-mono">
        <span>
          Showing {(page - 1) * ITEMS_PER_PAGE + 1} - {Math.min(page * ITEMS_PER_PAGE, exercises.length)} of {exercises.length} exercises
        </span>
        <div className="flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
            className="p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-indigo-400 font-mono px-3 py-1 rounded-lg bg-neutral-950 border border-neutral-800">
            {page} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
            className="p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
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
        title="Delete Exercise"
        description={`Are you sure you want to delete "${deleteTarget?.name || deleteTarget?.title}" from the master exercise database?`}
        confirmLabel="Delete Exercise"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default AdminWorkoutDbView;
