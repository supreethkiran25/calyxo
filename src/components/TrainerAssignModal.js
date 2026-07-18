import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Send, Calendar, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function TrainerAssignModal({ isOpen, onClose, clientId, clientName, trainerId }) {
  const [activeTab, setActiveTab] = useState('workout'); // 'workout' or 'nutrition'
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [assignDate, setAssignDate] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  React.useEffect(() => {
    const fetchTemplates = async () => {
      const table = activeTab === 'workout' ? 'workout_templates' : 'meal_templates';
      const { data } = await supabase.from(table).select('id, name').eq('trainer_id', trainerId);
      setTemplates(data || []);
      if (data && data.length > 0) setSelectedTemplateId(data[0].id);
    };

    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen, activeTab, trainerId]);

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedTemplateId) return;
    setIsAssigning(true);

    const type = activeTab === 'workout' ? 'workout_plan' : 'meal_plan';
    const templateName = templates.find(t => t.id === selectedTemplateId)?.name || 'Plan';
    
    // In a production app, you would parse the template JSON and insert into the assigned tables.
    // For this MVP we insert the relationship pointing to the template.
    const { error } = await supabase.from('trainer_assignments').insert({
      trainer_id: trainerId,
      user_id: clientId,
      type: type,
      title: templateName,
      content: { template_id: selectedTemplateId },
      due_date: assignDate || new Date().toISOString().split('T')[0],
      status: 'assigned'
    });

    setIsAssigning(false);

    if (error) {
      alert("Error assigning: " + error.message);
    } else {
      alert(`Successfully assigned ${activeTab} to ${clientName}!`);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card-bg w-full max-w-md rounded-3xl border border-card-border p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black text-foreground">Assign to {clientName}</h2>
          <button onClick={onClose} className="text-muted hover:text-foreground cursor-pointer border-none bg-transparent">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2 mb-6 border-b border-card-border pb-2">
          <button onClick={() => setActiveTab('workout')} className={`pb-2 px-2 font-bold text-sm uppercase tracking-wider border-none bg-transparent cursor-pointer ${activeTab === 'workout' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-muted'}`}>Workout</button>
          <button onClick={() => setActiveTab('nutrition')} className={`pb-2 px-2 font-bold text-sm uppercase tracking-wider border-none bg-transparent cursor-pointer ${activeTab === 'nutrition' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-muted'}`}>Nutrition</button>
        </div>
        
        <form onSubmit={handleAssign} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">Select Template</label>
            <select 
              required
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="w-full bg-[var(--input)] text-foreground border border-card-border px-3 py-2.5 rounded-xl focus:outline-none focus:border-blue-500 text-sm shadow-inner"
            >
              {templates.length === 0 ? <option value="">No templates found</option> : null}
              {templates.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">Assign For Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input 
                type="date"
                required
                value={assignDate}
                onChange={(e) => setAssignDate(e.target.value)}
                className="w-full bg-[var(--input)] text-foreground border border-card-border pl-10 pr-3 py-2.5 rounded-xl focus:outline-none focus:border-blue-500 text-sm shadow-inner"
              />
            </div>
          </div>

          <button disabled={isAssigning || templates.length === 0} type="submit" className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl cursor-pointer border-none shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 mt-4">
            {isAssigning ? 'Assigning...' : <><Send className="w-4 h-4" /> Send to Client</>}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
