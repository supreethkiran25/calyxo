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
import {
  AdminPageHeader,
  AdminSearchInput
} from '../../components/admin/AdminUIPrimitives';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl bg-[#090c14] border border-white/15 rounded-2xl p-6 space-y-4 relative shadow-2xl text-slate-200">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <span className="text-[11px] font-mono font-medium text-lime-400 bg-lime-400/10 px-2.5 py-0.5 rounded-full border border-lime-400/20">
              {exercise.body_part || exercise.category} • {exercise.equipment}
            </span>
            <h3 className="text-lg font-bold text-white capitalize mt-1.5">{exercise.name || exercise.title}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-60 rounded-xl bg-[#0e121d] p-2 flex items-center justify-center relative border border-white/10">
            <img
              src={exercise.gif_url || exercise.image_url}
              alt={exercise.name}
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
              }}
              className="w-full h-full object-contain"
            />
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-[#0e121d] border border-white/10 space-y-1">
              <span className="text-slate-500 block text-[11px] font-medium">Primary Target Muscle</span>
              <span className="text-lime-400 font-semibold capitalize text-sm">{exercise.target || exercise.muscle}</span>
            </div>

            {exercise.secondary_muscles && exercise.secondary_muscles.length > 0 && (
              <div className="p-3 rounded-xl bg-[#0e121d] border border-white/10 space-y-1">
                <span className="text-slate-500 block text-[11px] font-medium">Secondary Muscles</span>
                <span className="text-slate-300 capitalize text-xs font-semibold">{exercise.secondary_muscles.join(', ')}</span>
              </div>
            )}

            <div className="p-3 rounded-xl bg-[#0e121d] border border-white/10 space-y-1">
              <span className="text-slate-500 block text-[11px] font-medium">Difficulty & Equipment</span>
              <span className="text-slate-200 font-semibold capitalize text-xs">{exercise.difficulty || 'beginner'} • {exercise.equipment}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-white/10">
          <span className="text-xs font-semibold text-white block">Instructions</span>
          <p className="text-xs text-slate-300 leading-relaxed max-h-40 overflow-y-auto custom-scrollbar bg-[#0e121d] p-3 rounded-xl border border-white/10">
            {exercise.instructions || 'No detailed instructions provided.'}
          </p>
        </div>
      </div>
    </div>
  );
};

