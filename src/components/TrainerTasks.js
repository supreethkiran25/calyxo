import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronDown, CheckCircle2, Circle, Clock, Plus, Filter, MoreVertical, X, CheckSquare, Trash2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function TrainerTasks({ user, clients }) {
  const [tasks, setTasks] = useState([]);
  const [activeClient, setActiveClient] = useState(null);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // New Task Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [taskType, setTaskType] = useState('HABIT');
  const [priority, setPriority] = useState('MEDIUM');
  const [deadline, setDeadline] = useState('');

  useEffect(() => {
    if (clients && clients.length > 0 && !activeClient) {
      const active = clients.find(c => c.status === 'ACTIVE');
      if (active) setTimeout(() => setActiveClient(active), 0);
    }
  }, [clients, activeClient]);

  useEffect(() => {
    const fetchTasks = async () => {
      setIsLoading(true);
      const { data } = await supabase
        .from('trainer_assignments')
        .select('*')
        .eq('trainer_id', user.uid)
        .eq('client_id', activeClient.clientId)
        .order('due_date', { ascending: true });
        
      setTasks(data || []);
      setIsLoading(false);
    };

    if (activeClient && user?.uid) {
      fetchTasks();
    }
  }, [activeClient, user]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!title || !activeClient) return;

    const newTask = {
      trainer_id: user.uid,
      client_id: activeClient.clientId,
      title,
      description,
      task_type: taskType,
      priority,
      deadline: deadline ? new Date(deadline).toISOString() : null,
      is_completed: false
    };

    const { error } = await supabase.from('trainer_tasks').insert(newTask);
    if (error) {
      alert("Error adding task: " + error.message);
    } else {
      setIsAddingTask(false);
      setTitle(''); setDescription(''); setDeadline('');
      fetchTasks();
    }
  };

  const deleteTask = async (id) => {
    if (window.confirm("Delete this task?")) {
      await supabase.from('trainer_tasks').delete().eq('id', id);
      fetchTasks();
    }
  };

  const getPriorityColor = (p) => {
    if (p === 'HIGH') return 'text-red-500 bg-red-500/10';
    if (p === 'MEDIUM') return 'text-yellow-500 bg-yellow-500/10';
    return 'text-green-500 bg-green-500/10';
  };

  const activeClientsList = clients?.filter(c => c.status === 'ACTIVE') || [];
  
  const completedTasks = tasks.filter(t => t.is_completed).length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground">Task Management</h1>
          <p className="text-muted text-sm">Assign daily habits, homework, and weekly goals.</p>
        </div>
        {activeClient && (
          <button 
            onClick={() => setIsAddingTask(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-xl flex items-center justify-center gap-2 border-none cursor-pointer shadow-lg shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" /> Create Task
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Column: Client Selector */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-surface border border-card-border rounded-3xl p-4 overflow-hidden">
            <h3 className="font-bold text-sm uppercase tracking-wider mb-4 px-2">Select Client</h3>
            <div className="space-y-2">
              {activeClientsList.map(c => (
                <div 
                  key={c.clientId}
                  onClick={() => setActiveClient(c)}
                  className={`p-3 rounded-xl flex items-center gap-3 cursor-pointer transition-colors ${activeClient?.clientId === c.clientId ? 'bg-blue-500/10 text-blue-500 font-bold border border-blue-500/30' : 'hover:bg-card-bg text-muted border border-transparent'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${activeClient?.clientId === c.clientId ? 'bg-blue-500 text-white' : 'bg-card-border text-foreground'}`}>
                    {c.name.charAt(0)}
                  </div>
                  <span className="truncate">{c.name}</span>
                </div>
              ))}
              {activeClientsList.length === 0 && (
                <div className="text-center text-xs text-muted py-8">No active clients.</div>
              )}
            </div>
          </div>
          
          {activeClient && (
            <div className="bg-surface border border-card-border p-6 rounded-3xl text-center">
              <h3 className="font-bold text-xs uppercase tracking-wider text-muted mb-2">Compliance</h3>
              <div className="text-4xl font-black text-blue-500 mb-1">{completionRate}%</div>
              <p className="text-xs text-muted">{completedTasks} of {totalTasks} tasks completed</p>
            </div>
          )}
        </div>

        {/* Right Column: Task List */}
        <div className="lg:col-span-3">
          {activeClient ? (
            <div className="bg-surface border border-card-border p-6 rounded-3xl shadow-sm min-h-[500px]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-blue-500" /> 
                  Tasks for {activeClient.name}
                </h2>
              </div>

              {isLoading ? (
                <div className="text-center text-muted py-12">Loading tasks...</div>
              ) : tasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted opacity-50">
                  <CheckSquare className="w-12 h-12 mb-4" />
                  <p className="font-bold">No tasks assigned yet.</p>
                  <p className="text-xs">Create a habit or goal to track compliance.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tasks.map(task => (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={task.id} className={`p-4 rounded-2xl border flex items-start gap-4 transition-colors ${task.is_completed ? 'bg-background border-card-border opacity-75' : 'bg-card-bg border-blue-500/20 shadow-sm'}`}>
                      <button className="bg-transparent border-none mt-1 shrink-0 opacity-80 cursor-default">
                        {task.is_completed ? <CheckCircle2 className="w-6 h-6 text-green-500" /> : <Circle className="w-6 h-6 text-muted" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className={`font-bold text-sm ${task.is_completed ? 'line-through text-muted' : 'text-foreground'}`}>{task.title}</h4>
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded ml-2 ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>
                        {task.description && <p className="text-xs text-muted mb-3 line-clamp-2">{task.description}</p>}
                        
                        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-muted">
                          <span className="bg-surface border border-card-border px-2 py-1 rounded">{task.task_type}</span>
                          {task.deadline && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Due {new Date(task.deadline).toLocaleDateString()}
                            </span>
                          )}
                          {task.is_completed && task.completed_at && (
                            <span className="text-green-500">Done {new Date(task.completed_at).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      <button onClick={() => deleteTask(task.id)} className="p-2 text-muted hover:text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer border-none bg-transparent transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted border border-dashed border-card-border rounded-3xl p-12 text-center">
              Select a client to manage their tasks and view compliance.
            </div>
          )}
        </div>
      </div>

      {/* Add Task Modal */}
      {isAddingTask && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card-bg w-full max-w-lg rounded-3xl border border-card-border p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6 border-b border-card-border pb-4">
              <h2 className="text-xl font-black flex items-center gap-2"><CheckSquare className="w-5 h-5 text-blue-500" /> New Task</h2>
              <button onClick={() => setIsAddingTask(false)} className="text-muted hover:text-foreground cursor-pointer border-none bg-transparent">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">Task Title</label>
                <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Drink 3L Water" className="w-full bg-[var(--input)] text-foreground border border-card-border px-3 py-2.5 rounded-xl focus:outline-none focus:border-blue-500 text-sm shadow-inner" />
              </div>

              <div>
                <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional instructions..." rows={3} className="w-full bg-[var(--input)] text-foreground border border-card-border px-3 py-2 rounded-xl focus:outline-none focus:border-blue-500 text-sm resize-none shadow-inner" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">Category</label>
                  <select value={taskType} onChange={(e) => setTaskType(e.target.value)} className="w-full bg-[var(--input)] text-foreground border border-card-border px-3 py-2.5 rounded-xl focus:outline-none focus:border-blue-500 text-sm shadow-inner">
                    <option value="HABIT">Daily Habit</option>
                    <option value="HOMEWORK">Homework</option>
                    <option value="READING">Reading Material</option>
                    <option value="MEAL_PREP">Meal Prep</option>
                    <option value="RECOVERY">Recovery</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">Priority</label>
                  <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full bg-[var(--input)] text-foreground border border-card-border px-3 py-2.5 rounded-xl focus:outline-none focus:border-blue-500 text-sm shadow-inner">
                    <option value="HIGH">High (Red)</option>
                    <option value="MEDIUM">Medium (Yellow)</option>
                    <option value="LOW">Low (Green)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">Deadline (Optional)</label>
                <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="w-full bg-[var(--input)] text-foreground border border-card-border px-3 py-2.5 rounded-xl focus:outline-none focus:border-blue-500 text-sm shadow-inner" />
              </div>

              <div className="pt-4 border-t border-card-border">
                <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/20 border-none cursor-pointer flex justify-center items-center gap-2">
                  <CheckSquare className="w-4 h-4" /> Assign to Client
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
