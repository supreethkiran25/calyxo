import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { getTrainerTasks, createTrainerTask, updateTrainerTaskStatus, deleteTrainerTask, getTrainerClients } from '../../lib/dbService';
import { Plus, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';

const COLUMNS = [
  { id: 'todo', label: 'To Do' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'done', label: 'Done' },
  { id: 'archived', label: 'Archived' }
];

export default function TasksPage() {
  const user = useStore(s => s.user);
  
  const [tasks, setTasks] = useState([]);
  const [clients, setClients] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form State
  const [fTitle, setFTitle] = useState('');
  const [fClient, setFClient] = useState('');
  const [fPriority, setFPriority] = useState('medium');
  const [fDate, setFDate] = useState('');

  const loadTasks = async () => {
    if(!user?.uid) return;
    const t = await getTrainerTasks(user.uid);
    setTasks(t);
  };

  useEffect(() => {
    const initData = async () => {
      if(!user?.uid) return;
      await loadTasks();
      const c = await getTrainerClients(user.uid);
      setClients(c);
    };
    initData();
  }, [user]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if(!fTitle) return alert('Title required');
    await createTrainerTask({
      trainer_id: user.uid,
      title: fTitle,
      client_id: fClient || null,
      priority: fPriority,
      status: 'todo',
      due_date: fDate || null
    });
    setFTitle('');
    setFClient('');
    setFPriority('medium');
    setFDate('');
    setShowAddForm(false);
    await loadTasks();
  };

  const moveTask = async (taskId, currentStatus, dir) => {
    const currentIndex = COLUMNS.findIndex(c => c.id === currentStatus);
    const newIndex = currentIndex + dir;
    if(newIndex >= 0 && newIndex < COLUMNS.length) {
      const newStatus = COLUMNS[newIndex].id;
      // Optimistic update
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      await updateTrainerTaskStatus(taskId, newStatus);
    }
  };

  const handleDelete = async (taskId) => {
    if(window.confirm('Delete this task?')) {
      setTasks(tasks.filter(t => t.id !== taskId));
      await deleteTrainerTask(taskId);
    }
  };

  const getPriorityColor = (p) => {
    if(p === 'high') return 'text-destructive bg-destructive/10';
    if(p === 'medium') return 'text-orange-500 bg-orange-500/10';
    return 'text-blue-500 bg-blue-500/10';
  };

  return (
    <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col pb-10">
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-3xl font-black text-foreground">Task Management</h1>
          <p className="text-muted text-sm">Organize your workflow and client follow-ups.</p>
        </div>
        <button onClick={() => setShowAddForm(!showAddForm)} className="bg-acid-green text-black px-4 py-2 rounded-xl font-bold flex items-center gap-2 border-none cursor-pointer">
          {showAddForm ? 'Cancel' : <><Plus className="w-4 h-4"/> Add Task</>}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddTask} className="bg-surface border border-card-border p-6 rounded-3xl shrink-0 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-muted mb-2 uppercase">Task Title</label>
              <input value={fTitle} onChange={e=>setFTitle(e.target.value)} className="w-full bg-card-bg border border-card-border rounded-xl p-3 text-foreground font-bold outline-none" placeholder="e.g. Check in with Sarah on form" />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted mb-2 uppercase">Client (Optional)</label>
              <select value={fClient} onChange={e=>setFClient(e.target.value)} className="w-full bg-card-bg border border-card-border rounded-xl p-3 text-foreground font-bold outline-none">
                <option value="">None</option>
                {clients.map(c => <option key={c.id} value={c.user_id}>{c.user_profiles?.full_name || 'Client'}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-muted mb-2 uppercase">Priority</label>
              <select value={fPriority} onChange={e=>setFPriority(e.target.value)} className="w-full bg-card-bg border border-card-border rounded-xl p-3 text-foreground font-bold outline-none">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button type="submit" className="bg-acid-green text-black px-6 py-2 rounded-xl font-black border-none hover:bg-[#00b894] transition-colors">Save Task</button>
          </div>
        </form>
      )}

      <div className="flex-1 flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {COLUMNS.map(col => {
          const colTasks = tasks.filter(t => t.status === col.id);
          return (
            <div key={col.id} className="bg-surface/50 border border-card-border rounded-3xl p-4 w-80 min-w-[320px] flex flex-col h-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-black">{col.label}</h3>
                <span className="bg-card-bg text-muted font-bold text-xs px-2 py-1 rounded-lg">{colTasks.length}</span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 scrollbar-hide">
                {colTasks.length === 0 && <div className="text-center text-muted font-bold mt-4 border border-dashed border-card-border p-4 rounded-xl">No tasks</div>}
                {colTasks.map(t => {
                  const clientName = clients.find(c => c.user_id === t.client_id)?.user_profiles?.full_name || 'No Client';
                  return (
                    <div key={t.id} className="bg-card-bg border border-card-border p-4 rounded-2xl flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <span className={`px-2 py-1 text-[10px] uppercase font-black rounded-md ${getPriorityColor(t.priority)}`}>{t.priority}</span>
                        <button onClick={() => handleDelete(t.id)} className="text-muted hover:text-destructive"><Trash2 className="w-4 h-4"/></button>
                      </div>
                      <h4 className="font-bold text-sm mb-2">{t.title}</h4>
                      {t.client_id && <div className="text-xs text-muted mb-4 truncate">Client: {clientName}</div>}
                      
                      <div className="mt-auto pt-3 border-t border-card-border flex justify-between items-center">
                        <button 
                          onClick={() => moveTask(t.id, col.id, -1)} 
                          disabled={col.id === 'todo'} 
                          className="p-1 text-muted hover:text-foreground disabled:opacity-20 transition-colors"
                        ><ArrowLeft className="w-4 h-4"/></button>
                        <button 
                          onClick={() => moveTask(t.id, col.id, 1)} 
                          disabled={col.id === 'archived'} 
                          className="p-1 text-muted hover:text-foreground disabled:opacity-20 transition-colors"
                        ><ArrowRight className="w-4 h-4"/></button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
