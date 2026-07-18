"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, CheckCheck } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { getMessages, sendMessage, markMessagesRead } from '../lib/dbService';
import { useStore } from '../store/useStore';

export default function UserTrainerChat({ trainer, onBack }) {
  const user = useStore(state => state.user);
  const userId = user?.uid;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const loadMessages = async () => {
      const data = await getMessages(userId, trainer.id);
      setMessages(data || []);
      markMessagesRead(userId, trainer.id);
    };

    if (userId && trainer?.id) {
      loadMessages();
      const channel = supabase.channel(`chat_${trainer.id}_${userId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'trainer_messages',
          filter: `trainer_id=eq.${trainer.id}`
        }, payload => {
          if (payload.new.user_id === userId) {
            setMessages(prev => [...prev, payload.new]);
            if (payload.new.sender === 'trainer') markMessagesRead(userId, trainer.id);
          }
        })
        .subscribe();
        
      return () => { supabase.removeChannel(channel); }
    }
  }, [userId, trainer]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !userId || !trainer?.id) return;
    const msg = newMessage;
    setNewMessage('');
    await sendMessage(userId, trainer.id, msg, 'user');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] bg-surface border border-card-border rounded-3xl overflow-hidden max-w-4xl mx-auto mt-6">
      <div className="p-4 border-b border-card-border bg-background flex items-center gap-4">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-surface text-muted hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-card-bg border border-acid-green/50 flex items-center justify-center">
            {trainer.profile_photo_url ? <img src={trainer.profile_photo_url} alt="Trainer" className="w-full h-full object-cover" /> : <div className="text-acid-green font-bold text-sm">TR</div>}
          </div>
          <div>
            <h3 className="font-black leading-tight">{trainer.full_name}</h3>
            <p className="text-[10px] font-bold text-acid-green uppercase tracking-widest">{trainer.archetype?.replace('_', ' ')}</p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/50">
        {messages.length === 0 && (
          <div className="text-center text-muted py-8 text-sm">
            Send a message to start chatting with {trainer.full_name}.
          </div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[75%] rounded-2xl p-3 ${msg.sender === 'user' ? 'bg-acid-green text-black rounded-tr-sm' : 'bg-surface border border-card-border rounded-tl-sm text-foreground'}`}>
              <p className="text-sm font-medium">{msg.message}</p>
            </div>
            <span className="text-[10px] text-muted mt-1 flex items-center gap-1">
              {new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              {msg.sender === 'user' && <CheckCheck className={`w-3 h-3 ${msg.read ? 'text-blue-500' : 'text-muted'}`} />}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 bg-background border-t border-card-border flex gap-2">
        <input 
          type="text" 
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          placeholder={`Message ${trainer.full_name}...`}
          className="flex-1 bg-surface border border-card-border rounded-xl px-4 py-3 focus:border-acid-green outline-none font-medium"
        />
        <button type="submit" disabled={!newMessage.trim()} className="px-6 rounded-xl bg-acid-green text-black disabled:opacity-50 font-bold transition-transform active:scale-95">
          <Send className="w-5 h-5 mx-auto" />
        </button>
      </form>
    </div>
  );
}
