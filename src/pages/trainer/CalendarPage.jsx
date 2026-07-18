import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { getTrainerClients, assignPlan } from '../../lib/dbService';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, X } from 'lucide-react';

export default function CalendarPage() {
  const user = useStore(s => s.user);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [assignments, setAssignments] = useState([]);
  const [clients, setClients] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form state
  const [fClient, setFClient] = useState('');
  const [fType, setFType] = useState('workout_plan');
  const [fTitle, setFTitle] = useState('');
  const [fDate, setFDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if(!user?.uid) return;
    const loadData = async () => {
      const c = await getTrainerClients(user.uid);
      setClients(c);
      
      const { supabase } = await import('../../lib/supabaseClient');
      const { data } = await supabase.from('trainer_assignments')
        .select('*, user_profiles:user_id(*)')
        .eq('trainer_id', user.uid)
        .not('due_date', 'is', null);
      setAssignments(data || []);
    };
    loadData();
  }, [user?.uid]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }

  const isSameDay = (d1, d2) => {
    if(!d1 || !d2) return false;
    return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
  };

  const getAssignmentsForDate = (date) => {
    if(!date) return [];
    return assignments.filter(a => {
      const d = new Date(a.due_date);
      // need to account for timezone issues, we'll parse the 'YYYY-MM-DD' directly
      const dParts = a.due_date.split('-');
      return parseInt(dParts[0]) === date.getFullYear() && (parseInt(dParts[1])-1) === date.getMonth() && parseInt(dParts[2]) === date.getDate();
    });
  };

  const selectedAssignments = getAssignmentsForDate(selectedDate);
  const todayAssignments = getAssignmentsForDate(new Date());

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if(!fClient || !fTitle || !fDate) return alert('Fill required fields');
    
    await assignPlan(user.uid, fClient, {
      type: fType,
      title: fTitle,
      due_date: fDate,
      content: { text: 'Scheduled via calendar' }
    });
    
    alert('Event added');
    setShowAddForm(false);
    
    // reload assignments
    const { supabase } = await import('../../lib/supabaseClient');
    const { data } = await supabase.from('trainer_assignments')
      .select('*, user_profiles:user_id(*)')
      .eq('trainer_id', user.uid)
      .not('due_date', 'is', null);
    setAssignments(data || []);
  };

  const typeColor = (type) => {
    if(type === 'workout_plan') return 'bg-acid-green';
    if(type === 'meal_plan') return 'bg-purple-500';
    if(type === 'goal') return 'bg-orange-500';
    return 'bg-gray-500';
  };

  return (
    <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-foreground">Calendar</h1>
          <p className="text-muted text-sm">Schedule and track client assignments.</p>
        </div>
        <button onClick={() => setShowAddForm(true)} className="bg-acid-green text-black px-4 py-2 rounded-xl font-bold flex items-center gap-2 border-none cursor-pointer">
          <Plus className="w-4 h-4"/> Add Event
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
        
        {/* Main Calendar Grid */}
        <div className="flex-1 bg-surface border border-card-border rounded-3xl p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
            <div className="flex gap-2">
              <button onClick={handlePrevMonth} className="p-2 bg-card-bg rounded-lg border border-card-border hover:bg-surface"><ChevronLeft className="w-5 h-5"/></button>
              <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 text-sm font-bold bg-card-bg rounded-lg border border-card-border hover:bg-surface">Today</button>
              <button onClick={handleNextMonth} className="p-2 bg-card-bg rounded-lg border border-card-border hover:bg-surface"><ChevronRight className="w-5 h-5"/></button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-muted uppercase">
            <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
          </div>
          
          <div className="flex-1 grid grid-cols-7 gap-2">
            {days.map((date, i) => {
              if(!date) return <div key={i} className="bg-transparent border border-transparent p-2"></div>;
              const isToday = isSameDay(date, new Date());
              const isSelected = isSameDay(date, selectedDate);
              const dayAssignments = getAssignmentsForDate(date);

              return (
                <div 
                  key={i} 
                  onClick={() => setSelectedDate(date)}
                  className={`border rounded-2xl p-2 flex flex-col cursor-pointer transition-colors ${isSelected ? 'border-acid-green bg-acid-green/5' : 'border-card-border bg-card-bg hover:border-acid-green/50'} ${isToday ? 'ring-2 ring-purple-500' : ''}`}
                >
                  <div className={`text-right text-sm font-bold ${isToday ? 'text-purple-500' : 'text-muted'}`}>{date.getDate()}</div>
                  <div className="flex-1 mt-2 space-y-1 overflow-hidden">
                    {dayAssignments.slice(0, 3).map((a, j) => (
                      <div key={j} className={`w-full h-1.5 rounded-full ${typeColor(a.type)} opacity-80`}></div>
                    ))}
                    {dayAssignments.length > 3 && <div className="text-[10px] text-muted text-center">+{dayAssignments.length - 3}</div>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 space-y-6 overflow-y-auto scrollbar-hide">
          
          {/* Selected Date Details */}
          <div className="bg-surface border border-card-border rounded-3xl p-6">
            <h3 className="font-black mb-4 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-acid-green" /> 
              {selectedDate.toDateString() === new Date().toDateString() ? "Today's Agenda" : selectedDate.toLocaleDateString()}
            </h3>
            <div className="space-y-3">
              {selectedAssignments.length === 0 && <p className="text-muted text-sm font-bold">Nothing scheduled.</p>}
              {selectedAssignments.map(a => (
                <div key={a.id} className="bg-card-bg p-3 border border-card-border rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full ${typeColor(a.type)}`}></span>
                    <span className="text-[10px] uppercase font-bold text-muted">{a.type.replace('_', ' ')}</span>
                  </div>
                  <h4 className="font-bold text-sm text-foreground">{a.title}</h4>
                  <p className="text-xs text-muted truncate mt-1">Client: {a.user_profiles?.full_name || 'Unknown'}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Add Event Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <form onSubmit={handleAddEvent} className="bg-surface border border-card-border p-6 rounded-3xl w-full max-w-md shadow-2xl relative">
            <button type="button" onClick={() => setShowAddForm(false)} className="absolute top-4 right-4 p-2 text-muted hover:text-foreground"><X className="w-5 h-5"/></button>
            <h2 className="text-2xl font-black mb-6">Add Event</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted mb-2 uppercase">Client</label>
                <select value={fClient} onChange={e => setFClient(e.target.value)} className="w-full bg-card-bg border border-card-border rounded-xl p-3 text-foreground font-bold outline-none">
                  <option value="">Select Client...</option>
                  {clients.map(c => <option key={c.id} value={c.user_id}>{c.user_profiles?.full_name || 'Client'}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-muted mb-2 uppercase">Event Type</label>
                <select value={fType} onChange={e => setFType(e.target.value)} className="w-full bg-card-bg border border-card-border rounded-xl p-3 text-foreground font-bold outline-none">
                  <option value="workout_plan">Workout Plan</option>
                  <option value="meal_plan">Meal Plan</option>
                  <option value="goal">Goal</option>
                  <option value="note">Note/Reminder</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted mb-2 uppercase">Title</label>
                <input value={fTitle} onChange={e => setFTitle(e.target.value)} placeholder="Event title..." className="w-full bg-card-bg border border-card-border rounded-xl p-3 text-foreground font-bold outline-none" />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted mb-2 uppercase">Date</label>
                <input type="date" value={fDate} onChange={e => setFDate(e.target.value)} className="w-full bg-card-bg border border-card-border rounded-xl p-3 text-foreground font-bold outline-none" />
              </div>

              <button type="submit" className="w-full bg-acid-green text-black py-3 rounded-xl font-black border-none cursor-pointer hover:bg-[#00b894] transition-colors mt-2">
                Schedule Event
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
