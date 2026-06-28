import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, Search, Loader2, ArrowLeft, MoreVertical, Paperclip, Smile } from 'lucide-react';
import { getConversations, subscribeToMessages, sendMessage, searchUsers } from '../lib/socialService';

export default function SocialMessaging({ currentUserId }) {
  const [conversations, setConversations] = useState([]);
  const [loadingConv, setLoadingConv] = useState(true);
  
  const [activeConv, setActiveConv] = useState(null); // The full conversation object or null
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const messagesEndRef = useRef(null);

  // Load conversations
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoadingConv(true);
      const data = await getConversations(currentUserId);
      if (mounted) {
        setConversations(data);
        setLoadingConv(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [currentUserId]);

  // Subscribe to messages when active conversation changes
  useEffect(() => {
    if (!activeConv) return;
    setMessages([]);
    
    // If it's a new, unsaved conversation, we don't have an ID yet
    if (activeConv.isNew) return;

    const unsub = subscribeToMessages(activeConv.id, (msgs) => {
      setMessages(msgs);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });
    return () => unsub();
  }, [activeConv]);

  // Handle User Search for New Message
  useEffect(() => {
    const search = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      const results = await searchUsers(searchQuery);
      setSearchResults(results.filter(u => u.userId !== currentUserId));
      setIsSearching(false);
    };
    const timer = setTimeout(search, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, currentUserId]);

  const handleStartConversation = (targetUser) => {
    // Check if we already have a conversation with them
    const existing = conversations.find(c => 
      c.participants?.includes(currentUserId) && c.participants?.includes(targetUser.userId)
    );
    if (existing) {
      setActiveConv(existing);
    } else {
      setActiveConv({
        isNew: true,
        participants: [currentUserId, targetUser.userId],
        targetUser
      });
    }
    setSearchQuery('');
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConv) return;

    const text = inputText.trim();
    setInputText('');
    
    // Optimistic UI update
    setMessages(prev => [...prev, { id: 'temp_'+Date.now(), text, senderId: currentUserId }]);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);

    let convId = activeConv.id;
    
    // If new conversation, we generate an ID
    if (activeConv.isNew) {
      convId = `${currentUserId}_${activeConv.targetUser.userId}`;
      setActiveConv({ ...activeConv, id: convId, isNew: false });
    }

    await sendMessage(convId, currentUserId, text, activeConv.participants);
    
    // Refresh conversations list to bring this one to top
    const data = await getConversations(currentUserId);
    setConversations(data);
  };

  const getOtherParticipant = (conv) => {
    if (conv.targetUser) return conv.targetUser; // New conversation
    // In a real app, we'd fetch the user profile for the other participant ID here
    // For now we mock it based on participants array
    const otherId = conv.participants?.find(p => p !== currentUserId);
    return { userId: otherId, displayName: 'Athlete', username: 'athlete' };
  };

  return (
    <div className="h-full flex bg-background overflow-hidden">
      
      {/* ── LEFT SIDEBAR: CONVERSATIONS ── */}
      <div className={`w-full md:w-80 flex-shrink-0 flex flex-col border-r border-card-border bg-surface/30 transition-transform ${activeConv ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-card-border glass">
          <h2 className="text-xl font-black uppercase tracking-widest text-foreground mb-4">Messages</h2>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input 
              type="text" 
              placeholder="Search or start new chat..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--input)] border border-card-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-acid-green transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar relative">
          {searchQuery ? (
            <div className="p-2 space-y-1">
              {isSearching ? (
                <div className="flex justify-center p-4"><Loader2 className="w-5 h-5 text-muted animate-spin" /></div>
              ) : searchResults.length > 0 ? (
                searchResults.map(user => (
                  <button
                    key={user.userId}
                    onClick={() => handleStartConversation(user)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-surface/80 transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-card-border overflow-hidden">
                      {user.photoURL && <img src={user.photoURL} alt={user.username} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">{user.displayName || user.username}</p>
                      <p className="text-[10px] font-medium text-muted truncate">@{user.username}</p>
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-center text-xs text-muted p-4">No users found.</p>
              )}
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {loadingConv ? (
                <div className="flex justify-center p-4"><Loader2 className="w-5 h-5 text-muted animate-spin" /></div>
              ) : conversations.length > 0 ? (
                conversations.map(conv => {
                  const otherUser = getOtherParticipant(conv);
                  const isActive = activeConv?.id === conv.id;
                  
                  return (
                    <button
                      key={conv.id}
                      onClick={() => setActiveConv(conv)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left ${isActive ? 'bg-surface border border-card-border' : 'hover:bg-surface/50 border border-transparent'}`}
                    >
                      <div className="w-12 h-12 rounded-full bg-card-border shrink-0 overflow-hidden relative">
                        {otherUser?.photoURL && <img src={otherUser.photoURL} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                          <p className="text-sm font-bold text-foreground truncate">{otherUser?.displayName || 'User'}</p>
                          {conv.lastUpdated && <span className="text-[10px] text-muted whitespace-nowrap ml-2">{new Date(conv.lastUpdated).toLocaleDateString()}</span>}
                        </div>
                        <p className="text-xs text-muted truncate">{conv.lastMessage || 'Started a conversation'}</p>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted">
                  <MessageCircle className="w-12 h-12 mb-4 opacity-20" />
                  <p className="text-xs font-medium">No active conversations.<br/>Search for a user to start chatting.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT AREA: CHAT WINDOW ── */}
      <div className={`flex-1 flex flex-col bg-background relative ${!activeConv ? 'hidden md:flex' : 'flex'}`}>
        {!activeConv ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-surface/10">
            <MessageCircle className="w-16 h-16 text-muted mb-4 opacity-20" />
            <h2 className="text-lg font-black uppercase tracking-widest text-foreground">Direct Messages</h2>
            <p className="text-xs text-muted font-medium mt-2 max-w-sm">Select a conversation or search for a user to start a secure, private chat.</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-card-border glass sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setActiveConv(null)}
                  className="md:hidden p-2 -ml-2 rounded-full hover:bg-surface text-muted hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 rounded-full bg-card-border overflow-hidden shrink-0">
                  {getOtherParticipant(activeConv)?.photoURL && <img src={getOtherParticipant(activeConv).photoURL} alt="" className="w-full h-full object-cover" />}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">{getOtherParticipant(activeConv)?.displayName || 'User'}</h3>
                  <p className="text-[10px] font-medium text-acid-green">Active</p>
                </div>
              </div>
              <button className="p-2 rounded-full hover:bg-surface text-muted hover:text-foreground transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
              {messages.map((msg, idx) => {
                const isMe = msg.senderId === currentUserId;
                const showAvatar = !isMe && (idx === messages.length - 1 || messages[idx + 1]?.senderId !== msg.senderId);

                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} gap-2`}>
                    {!isMe && (
                      <div className="w-6 h-6 shrink-0 flex items-end">
                        {showAvatar && (
                          <div className="w-6 h-6 rounded-full bg-card-border overflow-hidden">
                             {getOtherParticipant(activeConv)?.photoURL && <img src={getOtherParticipant(activeConv).photoURL} alt="" className="w-full h-full object-cover" />}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                      isMe 
                        ? 'bg-acid-green text-accent-foreground rounded-br-sm shadow-[0_4px_10px_rgba(16,185,129,0.1)]' 
                        : 'bg-surface text-foreground border border-card-border rounded-bl-sm'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-card-border glass sticky bottom-0">
              <form onSubmit={handleSend} className="flex items-end gap-2">
                <button type="button" className="p-3 text-muted hover:text-foreground transition-colors shrink-0">
                  <Paperclip className="w-5 h-5" />
                </button>
                <div className="flex-1 bg-surface border border-card-border rounded-2xl relative flex items-end">
                  <textarea 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Message..."
                    className="w-full bg-transparent border-none px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-0 resize-none min-h-[44px] max-h-[120px]"
                    rows={1}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend(e);
                      }
                    }}
                  />
                  <button type="button" className="p-3 text-muted hover:text-foreground transition-colors shrink-0">
                    <Smile className="w-5 h-5" />
                  </button>
                </div>
                <button 
                  type="submit" 
                  disabled={!inputText.trim()}
                  className="p-3 bg-acid-green text-accent-foreground rounded-xl shrink-0 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-acid-green/90 transition-colors shadow-[0_4px_10px_rgba(16,185,129,0.2)]"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </>
        )}
      </div>

    </div>
  );
}
