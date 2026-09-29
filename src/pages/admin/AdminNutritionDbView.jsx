import React, { useState, useEffect } from 'react';
import { Utensils, Search, Plus, Download, Upload, Trash2, Edit, ChevronLeft, ChevronRight, Database, PieChart } from 'lucide-react';
import Papa from 'papaparse';
import { toast } from 'sonner';
import { getAdminFoods, deleteAdminFood, saveAdminFood } from '../../services/adminService';
import { supabase } from '../../lib/supabaseClient';
import FoodEditorModal from '../../components/admin/FoodEditorModal';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import useDebounce from '../../hooks/useDebounce';
import {
  AdminPageHeader,
  AdminStatCard,
  AdminSearchInput
} from '../../components/admin/AdminUIPrimitives';

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
      {/* 1. Header */}
      <AdminPageHeader
        title="Nutrition Database"
        description="Master food items, macronutrient profiles, caloric reference, and regional catalog"
        badge={`${foods.length} items`}
        actions={
          <div className="flex items-center gap-2">
            <label className="px-3.5 py-1.5 rounded-xl bg-[#141724] hover:bg-[#1a1f30] border border-white/10 text-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs">
              <Upload className="w-3.5 h-3.5 text-slate-400" />
              <span>Import CSV</span>
              <input type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
            </label>
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-1.5 rounded-xl bg-[#141724] hover:bg-[#1a1f30] border border-white/10 text-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => { setModalData(null); setIsModalOpen(true); }}
              className="px-3.5 py-1.5 rounded-xl bg-[#d4ff00] hover:bg-[#a3e635] text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-[#d4ff00]/10"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Food Item</span>
            </button>
          </div>
        }
      />

      {/* 2. Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <AdminStatCard
          title="Total Food Items"
          value={foods.length.toLocaleString()}
          icon={Utensils}
          subtitle="Master database catalog"
        />
        <AdminStatCard
          title="Custom DB Entries"
          value={customDbCount.toString()}
          icon={Database}
          subtitle="Database overrides"
        />
        <AdminStatCard
          title="Average Energy"
          value={`${avgCalories} kcal`}
          icon={PieChart}
          subtitle="Per 100g serving"
        />
        <AdminStatCard
          title="Average Protein"
          value={`${avgProtein}g`}
          icon={Utensils}
          subtitle="Per 100g serving"
        />
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="p-4 bg-[#0e121d] border border-white/10 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
        <AdminSearchInput
          value={search}
          onChange={setSearch}
          placeholder="Filter food items..."
          onClear={() => setSearch('')}
        />

        <div className="flex items-center gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-[#141724] border border-white/10 text-slate-200 text-xs font-sans rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#d4ff00]/60 cursor-pointer font-medium"
          >
            <option value="">All Categories</option>
            {['Poultry', 'Meat', 'Fish & Seafood', 'Grains', 'Dairy', 'Fruits & Vegetables', 'Nuts & Seeds', 'Supplements', 'General', 'Indian & Regional'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="bg-[#141724] border border-white/10 text-slate-200 text-xs font-sans rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#d4ff00]/60 cursor-pointer font-medium"
          >
            <option value="ALL">All Sources</option>
            <option value="CUSTOM">Custom DB</option>
            <option value="CATALOG">Standard Catalog</option>
          </select>
        </div>
      </div>

      {/* 4. Foods Datatable */}
      <div className="bg-[#0e121d] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-xs font-sans text-slate-400">
              Loading nutrition catalog...
            </div>
          ) : filteredFoods.length === 0 ? (
            <div className="p-12 text-center text-xs font-sans text-slate-400">
              No matching food items found
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-[#07090e] text-slate-400 font-sans uppercase text-[10px] tracking-wider">
                  <th className="p-4 font-semibold">Food Item</th>
                  <th className="p-4 font-semibold">Category</th>
                  <th className="p-4 font-semibold">Serving Size</th>
                  <th className="p-4 font-semibold">Calories</th>
                  <th className="p-4 font-semibold">Macros (P / C / F / Fib)</th>
                  <th className="p-4 font-semibold">Source</th>
                  <th className="p-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {currentFoods.map(f => (
                  <tr key={f.id} className="hover:bg-[#141828]/50 transition-colors">
                    <td className="p-4 font-semibold text-white text-xs">{f.name}</td>
                    <td className="p-4 text-slate-400 text-xs">{f.category}</td>
                    <td className="p-4 text-slate-400 text-[11px] font-mono">{f.serving_size}</td>
                    <td className="p-4 font-bold text-[#d4ff00] text-xs font-sans">{f.calories} kcal</td>
                    <td className="p-4 text-[11px] text-slate-300 font-medium">
                      P: {f.protein}g · C: {f.carbs}g · F: {f.fat}g · Fib: {f.fiber}g
                    </td>
                    <td className="p-4">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-white/5">
                        {f.source || 'Standard'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => { setModalData(f); setIsModalOpen(true); }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(f)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
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
        <div className="bg-[#090c14] border-t border-white/10 p-4 flex items-center justify-between text-xs text-slate-400 font-sans">
          <span className="font-medium">
            Showing <strong className="text-white">{(page - 1) * ITEMS_PER_PAGE + 1}</strong> - <strong className="text-white">{Math.min(page * ITEMS_PER_PAGE, filteredFoods.length)}</strong> of <strong className="text-white">{filteredFoods.length}</strong> items
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
