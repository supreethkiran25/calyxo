import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../store/useStore';
import { getClientFullProfile, getClientActivityLogs, getUserAssignments, getMessages, sendMessage, markMessagesRead, assignPlan, saveTrainerTemplate } from '../../lib/dbService';
import { supabase } from '../../lib/supabaseClient';
import { User as UserIcon, Calendar, Activity, ChevronLeft, Dumbbell, FileText, LayoutList, MessageCircle, FilePenLine, Send } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

export default function ClientProfilePage() {
  const { id: clientId } = useParams();
  const trainer = useStore(s => s.user);

  const [activeTab, setActiveTab] = useState('overview');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Data states
  const [workouts, setWorkouts] = useState([]);
  const [foods, setFoods] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!trainer?.uid || !clientId) return;
    
    const loadAll = async () => {
      setLoading(true);
      const prof = await getClientFullProfile(clientId);
      setProfile(prof || { full_name: 'Unknown Client', goal: 'Not specified', joined: new Date().toISOString() });
      
      const logs = await getClientActivityLogs(clientId, 30);
      setWorkouts(logs.workouts || []);
      setFoods(logs.foods || []);

      const assign = await getUserAssignments(clientId);
      setAssignments(assign || []);

      const msgs = await getMessages(clientId, trainer.uid);
      setMessages(msgs || []);
      await markMessagesRead(clientId, trainer.uid);

      setLoading(false);
    };

    loadAll();
  }, [trainer, clientId]);

  if (loading) return <div className="p-8 text-muted font-bold animate-pulse">Loading client profile...</div>;

  const TABS = [
    { id: 'overview', label: 'Overview', icon: LayoutList },
    { id: 'workouts', label: 'Workouts', icon: Dumbbell },
    { id: 'nutrition', label: 'Nutrition', icon: FileText },
    { id: 'assignments', label: 'Assignments', icon: FilePenLine },
    { id: 'messages', label: 'Messages', icon: MessageCircle },
    { id: 'notes', label: 'Notes', icon: FilePenLine },
  ];

  return (
    <div className="space-y-6 h-[calc(100vh-80px)] flex flex-col">
      <Link href="/trainer/clients" className="flex items-center gap-2 text-muted hover:text-acid-green transition-colors w-max text-sm font-bold">
        <ChevronLeft className="w-4 h-4" /> Back to Clients
      </Link>

      {/* Header */}
      <div className="bg-surface border border-card-border p-6 rounded-3xl flex items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-card-bg flex items-center justify-center text-3xl font-black text-acid-green border-2 border-acid-green/20">
          {profile?.full_name?.charAt(0) || profile?.nickname?.charAt(0) || '?'}
        </div>
        <div>
          <h1 className="text-3xl font-black text-foreground">{profile?.full_name || profile?.nickname || 'Client Profile'}</h1>
          <div className="flex gap-4 mt-2 text-sm text-muted font-bold">
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Joined {profile?.joined ? new Date(profile.joined).toLocaleDateString() : 'Recently'}</span>
            <span className="flex items-center gap-1"><Activity className="w-4 h-4" /> Goal: <span className="text-foreground capitalize">{profile?.goal || 'None'}</span></span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold capitalize transition-all whitespace-nowrap border-none cursor-pointer ${activeTab === tab.id ? 'bg-acid-green text-black shadow-[0_4px_14px_0_rgba(0,212,170,0.39)]' : 'bg-surface text-muted hover:text-foreground hover:bg-card-bg border border-card-border'}`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'overview' && <TabOverview workouts={workouts} foods={foods} />}
        {activeTab === 'workouts' && <TabWorkouts workouts={workouts} />}
        {activeTab === 'nutrition' && <TabNutrition foods={foods} />}
        {activeTab === 'assignments' && <TabAssignments assignments={assignments} trainerId={trainer?.uid} clientId={clientId} onUpdate={(n) => setAssignments([...assignments, n])} />}
        {activeTab === 'messages' && <TabMessages messages={messages} trainerId={trainer?.uid} clientId={clientId} />}
        {activeTab === 'notes' && <TabNotes notes={assignments.filter(a => a.type === 'note')} trainerId={trainer?.uid} clientId={clientId} onUpdate={(n) => setAssignments([...assignments, n])} />}
      </div>
    </div>
  );
}

function TabOverview({ workouts, foods }) {
  const now = new Date().getTime();
  const workoutsThisWeek = workouts.filter(w => (now - w.timestamp) <= 7 * 24 * 60 * 60 * 1000).length;
  const avgCals = foods.length > 0 ? Math.round(foods.reduce((sum, f) => sum + (f.calories || 0), 0) / (foods.length || 1)) : 0;
  
  return (
    <div className="space-y-6 h-full overflow-y-auto scrollbar-hide pb-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface border border-card-border p-6 rounded-3xl">
          <div className="text-muted text-sm font-bold uppercase tracking-wider mb-2">Workouts (7d)</div>
          <div className="text-4xl font-black text-acid-green">{workoutsThisWeek}</div>
        </div>
        <div className="bg-surface border border-card-border p-6 rounded-3xl">
          <div className="text-muted text-sm font-bold uppercase tracking-wider mb-2">Avg Calories (30d)</div>
          <div className="text-4xl font-black text-purple-500">{avgCals} kcal</div>
        </div>
        <div className="bg-surface border border-card-border p-6 rounded-3xl">
          <div className="text-muted text-sm font-bold uppercase tracking-wider mb-2">Avg Water Intake</div>
          <div className="text-4xl font-black text-blue-500">2.5 L</div>
        </div>
      </div>
      <div className="bg-surface border border-card-border p-6 rounded-3xl">
        <h3 className="font-black text-lg mb-4">Recent Activity</h3>
        {workouts.slice(0,3).map(w => (
          <div key={w.id} className="py-3 border-b border-card-border last:border-0 flex justify-between">
            <div>
              <span className="font-bold">Logged Workout: {w.name || 'Custom Workout'}</span>
              <div className="text-xs text-muted">{new Date(w.timestamp).toLocaleString()}</div>
            </div>
            <div className="text-acid-green font-bold text-sm">+{w.duration || 30} mins</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TabWorkouts({ workouts }) {
  return (
    <div className="h-full overflow-y-auto scrollbar-hide pb-20 space-y-4">
      {workouts.length === 0 ? <p className="text-muted p-4 bg-surface rounded-xl border border-card-border">No workouts logged in the last 30 days.</p> : null}
      {workouts.map(w => (
        <div key={w.id} className="bg-surface border border-card-border p-5 rounded-2xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-black text-lg">{w.name || 'Workout'}</h3>
            <span className="text-sm text-muted font-bold">{new Date(w.timestamp).toLocaleDateString()}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-card-bg p-3 rounded-xl border border-card-border">
              <div className="text-muted text-xs uppercase mb-1">Duration</div>
              <div className="font-bold">{w.duration || '--'} mins</div>
            </div>
            <div className="bg-card-bg p-3 rounded-xl border border-card-border">
              <div className="text-muted text-xs uppercase mb-1">Exercises</div>
              <div className="font-bold">{w.exercises?.length || 0}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TabNutrition({ foods }) {
  return (
    <div className="h-full overflow-y-auto scrollbar-hide pb-20 space-y-4">
      {foods.length === 0 ? <p className="text-muted p-4 bg-surface rounded-xl border border-card-border">No foods logged in the last 30 days.</p> : null}
      {foods.map(f => (
        <div key={f.id} className="bg-surface border border-card-border p-4 rounded-2xl flex justify-between items-center">
          <div>
            <h3 className="font-bold text-md">{f.name || f.food_name || 'Food Item'}</h3>
            <span className="text-xs text-muted">{new Date(f.timestamp).toLocaleDateString()}</span>
          </div>
          <div className="flex gap-4 text-sm font-bold text-center">
            <div className="text-purple-500">{f.calories || 0} kcal</div>
            <div className="text-blue-500">{f.protein || 0}g P</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TabAssignments({ assignments, trainerId, clientId, onUpdate }) {
  const [formOpen, setFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('workout_plan');
  const [content, setContent] = useState('');

  const plans = assignments.filter(a => a.type === 'workout_plan' || a.type === 'meal_plan' || a.type === 'goal');

  const handleAssign = async (e) => {
    e.preventDefault();
    if(!title.trim()) return;
    const payload = { type, title, content: { text: content } };
    await assignPlan(trainerId, clientId, payload);
    onUpdate({ ...payload, id: Date.now(), assigned_at: new Date().toISOString() });
    setFormOpen(false);
    setTitle('');
    setContent('');
  };

  return (
    <div className="h-full overflow-y-auto scrollbar-hide pb-20 space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-black text-lg">Active Assignments</h3>
        <button onClick={() => setFormOpen(!formOpen)} className="bg-acid-green text-black px-4 py-2 rounded-xl font-bold text-sm border-none cursor-pointer">
          {formOpen ? 'Cancel' : 'Assign New Plan'}
        </button>
      </div>

      {formOpen && (
        <form onSubmit={handleAssign} className="bg-surface p-6 rounded-3xl border border-card-border space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-muted mb-2 uppercase">Type</label>
              <select value={type} onChange={e => setType(e.target.value)} className="w-full bg-card-bg border border-card-border rounded-xl p-3 text-foreground font-bold outline-none">
                <option value="workout_plan">Workout Plan</option>
                <option value="meal_plan">Meal Plan</option>
                <option value="goal">Goal</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-muted mb-2 uppercase">Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-card-bg border border-card-border rounded-xl p-3 text-foreground font-bold outline-none" placeholder="e.g. Hypertrophy Phase 1" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-muted mb-2 uppercase">Content / Instructions</label>
            <textarea value={content} onChange={e => setContent(e.target.value)} rows={4} className="w-full bg-card-bg border border-card-border rounded-xl p-3 text-foreground font-bold outline-none resize-none" placeholder="Write details here..."></textarea>
          </div>
          <button type="submit" className="w-full bg-acid-green text-black py-3 rounded-xl font-black border-none cursor-pointer">Assign to Client</button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plans.map(p => (
          <div key={p.id} className="bg-surface border border-card-border p-5 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-1 text-[10px] font-black uppercase rounded-md ${p.type==='workout_plan' ? 'bg-acid-green/10 text-acid-green' : p.type==='meal_plan' ? 'bg-purple-500/10 text-purple-500' : 'bg-orange-500/10 text-orange-500'}`}>{p.type.replace('_', ' ')}</span>
            </div>
            <h4 className="font-bold text-lg">{p.title}</h4>
            <p className="text-sm text-muted mt-2 line-clamp-2">{p.content?.text || 'No description provided.'}</p>
            <div className="text-xs font-bold text-muted mt-4">Assigned: {new Date(p.assigned_at).toLocaleDateString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TabMessages({ messages, trainerId, clientId }) {
  const [text, setText] = useState('');
  const [msgs, setMsgs] = useState(messages);
  const scrollRef = useRef(null);

  useEffect(() => {
    if(scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [msgs]);

  useEffect(() => {
    // Realtime channel
    // supabase is imported at the top of the file
    const channel = supabase.channel('trainer_messages_channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'trainer_messages', filter: `user_id=eq.${clientId}` }, payload => {
        setMsgs(prev => [...prev, payload.new]);
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [clientId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if(!text.trim()) return;
    await sendMessage(trainerId, clientId, text, 'trainer');
    setText('');
  };

  return (
    <div className="h-full flex flex-col bg-surface border border-card-border rounded-3xl overflow-hidden pb-16 lg:pb-0">
      <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide" ref={scrollRef}>
        {msgs.length === 0 && <div className="text-center text-muted font-bold mt-10">Say hello to your client!</div>}
        {msgs.map(m => {
          const isMe = m.sender === 'trainer';
          return (
            <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] p-4 rounded-2xl text-sm font-bold ${isMe ? 'bg-acid-green text-black rounded-tr-sm' : 'bg-card-bg text-foreground border border-card-border rounded-tl-sm'}`}>
                {m.message}
                <div className={`text-[10px] mt-1 ${isMe ? 'text-black/60' : 'text-muted'}`}>{new Date(m.sent_at).toLocaleTimeString()}</div>
              </div>
            </div>
          )
        })}
      </div>
      <form onSubmit={handleSend} className="p-4 border-t border-card-border bg-surface flex gap-2">
        <input value={text} onChange={e => setText(e.target.value)} className="flex-1 bg-card-bg border border-card-border text-foreground font-bold text-sm p-3 rounded-xl outline-none focus:border-acid-green" placeholder="Type a message..." />
        <button type="submit" className="bg-acid-green text-black p-3 rounded-xl border-none cursor-pointer"><Send className="w-5 h-5" /></button>
      </form>
    </div>
  );
}

function TabNotes({ notes, trainerId, clientId, onUpdate }) {
  const [text, setText] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    if(!text.trim()) return;
    const payload = { type: 'note', title: 'Trainer Note', content: { text } };
    await assignPlan(trainerId, clientId, payload); // note is stored as assignment with type='note'
    onUpdate({ ...payload, id: Date.now(), assigned_at: new Date().toISOString() });
    setText('');
  };

  return (
    <div className="h-full overflow-y-auto scrollbar-hide pb-20 space-y-6">
      <form onSubmit={handleSave} className="bg-surface p-4 rounded-3xl border border-card-border">
        <textarea value={text} onChange={e => setText(e.target.value)} rows={3} className="w-full bg-transparent border-none text-foreground font-bold outline-none resize-none" placeholder="Write a private note about this client..."></textarea>
        <div className="flex justify-end mt-2">
          <button type="submit" className="bg-card-bg text-foreground border border-card-border hover:bg-surface px-6 py-2 rounded-xl text-sm font-bold cursor-pointer">Save Note</button>
        </div>
      </form>

      <div className="space-y-4">
        {notes.slice().reverse().map(n => (
          <div key={n.id} className="bg-surface border border-card-border p-5 rounded-2xl">
            <div className="text-xs text-muted font-bold mb-2">{new Date(n.assigned_at).toLocaleString()}</div>
            <p className="text-sm">{n.content?.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

