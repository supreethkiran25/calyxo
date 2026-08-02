import React, { useState, useEffect } from 'react';
import { Utensils, Search, Plus, Download, Upload, Trash2, Edit } from 'lucide-react';
import { getAdminFoods, deleteAdminFood, saveAdminFood } from '../../services/adminService';
import FoodEditorModal from '../../components/admin/FoodEditorModal';

const AdminNutritionDbView = () => {
  const [foods, setFoods] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [modalData, setModalData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchFoods = async () => {
    const list = await getAdminFoods({ search, category });
    setFoods(list);
  };

  useEffect(() => {
    fetchFoods();
  }, [search, category]);

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete food "${name}" from nutrition database?`)) {
      await deleteAdminFood(id);
      fetchFoods();
    }
  };

  const handleExportCSV = () => {
    let csv = 'ID,Name,Category,Serving Size,Calories,Protein,Carbs,Fat,Fiber\n';
    foods.forEach(f => {
      csv += `"${f.id}","${f.name}","${f.category}","${f.serving_size}",${f.calories},${f.protein},${f.carbs},${f.fat},${f.fiber}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `calyxo_nutrition_database.csv`;
    a.click();
  };

  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target.result;
        const lines = text.split('\n').slice(1);
        for (const line of lines) {
          if (!line.trim()) continue;
          const parts = line.split(',').map(p => p.replace(/"/g, '').trim());
          if (parts.length >= 8) {
            await saveAdminFood({
              name: parts[1],
              category: parts[2],
              serving_size: parts[3],
              calories: Number(parts[4]) || 100,
              protein: Number(parts[5]) || 0,
              carbs: Number(parts[6]) || 0,
              fat: Number(parts[7]) || 0,
              fiber: Number(parts[8]) || 0
            });
          }
        }
        fetchFoods();
        alert('CSV Import Completed successfully!');
      } catch (err) {
        alert('Error parsing CSV file.');
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
            <Utensils className="w-6 h-6 text-amber-400" /> Master Nutrition Database
          </h1>
          <p className="text-xs text-neutral-400 font-mono mt-0.5">
            Manage food catalog, macro values, serving sizes & calorie database
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
            <Upload className="w-4 h-4 text-amber-400" /> Import CSV
            <input type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
          </label>
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-semibold flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-neutral-400" /> Export CSV
          </button>
          <button
            onClick={() => { setModalData(null); setIsModalOpen(true); }}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" /> Add Food Item
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search food item by name..."
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-neutral-950 border border-neutral-800 text-neutral-300 text-xs rounded-xl px-3 py-2 focus:outline-none w-full md:w-auto"
        >
          <option value="">All Categories</option>
          {['Poultry', 'Meat', 'Fish & Seafood', 'Grains', 'Dairy', 'Fruits & Vegetables', 'Nuts & Seeds', 'Supplements'].map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Foods Datatable */}
      <div className="rounded-3xl bg-neutral-900/60 border border-neutral-800/80 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-950/80 border-b border-neutral-800 text-neutral-400 font-mono uppercase text-[11px]">
              <tr>
                <th className="p-4 font-bold">Food Item</th>
                <th className="p-4 font-bold">Category</th>
                <th className="p-4 font-bold">Serving Size</th>
                <th className="p-4 font-bold">Calories</th>
                <th className="p-4 font-bold">Macros (P / C / F / Fiber)</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {foods.map(f => (
                <tr key={f.id} className="hover:bg-neutral-800/40 transition-colors">
                  <td className="p-4 font-bold text-white text-sm">{f.name}</td>
                  <td className="p-4">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-amber-300 border border-neutral-700">
                      {f.category}
                    </span>
                  </td>
                  <td className="p-4 text-neutral-400 font-mono">{f.serving_size}</td>
                  <td className="p-4 font-bold text-amber-400 font-mono">{f.calories} kcal</td>
                  <td className="p-4 font-mono text-neutral-300">
                    <span className="text-indigo-400 font-bold">P: {f.protein}g</span> •{' '}
                    <span className="text-amber-400 font-bold">C: {f.carbs}g</span> •{' '}
                    <span className="text-rose-400 font-bold">F: {f.fat}g</span> •{' '}
                    <span className="text-emerald-400">Fib: {f.fiber}g</span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => { setModalData(f); setIsModalOpen(true); }}
                        className="p-1.5 rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(f.id, f.name)}
                        className="p-1.5 rounded-lg bg-red-950/40 text-red-400 hover:bg-red-900/60"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <FoodEditorModal
        isOpen={isModalOpen}
        initialData={modalData}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchFoods}
      />
    </div>
  );
};

export default AdminNutritionDbView;
