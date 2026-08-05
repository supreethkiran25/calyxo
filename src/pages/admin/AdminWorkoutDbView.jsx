import React, { useState, useEffect } from 'react';
import { Dumbbell, Search, Plus, Download, Upload, Trash2, Edit, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { getAdminExercises, deleteAdminExercise, saveAdminExercise } from '../../services/adminService';
import ExerciseEditorModal from '../../components/admin/ExerciseEditorModal';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import useDebounce from '../../hooks/useDebounce';

const ITEMS_PER_PAGE = 24;

const AdminWorkoutDbView = () => {
  const [exercises, setExercises] = useState([]);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [modalData, setModalData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchExercises = async () => {
    setLoading(true);
    try {
      const list = await getAdminExercises({ search: debouncedSearch, category, difficulty });
      setExercises(list || []);
    } catch (e) {
      toast.error('Failed to load exercise database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, [debouncedSearch, category, difficulty]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, category, difficulty]);

  const totalPages = Math.ceil(exercises.length / ITEMS_PER_PAGE) || 1;
  const currentExercises = exercises.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteAdminExercise(deleteTarget.id);
      toast.success(`Exercise "${deleteTarget.title}" deleted.`);
      fetchExercises();
    } catch (err) {
      toast.error('Failed to delete exercise: ' + err.message);
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exercises, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `calyxo_workout_database.json`;
    a.click();
    toast.success('Exported workout database JSON.');
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
          toast.success(`Successfully imported ${count} exercises!`);
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
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Dumbbell className="w-6 h-6 text-indigo-400" /> Master Workout Database
          </h1>
          <p className="text-xs text-neutral-400 font-mono mt-0.5">
            Manage exercise library, muscle targeting, instructions, equipment & media ({exercises.length} total)
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
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Exercise
          </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search exercises or target muscles..."
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-neutral-950 border border-neutral-800 text-neutral-300 text-xs rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="">All Categories</option>
            {['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="bg-neutral-950 border border-neutral-800 text-neutral-300 text-xs rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="">All Difficulties</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* Exercise Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs font-mono text-neutral-500 animate-pulse">
          Loading master workout database...
        </div>
      ) : currentExercises.length === 0 ? (
        <div className="p-12 text-center text-xs font-mono text-neutral-500">
          No matching exercises found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentExercises.map(ex => (
            <div key={ex.id} className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 hover:border-neutral-700 transition-all space-y-3 flex flex-col justify-between group shadow-xl">
              <div className="space-y-2">
                <div className="h-36 rounded-xl overflow-hidden bg-neutral-950 relative flex items-center justify-center">
                  <img
                    src={ex.image_url}
                    alt={ex.title}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-neutral-950 text-neutral-600"><svg class="w-8 h-8 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg></div>`;
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-[10px] font-mono text-indigo-300 border border-indigo-500/30">
                    {ex.category}
                  </span>
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-[10px] font-mono text-emerald-400 border border-emerald-500/30">
                    {ex.difficulty}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-white text-base group-hover:text-indigo-400 transition-colors">{ex.title}</h3>
                  <p className="text-xs text-neutral-400 font-mono mt-0.5">Target: {ex.muscle} • Equipment: {ex.equipment}</p>
                </div>

                <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">{ex.instructions}</p>
              </div>

              <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
                <span className="text-[10px] text-neutral-500 font-mono">ID: {ex.id}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => { setModalData(ex); setIsModalOpen(true); }}
                    className="p-1.5 rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 transition-colors cursor-pointer"
                    title="Edit Exercise"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(ex)}
                    className="p-1.5 rounded-lg bg-red-950/40 text-red-400 hover:bg-red-900/60 transition-colors cursor-pointer"
                    title="Delete Exercise"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Bar */}
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

      <ExerciseEditorModal
        isOpen={isModalOpen}
        initialData={modalData}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchExercises}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Exercise"
        description={`Are you sure you want to delete "${deleteTarget?.title}" from the master exercise database?`}
        confirmLabel="Delete Exercise"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default AdminWorkoutDbView;
