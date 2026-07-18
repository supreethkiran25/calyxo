import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../store/useStore';
import { getTrainerClients, getMessages, sendMessage, markMessagesRead } from '../../lib/dbService';
import { Search, Send, MessageCircle } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

export default function MessagesPage() {
  const user = useStore(s => s.user);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!user?.uid) return;
    const loadClients = async () => {
      const data = await getTrainerClients(user.uid);
      // We could also fetch latest message for each to sort them, but simple implementation for now
      setClients(data);
    };
    loadClients();
  }, [user]);

  useEffect(() => {
    if (!selectedClient || !user?.uid) return;
    const loadMsgs = async () => {
      const msgs = await getMessages(selectedClient.user_id, user.uid);
      setMessages(msgs);
      await markMessagesRead(selectedClient.user_id, user.uid);
    };
    loadMsgs();

    const channel = supabase.channel(`chat_${selectedClient.user_id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'trainer_messages', filter: `user_id=eq.${selectedClient.user_id}` }, payload => {
        setMessages(prev => [...prev, payload.new]);
      }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedClient, user]);

  useEffect(() => {
    if(scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if(!text.trim() || !selectedClient || !user?.uid) return;
    await sendMessage(user.uid, selectedClient.user_id, text, 'trainer');
    setText('');
  };

  const filteredClients = clients.filter(c => {
    const name = c.user_profiles?.full_name || c.user_profiles?.nickname || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="flex h-[calc(100vh-100px)] bg-surface border border-card-border rounded-3xl overflow-hidden relative">
      
      {/* Left Column - Convos */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-card-border flex flex-col ${selectedClient ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-card-border bg-card-bg">
          <h2 className="font-black text-xl mb-4">Messages</h2>
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input 
              type="text" 
              placeholder="Search clients..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-card-border text-foreground font-bold text-sm py-2 pl-10 pr-4 rounded-xl focus:outline-none focus:border-acid-green" 
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {filteredClients.map(c => {
            const profile = c.user_profiles || {};
            const isSelected = selectedClient?.id === c.id;
            return (
              <div 
                key={c.id} 
                onClick={() => setSelectedClient(c)}
                className={`p-4 border-b border-card-border flex items-center gap-3 cursor-pointer transition-colors ${isSelected ? 'bg-acid-green/10 border-l-4 border-l-acid-green' : 'hover:bg-card-bg border-l-4 border-l-transparent'}`}
              >
                <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center font-black text-acid-green border border-card-border flex-shrink-0">
                  {profile.full_name?.charAt(0) || profile.nickname?.charAt(0) || '?'}
                </div>
                <div className="flex-1 overflow-hidden">
                  <h4 className="font-bold text-sm truncate">{profile.full_name || profile.nickname || 'Unknown'}</h4>
                  <p className="text-xs text-muted truncate">Tap to open conversation</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Right Column - Chat */}
      <div className={`flex-1 flex flex-col ${!selectedClient ? 'hidden md:flex' : 'flex'}`}>
        {selectedClient ? (
          <>
            {/* Chat Header */}
            <div className="h-16 border-b border-card-border bg-card-bg flex items-center px-6 justify-between shrink-0">
              <div className="flex items-center gap-3">
                <button className="md:hidden p-2 text-muted -ml-2" onClick={() => setSelectedClient(null)}>Back</button>
                <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center font-black text-acid-green border border-card-border">
                  {selectedClient.user_profiles?.full_name?.charAt(0) || '?'}
                </div>
                <h3 className="font-black text-lg">{selectedClient.user_profiles?.full_name || 'Client'}</h3>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide" ref={scrollRef}>
              {messages.length === 0 && <div className="text-center text-muted font-bold mt-10">Send your first message to start the conversation!</div>}
              {messages.map(m => {
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

            {/* Chat Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-card-border bg-card-bg flex gap-2 shrink-0">
              <input 
                value={text} 
                onChange={e => setText(e.target.value)} 
                className="flex-1 bg-surface border border-card-border text-foreground font-bold text-sm p-3 rounded-xl outline-none focus:border-acid-green" 
                placeholder="Message your client..." 
              />
              <button type="submit" className="bg-acid-green text-black p-3 rounded-xl border-none cursor-pointer hover:bg-[#00b894] transition-colors">
                <Send className="w-5 h-5" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted">
            <MessageCircle className="w-16 h-16 mb-4 opacity-50" />
            <h3 className="text-xl font-black">Your Messages</h3>
            <p className="text-sm">Select a conversation from the sidebar to start messaging.</p>
          </div>
        )}
      </div>

    </div>
  );
}
