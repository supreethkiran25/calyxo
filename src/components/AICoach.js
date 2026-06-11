"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { Bot, User, Send, Sparkles, ThumbsUp, ThumbsDown, Plus, Trash2, Menu, X, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { addTrainingLog, getPositiveTrainingLogs, getChatSessions, saveChatSession, deleteChatSession } from '../lib/dbService';

const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'assistant',
  text: "Yo! I'm Calyxo, your AI Fitness & Diet Coach. ⚡ I have scanned your biometric logs and intake metrics. Drop any questions about recipes, customized training adjustments, or recovery!",
  timestamp: Date.now()
};

export default function AICoach() {
  const { user, foodLogs, workoutLogs, waterIntake, userProfile } = useStore();
  const userId = user?.uid;

  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile drawer state

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Load chat sessions from db on mount
  useEffect(() => {
    const load = async () => {
      if (userId) {
        const list = await getChatSessions(userId);
        setSessions(list || []);
        if (list && list.length > 0) {
          // Auto load the most recent session
          setActiveSessionId(list[0].id);
          setMessages(list[0].messages || [WELCOME_MESSAGE]);
        } else {
          setActiveSessionId(null);
          setMessages([WELCOME_MESSAGE]);
        }
      }
    };
    load();
  }, [userId]);

  const handleSelectSession = (sessionId) => {
    const s = sessions.find(x => x.id === sessionId);
    if (s) {
      setActiveSessionId(sessionId);
      setMessages(s.messages || [WELCOME_MESSAGE]);
    }
    setSidebarOpen(false);
  };

  const handleNewChat = () => {
    setActiveSessionId(null);
    setMessages([WELCOME_MESSAGE]);
    setSidebarOpen(false);
  };

  const handleDeleteSession = async (e, sessionId) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this chat session?")) {
      await deleteChatSession(userId, sessionId);
      setSessions(prev => prev.filter(x => x.id !== sessionId));
      if (activeSessionId === sessionId) {
        handleNewChat();
      }
    }
  };

  // Compile context details to send to the server
  const compileContextPayload = () => {
    const totalCal = foodLogs.reduce((sum, x) => sum + x.calories, 0);
    const totalProt = foodLogs.reduce((sum, x) => sum + (x.protein || 0), 0);
    const totalCarb = foodLogs.reduce((sum, x) => sum + (x.carbs || 0), 0);
    const totalFat = foodLogs.reduce((sum, x) => sum + (x.fat || 0), 0);

    const gender = userProfile?.gender || 'male';
    const age = userProfile?.age || 25;
    const units = userProfile?.units || 'metric';
    const weightVal = userProfile?.weight || 70;
    const heightVal = userProfile?.height || 175;
    const goal = userProfile?.goal || 'lose';

    const isImperial = units === 'imperial';
    let weightKg = weightVal;
    let heightCm = heightVal;
    if (isImperial) {
      weightKg = weightVal / 2.20462;
      heightCm = heightVal * 2.54;
    }
    const heightMeters = heightCm / 100;
    const bmi = heightMeters > 0 ? (weightKg / (heightMeters * heightMeters)).toFixed(1) : '22.0';
    
    let bmr = 0;
    if (gender === 'male') {
      bmr = Math.round((10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5);
    } else {
      bmr = Math.round((10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161);
    }
    const activity = userProfile?.activity || 1.55;
    const tdee = Math.round(bmr * activity);
    let calorieGoal = tdee;
    if (goal === 'lose') calorieGoal = tdee - 500;
    else if (goal === 'gains') calorieGoal = tdee + 350;
    calorieGoal = Math.max(calorieGoal, gender === 'male' ? 1500 : 1200);

    let proteinTarget = Math.round(weightKg * 2.0);
    proteinTarget = Math.min(Math.max(proteinTarget, 80), 220);
    let fatTarget = Math.round((calorieGoal * 0.25) / 9);
    let carbsTarget = Math.round((calorieGoal - (proteinTarget * 4) - (fatTarget * 9)) / 4);

    const foodListStr = foodLogs.length > 0
      ? foodLogs.map(f => `- ${f.name}: ${f.calories} kcal (Portion: ${f.portionWeight}g, P: ${f.protein}g, C: ${f.carbs}g, F: ${f.fat}g)`).join('\n')
      : 'No foods logged yet today.';

    const workoutListStr = workoutLogs.length > 0
      ? workoutLogs.map(w => `- ${w.name} (${w.category}): ${w.category === 'Cardio' ? `${w.duration} mins` : `${w.sets} sets x ${w.reps} reps @ ${w.weight}kg`}`).join('\n')
      : 'No workouts logged yet today.';

    return {
      biometrics: `Gender: ${gender}, Age: ${age}, Weight: ${weightVal} ${isImperial ? 'lbs' : 'kg'}, Height: ${heightVal} ${isImperial ? 'in' : 'cm'}, Goal: ${goal === 'lose' ? 'Weight Loss' : goal === 'gains' ? 'Lean Gains' : 'Maintenance'}`,
      bmi,
      targets: `Calories: ${calorieGoal} kcal, Protein: ${proteinTarget}g, Carbs: ${carbsTarget}g, Fat: ${fatTarget}g`,
      consumed: `Calories: ${totalCal} kcal, Protein: ${totalProt.toFixed(1)}g, Carbs: ${totalCarb.toFixed(1)}g, Fat: ${totalFat.toFixed(1)}g`,
      water: `${waterIntake} ml`,
      foodListStr,
      workoutListStr,
      goal,
      consumedCalories: totalCal,
      targetCalories: calorieGoal,
      workoutCount: workoutLogs.length
    };
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputVal.trim() || loading) return;

    const userMessageText = inputVal.trim();
    setInputVal('');
    
    // Add user message to timeline
    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: userMessageText,
      timestamp: Date.now()
    };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setLoading(true);

    const context = compileContextPayload();

    try {
      const positiveLogs = await getPositiveTrainingLogs(userId);

      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: userMessageText,
          context,
          trainingLogs: positiveLogs
        })
      });

      if (!response.ok) {
        throw new Error("Could not fetch AI response.");
      }

      const resData = await response.json();
      const textResponse = resData.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I could not generate a response. Please try again.";

      const botMsg = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        text: textResponse,
        timestamp: Date.now()
      };
      
      const finalMessages = [...updatedMessages, botMsg];
      setMessages(finalMessages);

      // Persist the session
      let sessionId = activeSessionId;
      let isNew = false;
      if (!sessionId) {
        sessionId = `session-${Date.now()}`;
        setActiveSessionId(sessionId);
        isNew = true;
      }

      const currentActiveTitle = sessions.find(x => x.id === sessionId)?.title;
      const sessionTitle = isNew
        ? (userMessageText.substring(0, 30) + (userMessageText.length > 30 ? '...' : ''))
        : (currentActiveTitle || "Workout Thread");

      const sessionObj = {
        id: sessionId,
        title: sessionTitle,
        messages: finalMessages,
        updatedAt: Date.now()
      };

      const savedSession = await saveChatSession(userId, sessionObj);

      setSessions(prev => {
        const filtered = prev.filter(x => x.id !== sessionId);
        return [savedSession, ...filtered];
      });

    } catch (err) {
      console.error("Failed server route AI call", err);
      const botMsg = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        text: `⚠️ **Calyxo Connection Error:** Could not contact server-side AI. Please check your network or API keys.`,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleRateResponse = async (msgId, ratingValue) => {
    const updatedMessages = messages.map(m => m.id === msgId ? { ...m, rating: ratingValue } : m);
    setMessages(updatedMessages);

    // Save feedback to the active session
    if (activeSessionId) {
      const activeSession = sessions.find(s => s.id === activeSessionId);
      if (activeSession) {
        const sessionObj = {
          ...activeSession,
          messages: updatedMessages,
          updatedAt: Date.now()
        };
        const savedSession = await saveChatSession(userId, sessionObj);
        setSessions(prev => prev.map(s => s.id === activeSessionId ? savedSession : s));
      }
    }

    const botMsg = messages.find(m => m.id === msgId);
    if (!botMsg) return;

    const msgIdx = messages.findIndex(m => m.id === msgId);
    let userQuery = "Explain how to structure my fitness goals";
    if (msgIdx > 0 && messages[msgIdx - 1].role === 'user') {
      userQuery = messages[msgIdx - 1].text;
    } else {
      for (let i = msgIdx - 1; i >= 0; i--) {
        if (messages[i].role === 'user') {
          userQuery = messages[i].text;
          break;
        }
      }
    }

    try {
      await addTrainingLog(userId, userQuery, botMsg.text, ratingValue);
    } catch (err) {
      console.error("Error logging feedback rating", err);
    }
  };

  const handleSuggestionClick = (text) => {
    setInputVal(text);
  };

  const formatMessageText = (text) => {
    return text.split('\n').map((line, idx) => {
      let content = line;
      let className = "text-xs font-medium leading-relaxed text-[var(--foreground)] opacity-90";

      if (content.startsWith('### ')) {
        content = content.replace('### ', '');
        className = "text-xs font-bold text-foreground mt-3 mb-1.5 block uppercase tracking-wider";
      } else if (content.startsWith('## ')) {
        content = content.replace('## ', '');
        className = "text-sm font-extrabold text-[var(--color-acid-green)] mt-4 mb-2 block uppercase tracking-wider";
      } else if (content.startsWith('# ')) {
        content = content.replace('# ', '');
        className = "text-md font-black text-[var(--color-acid-green)] mt-4 mb-2 block uppercase";
      }

      let isBullet = false;
      if (content.trim().startsWith('* ') || content.trim().startsWith('- ')) {
        content = content.trim().replace(/^[\*\-]\s+/, '');
        isBullet = true;
      }

      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIdx = 0;
      let match;
      while ((match = boldRegex.exec(content)) !== null) {
        if (match.index > lastIdx) {
          parts.push(content.substring(lastIdx, match.index));
        }
        parts.push(<strong key={match.index} className="text-foreground font-black">{match[1]}</strong>);
        lastIdx = boldRegex.lastIndex;
      }
      if (lastIdx < content.length) {
        parts.push(content.substring(lastIdx));
      }

      const finalContent = parts.length > 0 ? parts : content;

      if (isBullet) {
        return (
          <li key={idx} className="text-xs text-[var(--foreground)] opacity-85 ml-4 list-disc mt-1 font-medium">
            {finalContent}
          </li>
        );
      }

      return (
        <span key={idx} className={`${className} block`}>
          {finalContent}
        </span>
      );
    });
  };

  const renderHistoryList = () => (
    <>
      <button 
        onClick={handleNewChat}
        className="w-full flex items-center justify-center gap-2 py-2.5 mb-4 rounded-xl border border-dashed border-[var(--card-border)] hover:border-[var(--color-acid-green)] text-xs font-bold text-[var(--foreground)] hover:text-[var(--color-acid-green)] bg-surface/40 transition-all cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        New Consultation
      </button>

      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
        {sessions.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-5 h-5 text-muted mx-auto mb-2 opacity-50" />
            <p className="text-[10px] text-muted font-bold uppercase tracking-wider">No history recorded</p>
          </div>
        ) : (
          sessions.map(s => {
            const isActive = activeSessionId === s.id;
            return (
              <div
                key={s.id}
                onClick={() => handleSelectSession(s.id)}
                className={`flex justify-between items-center px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border group ${
                  isActive 
                    ? 'bg-[var(--color-acid-green)]/10 text-[var(--color-acid-green)] border-[var(--color-acid-green)]/20' 
                    : 'text-[var(--text-muted)] border-transparent hover:bg-surface/50 hover:text-[var(--foreground)]'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate mr-2">
                  <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{s.title || "Workout Chat"}</span>
                </div>
                <button
                  onClick={(e) => handleDeleteSession(e, s.id)}
                  className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 hover:text-red-500 transition-opacity cursor-pointer shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </>
  );

  return (
    <div className="flex flex-row h-[calc(100vh-140px)] max-h-[820px] glass rounded-2xl overflow-hidden relative border border-[var(--card-border)]">
      
      {/* ── Chat Sidebar (Desktop Only) ── */}
      <div className="hidden md:flex w-72 shrink-0 border-r border-[var(--card-border)] bg-surface/20 flex-col p-4">
        <div className="flex items-center gap-2 mb-4 px-1">
          <MessageSquare className="w-4 h-4 text-[var(--color-acid-green)]" />
          <h4 className="text-[10px] font-bold text-foreground uppercase tracking-widest">Consultation History</h4>
        </div>
        {renderHistoryList()}
      </div>

      {/* ── Chat Mobile Sidebar (Drawer Overlay) ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="md:hidden fixed left-0 top-0 bottom-0 z-50 w-72 bg-[var(--card-bg)] border-r border-[var(--card-border)] p-4 flex flex-col shadow-2xl"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-bold text-foreground uppercase tracking-widest">History</span>
                <button onClick={() => setSidebarOpen(false)} className="p-1 text-muted hover:text-foreground cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
              {renderHistoryList()}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Chat Area ── */}
      <div className="flex-1 flex flex-col h-full bg-transparent relative min-w-0">
        
        {/* Chat Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-[var(--card-border)] bg-surface/5 relative shrink-0">
          <div className="flex items-center gap-3">
            {/* Toggle History Button (Mobile Only) */}
            <button 
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-1.5 -ml-1 rounded-xl bg-surface border border-[var(--card-border)] text-[var(--text-muted)] cursor-pointer"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="w-9 h-9 rounded-full bg-[var(--color-acid-green)]/10 border border-[var(--color-acid-green)]/20 flex items-center justify-center relative">
              <Bot className="w-5 h-5 text-[var(--color-acid-green)]" />
              <div className="absolute w-2.5 h-2.5 bg-[var(--color-acid-green)] border-2 border-[var(--card-bg)] rounded-full bottom-0 right-0 animate-pulse"></div>
            </div>
            <div>
              <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                Calyxo Coach
                <Sparkles className="w-3.5 h-3.5 text-[var(--color-acid-green)] fill-[var(--color-acid-green)]/10" />
              </h3>
              <span className="text-[9px] text-muted font-bold tracking-widest uppercase">
                Embedded AI Concierge
              </span>
            </div>
          </div>
          
          <button 
            onClick={handleNewChat}
            className="md:hidden py-1 px-2.5 rounded-lg border border-[var(--card-border)] bg-surface text-[9px] font-bold text-foreground hover:border-[var(--color-acid-green)] transition-all cursor-pointer"
          >
            New Chat
          </button>
        </div>

        {/* Chat Messages Panel */}
        <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4">
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.map((msg) => {
              const isBot = msg.role === 'assistant';
              return (
                <div key={msg.id} className={`flex gap-3 max-w-[88%] md:max-w-[78%] ${isBot ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                    isBot 
                      ? 'bg-[var(--color-acid-green)]/10 border-[var(--color-acid-green)]/20 text-[var(--color-acid-green)]' 
                      : 'bg-surface border-[var(--card-border)] text-foreground'
                  }`}>
                    {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  <div className={`p-4 rounded-2xl text-xs flex flex-col space-y-1 shadow-sm border ${
                    isBot 
                      ? 'bg-surface/50 border-[var(--card-border)] text-foreground rounded-tl-none' 
                      : 'bg-[var(--color-acid-green)]/10 text-foreground border-[var(--color-acid-green)]/20 rounded-tr-none font-bold'
                  }`}>
                    <div className="whitespace-pre-wrap select-text">
                      {isBot ? formatMessageText(msg.text) : msg.text}
                    </div>

                    {isBot && msg.id !== 'welcome' && (
                      <div className="flex gap-2 mt-3.5 justify-end items-center border-t border-[var(--card-border)] pt-2">
                        <span className="text-[8.5px] text-muted mr-auto uppercase tracking-wider font-bold">Feedback:</span>
                        <button 
                          onClick={() => handleRateResponse(msg.id, 1)}
                          className={`p-1 rounded cursor-pointer transition-all hover:bg-black/5 dark:hover:bg-white/5 ${msg.rating === 1 ? 'text-[var(--color-acid-green)] bg-[var(--color-acid-green)]/10 border border-[var(--color-acid-green)]/20' : 'text-muted border border-transparent'}`}
                          title="Helpful (Thumbs Up)"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleRateResponse(msg.id, -1)}
                          className={`p-1 rounded cursor-pointer transition-all hover:bg-black/5 dark:hover:bg-white/5 ${msg.rating === -1 ? 'text-red-500 bg-red-500/10 border border-red-500/20' : 'text-muted border border-transparent'}`}
                          title="Not Helpful (Thumbs Down)"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    <span className="text-[8px] mt-2 block text-right font-medium opacity-50 text-muted">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex gap-3 mr-auto max-w-[80%]">
                <div className="w-8 h-8 rounded-full bg-[var(--color-acid-green)]/10 border border-[var(--color-acid-green)]/20 text-[var(--color-acid-green)] flex items-center justify-center animate-pulse">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-4 rounded-2xl bg-surface border border-[var(--card-border)] rounded-tl-none flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 bg-[var(--color-acid-green)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-[var(--color-acid-green)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-[var(--color-acid-green)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Suggestion Chips */}
        {messages.length === 1 && !loading && (
          <div className="px-5 py-2.5 flex gap-2 overflow-x-auto border-t border-[var(--card-border)] bg-surface/5 scrollbar-none shrink-0">
            <div className="max-w-4xl mx-auto flex gap-2 w-full">
              <button 
                onClick={() => handleSuggestionClick("Suggest a workout form tip for Squats")}
                className="px-3.5 py-2 rounded-full border border-[var(--card-border)] hover:border-[var(--color-acid-green)] hover:bg-[var(--color-acid-green)]/5 text-[10px] text-muted hover:text-[var(--color-acid-green)] font-bold whitespace-nowrap cursor-pointer transition-all bg-[var(--card-bg)]"
              >
                🏋️ Squat Form Tips
              </button>
              <button 
                onClick={() => handleSuggestionClick("Give me a recipe alternative to Chicken Biryani matching my goals")}
                className="px-3.5 py-2 rounded-full border border-[var(--card-border)] hover:border-[var(--color-acid-green)] hover:bg-[var(--color-acid-green)]/5 text-[10px] text-muted hover:text-[var(--color-acid-green)] font-bold whitespace-nowrap cursor-pointer transition-all bg-[var(--card-bg)]"
              >
                🍳 Biryani Alternative
              </button>
              <button 
                onClick={() => handleSuggestionClick("How can I adjust my macros for faster lean gains?")}
                className="px-3.5 py-2 rounded-full border border-[var(--card-border)] hover:border-[var(--color-acid-green)] hover:bg-[var(--color-acid-green)]/5 text-[10px] text-muted hover:text-[var(--color-acid-green)] font-bold whitespace-nowrap cursor-pointer transition-all bg-[var(--card-bg)]"
              >
                ⚡ Lean Gains Macros
              </button>
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-4 border-t border-[var(--card-border)] bg-surface/5 shrink-0 z-10">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex gap-3">
            <input 
              type="text" 
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Ask coach Calyxo about nutrition or workouts..."
              className="flex-1 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-full px-5 py-3 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--color-acid-green)] shadow-inner"
              disabled={loading}
            />
            <button 
              type="submit" 
              disabled={loading || !inputVal.trim()}
              className="w-10 h-10 rounded-full bg-[var(--color-acid-green)] text-black flex items-center justify-center shadow-[0_0_12px_rgba(204,255,0,0.3)] disabled:opacity-50 hover:shadow-[0_0_18px_rgba(204,255,0,0.5)] cursor-pointer shrink-0 transition-all active:scale-95 border-none"
            >
              <Send className="w-4 h-4 text-black" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
