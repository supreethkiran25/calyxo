import React, { useState, useEffect } from 'react';
import { Dumbbell, Search, Plus, Download, Upload, Trash2, Edit, Filter } from 'lucide-react';
import { getAdminExercises, deleteAdminExercise, saveAdminExercise } from '../../services/adminService';
import ExerciseEditorModal from '../../components/admin/ExerciseEditorModal';

const AdminWorkoutDbView = () => {
  const [exercises, setExercises] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [modalData, setModalData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchExercises = async () => {
    const list = await getAdminExercises({ search, category, difficulty });
    setExercises(list);
  };

  useEffect(() => {
    fetchExercises();
  }, [search, category, difficulty]);

  const handleDelete = async (id, title) => {
    if (window.confirm(`Delete exercise "${title}" from master database?`)) {
      await deleteAdminExercise(id);
      fetchExercises();
    }
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exercises, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `calyxo_workout_database.json`;
    a.click();
  };

  const handleImportJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const imported = JSON.parse(evt.target.result);
        if (Array.isArray(imported)) {
          for (const item of imported) {
            await saveAdminExercise(item);
          }
          fetchExercises();
          alert(`Successfully imported ${imported.length} exercises!`);
        }
      } catch (err) {
        alert('Invalid JSON file format.');
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
            Manage exercise library, muscle targeting, instructions, equipment & media
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
            <Upload className="w-4 h-4 text-indigo-400" /> Import JSON
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>
          <button
            onClick={handleExportJSON}
            className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-semibold flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-neutral-400" /> Export JSON
          </button>
          <button
            onClick={() => { setModalData(null); setIsModalOpen(true); }}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/20"
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {exercises.map(ex => (
          <div key={ex.id} className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 hover:border-neutral-700 transition-all space-y-3 flex flex-col justify-between group">
            <div className="space-y-2">
              <div className="h-36 rounded-xl overflow-hidden bg-neutral-950 relative">
                <img src={ex.image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
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
                  className="p-1.5 rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(ex.id, ex.title)}
                  className="p-1.5 rounded-lg bg-red-950/40 text-red-400 hover:bg-red-900/60 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ExerciseEditorModal
        isOpen={isModalOpen}
        initialData={modalData}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchExercises}
      />
    </div>
  );
};

export default AdminWorkoutDbView;
