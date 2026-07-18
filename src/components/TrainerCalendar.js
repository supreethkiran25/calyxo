import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, Users, Plus, ChevronLeft, ChevronRight, Check, X, Video } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function TrainerCalendar({ user, clients }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [isBooking, setIsBooking] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // New Booking State
  const [selectedClientId, setSelectedClientId] = useState('');
  const [title, setTitle] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [timeStr, setTimeStr] = useState('10:00');
  const [duration, setDuration] = useState('60');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const fetchAppointments = async () => {
      setIsLoading(true);
      // Fetch appointments for the current month
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString();
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString();
      
      const { data, error } = await supabase
        .from('appointments')
        .select('*, user_profiles!client_id(display_name)')
        .eq('trainer_id', user.uid)
        .gte('start_time', startOfMonth)
        .lte('start_time', endOfMonth)
        .order('start_time', { ascending: true });
        
      if (!error) {
        setAppointments(data || []);
      }
      setIsLoading(false);
    };

    if (user?.uid) {
      fetchAppointments();
    }
  }, [user, currentDate]);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!selectedClientId || !title || !dateStr || !timeStr) return;

    const startDateTime = new Date(`${dateStr}T${timeStr}`);
    const endDateTime = new Date(startDateTime.getTime() + parseInt(duration) * 60000);

    const { error } = await supabase.from('appointments').insert({
      trainer_id: user.uid,
      client_id: selectedClientId,
      title,
      notes,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      status: 'SCHEDULED'
    });

    if (error) {
      alert("Error booking: " + error.message);
    } else {
      setIsBooking(false);
      // Reset form
      setTitle(''); setNotes('');
      fetchAppointments();
    }
  };

  const updateStatus = async (id, status) => {
    await supabase.from('appointments').update({ status }).eq('id', id);
    fetchAppointments();
  };

  // Calendar Helpers
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const activeClients = clients?.filter(c => c.status === 'ACTIVE') || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground">Calendar & Appointments</h1>
          <p className="text-muted text-sm">Schedule sessions and manage your availability.</p>
        </div>
        <button 
          onClick={() => setIsBooking(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-xl flex items-center justify-center gap-2 border-none cursor-pointer shadow-lg shadow-blue-500/20 transition-all"
        >
          <Plus className="w-4 h-4" /> Book Session
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Interactive Calendar */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-surface border border-card-border p-6 rounded-3xl shadow-sm">
            
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black">{monthName} {year}</h2>
              <div className="flex gap-2">
                <button onClick={prevMonth} className="p-2 rounded-lg bg-background border border-card-border hover:bg-card-bg cursor-pointer"><ChevronLeft className="w-5 h-5 text-muted" /></button>
                <button onClick={nextMonth} className="p-2 rounded-lg bg-background border border-card-border hover:bg-card-bg cursor-pointer"><ChevronRight className="w-5 h-5 text-muted" /></button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-[10px] font-bold text-muted uppercase tracking-wider">{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square rounded-xl bg-transparent" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${year}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const hasAppointments = appointments.some(a => a.start_time.startsWith(dateStr));
                const isToday = new Date().toISOString().startsWith(dateStr);

                return (
                  <div key={day} className={`aspect-square rounded-xl flex flex-col items-center justify-center relative border transition-colors cursor-pointer ${isToday ? 'bg-blue-500/10 border-blue-500/30' : 'bg-background border-card-border hover:border-blue-500'}`}>
                    <span className={`text-sm font-bold ${isToday ? 'text-blue-500' : 'text-foreground'}`}>{day}</span>
                    {hasAppointments && <div className="absolute bottom-2 w-1.5 h-1.5 rounded-full bg-blue-500" />}
                  </div>
                );
              })}
            </div>

          </div>
        </div>

        {/* Right: Agenda View */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-surface border border-card-border p-6 rounded-3xl shadow-sm min-h-[500px] flex flex-col">
            <h3 className="font-black text-lg mb-4 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-blue-500" /> 
              Upcoming Agenda
            </h3>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {isLoading ? (
                <div className="text-center text-muted text-sm py-12">Loading...</div>
              ) : appointments.length === 0 ? (
                <div className="text-center flex flex-col items-center justify-center py-12 text-muted">
                  <div className="w-12 h-12 rounded-full bg-card-border flex items-center justify-center mb-3">
                    <Clock className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-bold">No sessions scheduled.</p>
                </div>
              ) : (
                appointments.map(apt => {
                  const start = new Date(apt.start_time);
                  const end = new Date(apt.end_time);
                  const isPast = end < new Date();
                  
                  return (
                    <div key={apt.id} className={`p-4 rounded-xl border ${isPast ? 'bg-background border-card-border opacity-75' : 'bg-card-bg border-blue-500/30 shadow-md'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-sm">{apt.title}</h4>
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded ${apt.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500' : apt.status === 'CANCELLED' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                          {apt.status}
                        </span>
                      </div>
                      
                      <div className="space-y-1 mb-3">
                        <p className="text-xs text-muted flex items-center gap-2">
                          <Users className="w-3 h-3" /> {apt.user_profiles?.display_name || 'Client'}
                        </p>
                        <p className="text-xs text-muted flex items-center gap-2">
                          <Clock className="w-3 h-3" /> {start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                        <p className="text-[10px] text-muted flex items-center gap-2">
                          <CalendarIcon className="w-3 h-3" /> {start.toLocaleDateString()}
                        </p>
                      </div>

                      {apt.status === 'SCHEDULED' && !isPast && (
                        <div className="flex gap-2 pt-3 border-t border-card-border mt-3">
                          <button className="flex-1 py-1.5 text-[10px] font-bold bg-blue-500 text-white rounded cursor-pointer border-none flex justify-center items-center gap-1">
                            <Video className="w-3 h-3" /> Join
                          </button>
                          <button onClick={() => updateStatus(apt.id, 'COMPLETED')} className="p-1.5 bg-surface text-green-500 border border-card-border rounded cursor-pointer hover:bg-green-500/10 transition-colors">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={() => updateStatus(apt.id, 'CANCELLED')} className="p-1.5 bg-surface text-red-500 border border-card-border rounded cursor-pointer hover:bg-red-500/10 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Booking Modal */}
      {isBooking && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card-bg w-full max-w-lg rounded-3xl border border-card-border p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6 border-b border-card-border pb-4">
              <h2 className="text-xl font-black flex items-center gap-2"><CalendarIcon className="w-5 h-5 text-blue-500" /> Book Session</h2>
              <button onClick={() => setIsBooking(false)} className="text-muted hover:text-foreground cursor-pointer border-none bg-transparent">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleBook} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">Select Client</label>
                <select required value={selectedClientId} onChange={(e) => setSelectedClientId(e.target.value)} className="w-full bg-[var(--input)] text-foreground border border-card-border px-3 py-2.5 rounded-xl focus:outline-none focus:border-blue-500 text-sm">
                  <option value="">-- Choose Client --</option>
                  {activeClients.map(c => (
                    <option key={c.clientId} value={c.clientId}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">Session Title</label>
                <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Form Check & Strategy" className="w-full bg-[var(--input)] text-foreground border border-card-border px-3 py-2.5 rounded-xl focus:outline-none focus:border-blue-500 text-sm" />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">Date</label>
                  <input type="date" required value={dateStr} onChange={(e) => setDateStr(e.target.value)} className="w-full bg-[var(--input)] text-foreground border border-card-border px-3 py-2.5 rounded-xl focus:outline-none focus:border-blue-500 text-sm" />
                </div>
                <div className="col-span-1">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">Time</label>
                  <input type="time" required value={timeStr} onChange={(e) => setTimeStr(e.target.value)} className="w-full bg-[var(--input)] text-foreground border border-card-border px-3 py-2.5 rounded-xl focus:outline-none focus:border-blue-500 text-sm" />
                </div>
                <div className="col-span-1">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">Duration (Min)</label>
                  <select value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full bg-[var(--input)] text-foreground border border-card-border px-3 py-2.5 rounded-xl focus:outline-none focus:border-blue-500 text-sm">
                    <option value="15">15 min</option>
                    <option value="30">30 min</option>
                    <option value="45">45 min</option>
                    <option value="60">60 min</option>
                    <option value="90">90 min</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">Private Notes</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Focus on squat depth..." className="w-full bg-[var(--input)] text-foreground border border-card-border px-3 py-2 rounded-xl focus:outline-none focus:border-blue-500 text-sm resize-none" />
              </div>

              <div className="pt-4 border-t border-card-border">
                <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/20 border-none cursor-pointer">
                  Confirm Booking
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
