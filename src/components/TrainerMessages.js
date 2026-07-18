"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Image as ImageIcon, CheckCheck } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { getMessages, sendMessage, markMessagesRead, getTrainerClients } from '../lib/dbService';

export default function TrainerMessages({ user }) {
  const userId = user?.uid;
  const [clients, setClients] = useState([]);
  const [activeClient, setActiveClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (userId) {
      getTrainerClients(userId).then(data => {
        setClients(data || []);
        if (data && data.length > 0) setActiveClient(data[0]);
      });
    }
  }, [userId]);

  useEffect(() => {
    const loadMessages = async () => {
      const data = await getMessages(activeClient.user_id, userId);
      setMessages(data);
      markMessagesRead(activeClient.user_id, userId);
    };

    if (activeClient && userId) {
      loadMessages();
      const channel = supabase.channel(`chat_${userId}_${activeClient.user_id}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'trainer_messages',
          filter: `trainer_id=eq.${userId}`
        }, payload => {
          if (payload.new.user_id === activeClient.user_id) {
            setMessages(prev => [...prev, payload.new]);
            if (payload.new.sender === 'user') markMessagesRead(activeClient.user_id, userId);
          }
        })
        .subscribe();
        
      return () => { supabase.removeChannel(channel); }
    }
  }, [activeClient, userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !userId || !activeClient) return;
    const msg = newMessage;
    setNewMessage('');
    await sendMessage(userId, activeClient.user_id, msg, 'trainer');
  };

  return (
    <div className="flex h-[calc(100vh-120px)] bg-surface border border-card-border rounded-3xl overflow-hidden">
      {/* Sidebar */}
      <div className="w-1/3 border-r border-card-border flex flex-col">
        <div className="p-4 border-b border-card-border">
          <h2 className="font-black text-xl">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {clients.length === 0 ? (
            <p className="p-4 text-muted text-center">No active clients yet.</p>
          ) : (
            clients.map(c => (
              <div 
                key={c.id} 
                onClick={() => setActiveClient(c)}
                className={`p-4 border-b border-card-border cursor-pointer transition-colors ${activeClient?.id === c.id ? 'bg-acid-green/10 border-l-4 border-l-acid-green' : 'hover:bg-background'}`}
              >
                <h3 className="font-bold">{c.user_profiles?.nickname || c.user_profiles?.email || 'Client'}</h3>
                <p className="text-xs text-muted">Via {c.connection_method}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-background">
        {activeClient ? (
          <>
            <div className="p-4 border-b border-card-border bg-surface flex items-center justify-between">
              <h3 className="font-black">{activeClient.user_profiles?.nickname || 'Client'}</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.sender === 'trainer' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[70%] rounded-2xl p-3 ${msg.sender === 'trainer' ? 'bg-acid-green text-black rounded-tr-sm' : 'bg-surface border border-card-border rounded-tl-sm'}`}>
                    <p className="text-sm font-medium">{msg.message}</p>
                  </div>
                  <span className="text-[10px] text-muted mt-1 flex items-center gap-1">
                    {new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {msg.sender === 'trainer' && <CheckCheck className={`w-3 h-3 ${msg.read ? 'text-blue-500' : 'text-muted'}`} />}
                  </span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 bg-surface border-t border-card-border flex gap-2">
              <button type="button" className="p-3 rounded-xl bg-background border border-card-border text-muted hover:text-foreground">
                <ImageIcon className="w-5 h-5" />
              </button>
              <input 
                type="text" 
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-background border border-card-border rounded-xl px-4 py-2 focus:border-acid-green outline-none"
              />
              <button type="submit" disabled={!newMessage.trim()} className="p-3 rounded-xl bg-acid-green text-black disabled:opacity-50">
                <Send className="w-5 h-5" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted">
            Select a client to start chatting
          </div>
        )}
      </div>
    </div>
  );
}