const AdminWorkoutDbView = ({ isExerciseOnly = false }) => {
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
      toast.success('Duplicated exercise.');
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
    if (d === 'intermediate') return 'bg-amber-50 text-amber-700 border-amber-200';
    if (d === 'advanced') return 'bg-rose-50 text-rose-700 border-rose-200';
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <AdminPageHeader
        title={isExerciseOnly ? "Exercise Library" : "Workouts & Exercises"}
        description={isExerciseOnly 
          ? "Master catalog of body mechanics, movements, target muscle groups, and multimedia demonstrations" 
          : "Master database of training programs, exercises, muscle biomechanics, and multimedia assets"
        }
        badge={`${exercises.length} items`}
        actions={
          <div className="flex items-center gap-2">
            <label className="px-3 py-1.5 rounded-xl bg-[#141724] hover:bg-[#1a1f30] border border-white/10 text-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs">
              <Upload className="w-3.5 h-3.5 text-slate-400" />
              <span>Import JSON</span>
              <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
            </label>
            <button
              onClick={handleExportJSON}
              className="px-3 py-1.5 rounded-xl bg-[#141724] hover:bg-[#1a1f30] border border-white/10 text-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={() => { setModalData(null); setIsModalOpen(true); }}
              className="px-3.5 py-1.5 rounded-xl bg-[#d4ff00] hover:bg-[#a3e635] text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-[#d4ff00]/10"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Exercise</span>
            </button>
          </div>
        }
      />

      {/* 2. Search and Multi-Select Filters */}
      <div className="p-4 bg-[#0e121d] border border-white/10 rounded-2xl space-y-3 shadow-xl">
        <AdminSearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search exercises by title or muscle..."
          onClear={() => setSearch('')}
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-sans">
          <select
            value={bodyPartFilter}
            onChange={(e) => setBodyPartFilter(e.target.value)}
            className="bg-[#141724] border border-white/10 text-slate-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#d4ff00]/60 capitalize cursor-pointer font-medium"
          >
            <option value="">All Body Parts</option>
            {BODY_PARTS_LIST.map(bp => (
              <option key={bp} value={bp} className="capitalize">{bp}</option>
            ))}
          </select>

          <select
            value={targetMuscleFilter}
            onChange={(e) => setTargetMuscleFilter(e.target.value)}
            className="bg-[#141724] border border-white/10 text-slate-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#d4ff00]/60 capitalize cursor-pointer font-medium"
          >
            <option value="">All Muscles</option>
            {TARGET_MUSCLES_LIST.map(tm => (
              <option key={tm} value={tm} className="capitalize">{tm}</option>
            ))}
          </select>

          <select
            value={equipmentFilter}
            onChange={(e) => setEquipmentFilter(e.target.value)}
            className="bg-[#141724] border border-white/10 text-slate-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#d4ff00]/60 capitalize cursor-pointer font-medium"
          >
            <option value="">All Equipment</option>
            {EQUIPMENT_LIST.map(eq => (
              <option key={eq} value={eq} className="capitalize">{eq}</option>
            ))}
          </select>

          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="bg-[#141724] border border-white/10 text-slate-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#d4ff00]/60 capitalize cursor-pointer font-medium"
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
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#141724] border border-white/15 rounded-xl px-4 py-2.5 flex items-center gap-3 text-xs text-white z-40 shadow-2xl">
          <span className="font-semibold text-slate-200"><strong className="text-[#d4ff00]">{selectedIds.length}</strong> selected</span>
          <button
            onClick={handleBulkDelete}
            className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold cursor-pointer transition-colors"
          >
            Delete Selected
          </button>
        </div>
      )}

      {/* 4. Exercise Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-[#0e121d] border border-white/10 rounded-2xl p-4 space-y-3 animate-pulse">
              <div className="h-36 bg-[#141724] rounded-xl" />
              <div className="h-4 bg-[#141724] rounded w-2/3" />
              <div className="h-3 bg-[#141724] rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : currentExercises.length === 0 ? (
        <div className="bg-[#0e121d] border border-white/10 rounded-2xl p-12 text-center text-xs font-sans text-slate-400 shadow-xl">
          No matching exercises found in library.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {currentExercises.map(ex => {
            const isSelected = selectedIds.includes(ex.id);
            return (
              <div
                key={ex.id}
                className={`bg-[#0e121d] border rounded-2xl p-3.5 flex flex-col justify-between group transition-all relative shadow-xl ${
                  isSelected ? 'border-[#d4ff00] ring-1 ring-[#d4ff00]/40' : 'border-white/10 hover:border-white/25'
                }`}
              >
                <div>
                  {/* Image Container */}
                  <div className="h-36 rounded-xl overflow-hidden bg-[#090c14] relative mb-3 border border-white/5 flex items-center justify-center p-2">
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
                    <span className="absolute top-2 left-2 bg-[#090c14]/90 backdrop-blur-xs text-slate-300 border border-white/10 text-[10px] font-medium rounded-md px-1.5 py-0.5 capitalize shadow-xs">
                      {ex.body_part || ex.category || 'General'}
                    </span>

                    {/* Difficulty Badge */}
                    <span className={`absolute top-2 right-2 text-[10px] font-medium px-1.5 py-0.5 rounded-md border capitalize shadow-xs ${getDifficultyBadge(ex.difficulty)}`}>
                      {ex.difficulty || 'beginner'}
                    </span>
                  </div>

                  {/* Exercise Title */}
                  <h3 className="text-xs font-bold text-white group-hover:text-[#d4ff00] transition-colors capitalize line-clamp-1">
                    {ex.name || ex.title}
                  </h3>

                  {/* Muscle / Equipment */}
                  <p className="text-[11px] text-slate-400 font-sans mt-0.5 capitalize">
                    {ex.target || ex.muscle || 'abs'} • {ex.equipment || 'body weight'}
                  </p>

                  {/* Instructions snippet */}
                  {ex.instructions && (
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mt-1.5 font-sans">
                      {ex.instructions}
                    </p>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="pt-2.5 mt-2.5 border-t border-white/5 flex items-center justify-between text-xs">
                  <button
                    onClick={() => handleToggleSelect(ex.id)}
                    className="text-slate-400 hover:text-white cursor-pointer"
                  >
                    {isSelected ? <CheckSquare className="w-3.5 h-3.5 text-[#d4ff00]" /> : <Square className="w-3.5 h-3.5" />}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPreviewExercise(ex)}
                      className="text-slate-300 hover:text-[#d4ff00] text-[11px] font-semibold cursor-pointer px-1.5 py-0.5 hover:bg-white/10 rounded"
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => handleDuplicate(ex)}
                      className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
                      title="Duplicate"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => { setModalData(ex); setIsModalOpen(true); }}
                      className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
                      title="Edit"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(ex)}
                      className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
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
      <div className="bg-[#0e121d] border border-white/10 rounded-2xl p-4 flex items-center justify-between text-xs text-slate-400 font-sans shadow-xl">
        <span className="font-medium">
          Showing <strong className="text-white">{(page - 1) * ITEMS_PER_PAGE + 1}</strong> - <strong className="text-white">{Math.min(page * ITEMS_PER_PAGE, exercises.length)}</strong> of <strong className="text-white">{exercises.length}</strong> exercises
        </span>
        <div className="flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
            className="p-1.5 rounded-lg bg-[#141724] border border-white/10 text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-semibold text-slate-200">Page {page} of {totalPages}</span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
            className="p-1.5 rounded-lg bg-[#141724] border border-white/10 text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer transition-colors"
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
