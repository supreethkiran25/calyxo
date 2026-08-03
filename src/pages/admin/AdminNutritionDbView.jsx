import React, { useState, useEffect } from 'react';
import { Utensils, Search, Plus, Download, Upload, Trash2, Edit, ChevronLeft, ChevronRight, Database, Sparkles, PieChart } from 'lucide-react';
import { getAdminFoods, deleteAdminFood, saveAdminFood } from '../../services/adminService';
import { supabase } from '../../lib/supabaseClient';
import FoodEditorModal from '../../components/admin/FoodEditorModal';

const ITEMS_PER_PAGE = 50;

const AdminNutritionDbView = () => {
  const [foods, setFoods] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [modalData, setModalData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchFoods = async () => {
    setLoading(true);
    const list = await getAdminFoods({ search, category });
    setFoods(list || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchFoods();

    // Supabase Realtime Channel
    const channel = supabase
      .channel('admin_nutrition_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'food_database' }, () => fetchFoods())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [search, category]);

  useEffect(() => {
    setPage(1);
  }, [search, category, sourceFilter]);

  const filteredFoods = foods.filter(f => {
    if (sourceFilter === 'CUSTOM') return f.source === 'Supabase DB';
    if (sourceFilter === 'CATALOG') return f.source === 'Catalog';
    return true;
  });

  const totalPages = Math.ceil(filteredFoods.length / ITEMS_PER_PAGE) || 1;
  const currentFoods = filteredFoods.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const customDbCount = foods.filter(f => f.source === 'Supabase DB').length;
  const avgCalories = foods.length > 0 ? Math.round(foods.reduce((acc, curr) => acc + (Number(curr.calories) || 0), 0) / foods.length) : 0;
  const avgProtein = foods.length > 0 ? (foods.reduce((acc, curr) => acc + (Number(curr.protein) || 0), 0) / foods.length).toFixed(1) : 0;

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete food "${name}" from nutrition database?`)) {
      await deleteAdminFood(id);
      fetchFoods();
    }
  };

  const handleExportCSV = () => {
    let csv = 'ID,Name,Category,Serving Size,Calories,Protein,Carbs,Fat,Fiber,Source\n';
    filteredFoods.forEach(f => {
      csv += `"${f.id}","${f.name}","${f.category}","${f.serving_size}",${f.calories},${f.protein},${f.carbs},${f.fat},${f.fiber},"${f.source || 'Catalog'}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `calyxo_master_nutrition_db.csv`;
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
        let count = 0;
        for (const line of lines) {
          if (!line.trim()) continue;
          const parts = line.split(',').map(p => p.replace(/"/g, '').trim());
          if (parts.length >= 8) {
            await saveAdminFood({
              name: parts[1],
              category: parts[2] || 'General',
              serving_size: parts[3] || '100g',
              calories: Number(parts[4]) || 100,
              protein: Number(parts[5]) || 0,
              carbs: Number(parts[6]) || 0,
              fat: Number(parts[7]) || 0,
              fiber: Number(parts[8]) || 0
            });
            count++;
          }
        }
        fetchFoods();
        alert(`Successfully imported ${count} food item(s) to master database!`);
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
            <Utensils className="w-6 h-6 text-amber-400" /> Master Nutrition Catalog & Database
          </h1>
          <p className="text-xs text-neutral-400 font-mono mt-0.5">
            Manage food catalog, macro values, custom entries & calorie database
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <label className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
            <Upload className="w-4 h-4 text-amber-400" /> Import CSV
            <input type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
          </label>
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4 text-neutral-400" /> Export CSV
          </button>
          <button
            onClick={() => { setModalData(null); setIsModalOpen(true); }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Food Item
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
          <span className="text-xs text-neutral-400 font-medium block">Total Master Food Items</span>
          <span className="text-2xl font-bold text-amber-400 block mt-1">{foods.length.toLocaleString()}</span>
          <span className="text-[10px] text-neutral-500 font-mono mt-1 block">Full Ecosystem Catalog</span>
        </div>
        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
          <span className="text-xs text-neutral-400 font-medium block">Custom DB Entries</span>
          <span className="text-2xl font-bold text-indigo-400 block mt-1">{customDbCount}</span>
          <span className="text-[10px] text-neutral-500 font-mono mt-1 block">Admin Overrides</span>
        </div>
        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
          <span className="text-xs text-neutral-400 font-medium block">Average Energy (100g)</span>
          <span className="text-2xl font-bold text-emerald-400 block mt-1">{avgCalories} kcal</span>
          <span className="text-[10px] text-neutral-500 font-mono mt-1 block">Across Catalog</span>
        </div>
        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
          <span className="text-xs text-neutral-400 font-medium block">Average Protein (100g)</span>
          <span className="text-2xl font-bold text-purple-400 block mt-1">{avgProtein}g</span>
          <span className="text-[10px] text-neutral-500 font-mono mt-1 block">Macro Density</span>
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

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-neutral-950 border border-neutral-800 text-neutral-300 text-xs rounded-xl px-3 py-2 focus:outline-none w-full md:w-auto"
          >
            <option value="">All Categories</option>
            {['Poultry', 'Meat', 'Fish & Seafood', 'Grains', 'Dairy', 'Fruits & Vegetables', 'Nuts & Seeds', 'Supplements', 'General', 'Indian & Regional'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="bg-neutral-950 border border-neutral-800 text-neutral-300 text-xs rounded-xl px-3 py-2 focus:outline-none w-full md:w-auto"
          >
            <option value="ALL">All Sources</option>
            <option value="CUSTOM">Custom DB Overrides</option>
            <option value="CATALOG">Standard Catalog</option>
          </select>
        </div>
      </div>

      {/* Foods Datatable */}
      <div className="rounded-3xl bg-neutral-900/60 border border-neutral-800/80 overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <span className="text-xs font-bold text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-amber-400" /> Showing {filteredFoods.length.toLocaleString()} Food Items
          </span>
          <span className="text-xs text-neutral-400 font-mono">
            Page {page} of {totalPages}
          </span>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 flex justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-950/80 border-b border-neutral-800 text-neutral-400 font-mono uppercase text-[11px]">
                <tr>
                  <th className="p-4 font-bold">Food Item</th>
                  <th className="p-4 font-bold">Category</th>
                  <th className="p-4 font-bold">Serving Size</th>
                  <th className="p-4 font-bold">Calories</th>
                  <th className="p-4 font-bold">Macros (P / C / F / Fiber)</th>
                  <th className="p-4 font-bold">Source</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {currentFoods.map(f => (
                  <tr key={f.id} className="hover:bg-neutral-800/40 transition-colors font-mono">
                    <td className="p-4 font-bold text-white text-sm font-sans">{f.name}</td>
                    <td className="p-4">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-amber-300 border border-neutral-700">
                        {f.category}
                      </span>
                    </td>
                    <td className="p-4 text-neutral-400">{f.serving_size}</td>
                    <td className="p-4 font-bold text-amber-400">{f.calories} kcal</td>
                    <td className="p-4 text-neutral-300">
                      <span className="text-indigo-400 font-bold">P: {f.protein}g</span> •{' '}
                      <span className="text-amber-400 font-bold">C: {f.carbs}g</span> •{' '}
                      <span className="text-rose-400 font-bold">F: {f.fat}g</span> •{' '}
                      <span className="text-emerald-400">Fib: {f.fiber}g</span>
                    </td>
                    <td className="p-4">
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded border uppercase ${
                        f.source === 'Supabase DB' 
                          ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 font-bold' 
                          : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                      }`}>
                        {f.source || 'Catalog'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => { setModalData(f); setIsModalOpen(true); }}
                          className="p-1.5 rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 cursor-pointer"
                          title="Edit Food"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(f.id, f.name)}
                          className="p-1.5 rounded-lg bg-red-950/40 text-red-400 hover:bg-red-900/60 cursor-pointer"
                          title="Delete Food"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-neutral-800 flex items-center justify-between">
          <span className="text-xs text-neutral-400 font-mono">
            Showing {(page - 1) * ITEMS_PER_PAGE + 1} - {Math.min(page * ITEMS_PER_PAGE, filteredFoods.length)} of {filteredFoods.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
              className="p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-amber-400 font-mono px-3 py-1 rounded-lg bg-neutral-950 border border-neutral-800">
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
