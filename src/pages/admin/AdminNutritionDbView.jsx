import React, { useState, useEffect } from 'react';
import { Utensils, Search, Plus, Download, Upload, Trash2, Edit, ChevronLeft, ChevronRight, Database, PieChart } from 'lucide-react';
import Papa from 'papaparse';
import { toast } from 'sonner';
import { getAdminFoods, deleteAdminFood, saveAdminFood } from '../../services/adminService';
import { supabase } from '../../lib/supabaseClient';
import FoodEditorModal from '../../components/admin/FoodEditorModal';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import useDebounce from '../../hooks/useDebounce';

const ITEMS_PER_PAGE = 50;

const AdminNutritionDbView = () => {
  const [foods, setFoods] = useState([]);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [category, setCategory] = useState('');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [modalData, setModalData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchFoods = async () => {
    setLoading(true);
    const list = await getAdminFoods({ search: debouncedSearch, category });
    setFoods(list || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchFoods();
  }, [debouncedSearch, category]);

  useEffect(() => {
    const channel = supabase
      .channel('admin_nutrition_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'food_database' }, () => fetchFoods())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, category, sourceFilter]);

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

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteAdminFood(deleteTarget.id);
      toast.success(`Food "${deleteTarget.name}" deleted successfully.`);
      fetchFoods();
    } catch (err) {
      toast.error('Failed to delete food: ' + err.message);
    } finally {
      setDeleteTarget(null);
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
    toast.success('Exported nutrition database CSV.');
  };

  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target.result;
        const result = Papa.parse(text, { header: true, skipEmptyLines: true });
        let count = 0;
        for (const row of result.data) {
          await saveAdminFood({
            name: row.Name || row.name,
            category: row.Category || row.category || 'General',
            serving_size: row['Serving Size'] || row.serving_size || '100g',
            calories: Number(row.Calories || row.calories) || 0,
            protein: Number(row.Protein || row.protein) || 0,
            carbs: Number(row.Carbs || row.carbs) || 0,
            fat: Number(row.Fat || row.fat) || 0,
            fiber: Number(row.Fiber || row.fiber) || 0
          });
          count++;
        }
        toast.success(`Imported ${count} food items.`);
        fetchFoods();
      } catch (err) {
        toast.error('CSV Import Failed: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">Nutrition database</h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Master food catalog and macro reference
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          <label className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors">
            <Upload className="w-3.5 h-3.5 text-neutral-400" /> Import CSV
            <input type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
          </label>
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-neutral-400" /> Export CSV
          </button>
          <button
            onClick={() => { setModalData(null); setIsModalOpen(true); }}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add food item
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-medium">
              Total food items
            </span>
            <Utensils className="w-4 h-4 text-neutral-600" />
          </div>
          <div className="text-2xl font-semibold text-white">{foods.length.toLocaleString()}</div>
          <div className="text-[11px] text-neutral-500">Master catalog</div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-medium">
              Custom DB entries
            </span>
            <Database className="w-4 h-4 text-neutral-600" />
          </div>
          <div className="text-2xl font-semibold text-white">{customDbCount}</div>
          <div className="text-[11px] text-neutral-500">Supabase overrides</div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-medium">
              Average energy
            </span>
            <PieChart className="w-4 h-4 text-neutral-600" />
          </div>
          <div className="text-2xl font-semibold text-amber-400">{avgCalories} kcal</div>
          <div className="text-[11px] text-neutral-500">Per 100g serving</div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-medium">
              Average protein
            </span>
            <Utensils className="w-4 h-4 text-neutral-600" />
          </div>
          <div className="text-2xl font-semibold text-amber-400">{avgProtein}g</div>
          <div className="text-[11px] text-neutral-500">Per 100g serving</div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search food items..."
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-neutral-950 border border-neutral-800 text-neutral-300 text-xs rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none w-full md:w-auto"
          >
            <option value="">All categories</option>
            {['Poultry', 'Meat', 'Fish & Seafood', 'Grains', 'Dairy', 'Fruits & Vegetables', 'Nuts & Seeds', 'Supplements', 'General', 'Indian & Regional'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="bg-neutral-950 border border-neutral-800 text-neutral-300 text-xs rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none w-full md:w-auto"
          >
            <option value="ALL">All sources</option>
            <option value="CUSTOM">Custom DB</option>
            <option value="CATALOG">Standard catalog</option>
          </select>
        </div>
      </div>

      {/* Foods Datatable */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <span className="text-sm font-semibold text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-neutral-500" /> Food catalog ({filteredFoods.length.toLocaleString()})
          </span>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 flex justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-950 border-b border-neutral-800 text-[11px] uppercase tracking-wider text-neutral-500 font-medium">
                <tr>
                  <th className="p-4">Food item</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Serving size</th>
                  <th className="p-4">Calories</th>
                  <th className="p-4">Macros (P / C / F / Fib)</th>
                  <th className="p-4">Source</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {currentFoods.map(f => (
                  <tr key={f.id} className="hover:bg-neutral-800/50 transition-colors">
                    <td className="p-4 font-medium text-white text-sm">{f.name}</td>
                    <td className="p-4 text-neutral-400 text-xs">{f.category}</td>
                    <td className="p-4 text-neutral-400 font-mono text-[11px]">{f.serving_size}</td>
                    <td className="p-4 font-mono text-white text-xs">{f.calories} kcal</td>
                    <td className="p-4 font-mono text-xs">
                      <span className="text-blue-400 font-medium">P: {f.protein}g</span> •{' '}
                      <span className="text-amber-400 font-medium">C: {f.carbs}g</span> •{' '}
                      <span className="text-rose-400 font-medium">F: {f.fat}g</span> •{' '}
                      <span className="text-emerald-400 font-medium">Fib: {f.fiber}g</span>
                    </td>
                    <td className="p-4">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${
                        f.source === 'Supabase DB' 
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                          : 'bg-neutral-800 text-neutral-500 border-neutral-700'
                      }`}>
                        {f.source || 'Standard'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => { setModalData(f); setIsModalOpen(true); }}
                          className="p-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(f)}
                          className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                          title="Delete"
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
        <div className="bg-neutral-950 border-t border-neutral-800 p-4 flex items-center justify-between text-[11px] text-neutral-500 font-mono">
          <span>
            Showing {(page - 1) * ITEMS_PER_PAGE + 1} - {Math.min(page * ITEMS_PER_PAGE, filteredFoods.length)} of {filteredFoods.length}
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
      </div>

      <FoodEditorModal
        isOpen={isModalOpen}
        initialData={modalData}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchFoods}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete food item"
        description={`Are you sure you want to delete "${deleteTarget?.name}" from the nutrition database?`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default AdminNutritionDbView;
