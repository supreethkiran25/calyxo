
import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Bot, 
  Send, 
  RefreshCw, 
  Trash2, 
  Edit3, 
  Pin, 
  Plus, 
  Search, 
  X, 
  ThumbsUp, 
  ThumbsDown, 
  Copy, 
  Check, 
  Activity, 
  Flame, 
  Droplet, 
  Dumbbell, 
  Heart, 
  ArrowUpRight, 
  ShieldCheck, 
  Clock,
  CheckCircle2,
  Menu,
  Crown,
  Lock,
  Sparkles,
  MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore.js';
import { useEcosystemStore } from '../../store/useEcosystemStore.js';
import { chatSessionManager } from '../../services/ai/ChatSessionManager.js';
import { aiBriefingEngine } from '../../services/ai/AIBriefingEngine.js';
import { calyxoAIOrchestrator } from '../../services/ai/CalyxoAIOrchestrator.js';
import { planToActionBridge } from '../../services/ai/PlanToActionBridge.js';
import { SubscriptionManager } from '../../services/subscription/SubscriptionManager.js';
import PremiumFeatureModal from '../modals/PremiumFeatureModal.jsx';

const QUICK_ACTIONS = [
  { label: "Analyze today's health", icon: Activity, query: "Analyze today's health biometrics and recovery readiness." },
  { label: "Build a workout", icon: Dumbbell, query: "Build a 45-minute upper body workout plan for hypertrophy." },
  { label: "Build a meal plan", icon: Flame, query: "Create a high-protein vegetarian daily meal plan with macros." },
  { label: "Explain my recovery", icon: Heart, query: "Why is my recovery score at this level today and how do I improve it?" },
  { label: "What to eat after leg day?", icon: Flame, query: "What should I eat after leg day for optimal protein synthesis?" },
  { label: "How to improve sleep?", icon: Clock, query: "How can I improve my deep sleep and recovery?" }
];

export default function AIIntelligenceHub({ onNotification, isModal = false, onClose = null }) {
  const user = useStore(state => state.user);
  const userProfile = useStore(state => state.userProfile);
  const updateUserProfile = useStore(state => state.updateUserProfile);
  const foodLogs = useStore(state => state.foodLogs);
  const workoutLogs = useStore(state => state.workoutLogs);
  const waterIntake = useStore(state => state.waterIntake);
  const weightLogs = useStore(state => state.weightLogs);
  const ecoStore = useEcosystemStore();

  const [activeSession, setActiveSession] = useState(null);
  const [sessionsList, setSessionsList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingStep, setThinkingStep] = useState('Analyzing biometrics...');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  // Briefing state
  const [briefing, setBriefing] = useState(null);
  const [isBriefingLoading, setIsBriefingLoading] = useState(false);

  // Plan Confirmation Modal State
  const [pendingPlanAction, setPendingPlanAction] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const subStatus = SubscriptionManager.getSubscriptionStatus(userProfile, user);
  const isSubscribed = Boolean(subStatus.isSubscribed || userProfile?.isSubscribed || userProfile?.subscriptionPlan === 'HIGH' || userProfile?.subscriptionPlan === 'HIGH_ANNUAL');

  // Dynamic Virtual Keyboard & Viewport Tracking
  useEffect(() => {
    let showListener, hideListener;

    // 1. Capacitor Native Keyboard Plugin (iOS & Android)
    try {
      import('@capacitor/keyboard').then(({ Keyboard }) => {
        showListener = Keyboard.addListener('keyboardWillShow', info => {
          const h = info.keyboardHeight || 0;
          setKeyboardHeight(h);
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        });
        hideListener = Keyboard.addListener('keyboardWillHide', () => {
          setKeyboardHeight(0);
        });
      }).catch(() => {});
    } catch (e) {}

    // 2. Visual Viewport API (Mobile Web / PWA / Fallback)
    const handleViewportChange = () => {
      if (window.visualViewport) {
        const offset = window.innerHeight - window.visualViewport.height;
        if (offset > 120) {
          setKeyboardHeight(offset);
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        } else {
          setKeyboardHeight(0);
        }
      }
    };

    window.visualViewport?.addEventListener('resize', handleViewportChange);
    window.visualViewport?.addEventListener('scroll', handleViewportChange);

    return () => {
      showListener?.remove?.();
      hideListener?.remove?.();
      window.visualViewport?.removeEventListener('resize', handleViewportChange);
      window.visualViewport?.removeEventListener('scroll', handleViewportChange);
    };
  }, []);

  // Refresh Sessions from Manager
  const refreshSessions = () => {
    const currentUserId = user?.uid || user?.id || 'guest';
    chatSessionManager.setUser(currentUserId);
    const list = chatSessionManager.getActiveSessionsList();
    setSessionsList(list);
    const active = chatSessionManager.getActiveSession();
    if (!active && list.length === 0) {
      const created = chatSessionManager.createSession({
        title: 'New Conversation',
        role: userProfile?.role || 'USER',
        userName: userProfile?.name || userProfile?.fullName || user?.displayName || 'Athlete'
      });
      setActiveSession(created);
      setSessionsList([created]);
    } else {
      setActiveSession(active || list[0]);
    }
  };

  // Generate Grounded Intelligence Briefing
  const loadBriefing = () => {
    setIsBriefingLoading(true);
    try {
      const res = aiBriefingEngine.generateGroundedBriefing({
        userProfile,
        foodLogs,
        workoutLogs,
        weightLogs,
        waterIntake,
        healthLogs: ecoStore.healthLogs || {}
      });
      setBriefing(res);
    } catch (e) {
      console.error('Failed to generate briefing:', e);
    } finally {
      setIsBriefingLoading(false);
    }
  };

  useEffect(() => {
    refreshSessions();
    loadBriefing();
  }, [userProfile, foodLogs, workoutLogs, waterIntake]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages, isThinking]);

  // Handle Query Submission
  const handleSendMessage = async (textToSend = null) => {
    if (!isSubscribed) {
      setShowPremiumModal(true);
      return;
    }

    const query = (textToSend || inputValue).trim();
    if (!query || isThinking) return;

    if (!textToSend) setInputValue('');

    // Append User Message
    chatSessionManager.appendMessage({
      role: 'user',
      text: query,
      timestamp: Date.now()
    }, activeSession?.id);

    refreshSessions();
    setIsThinking(true);
    setThinkingStep('Retrieving verified health telemetry...');

    setTimeout(() => setThinkingStep('Consulting deterministic engines...'), 350);

    try {
      const aiResponse = await calyxoAIOrchestrator.processUserQuery({
        query,
        userProfile,
        user,
        foodLogs,
        workoutLogs,
        weightLogs,
        waterIntake,
        healthLogs: ecoStore.healthLogs || {},
        activePlan: activeSession?.messages?.slice(-1)[0]?.plan || null
      });

      chatSessionManager.appendMessage(aiResponse, activeSession?.id);
      refreshSessions();
    } catch (err) {
      console.error('AI Query Exception:', err);
      chatSessionManager.appendMessage({
        role: 'assistant',
        text: '### ⚠️ AI Service Temporarily Unavailable\n\nUnable to process the query. Please retry in a few moments.',
        sourceProvenance: 'System Error'
      }, activeSession?.id);
      refreshSessions();
    } finally {
      setIsThinking(false);
    }
  };

  // Handle Plan Confirmation Injection
  const executePlanAction = async (plan) => {
    if (!plan) return;
    if (plan.actionType === 'WORKOUT_INJECTION') {
      const res = await planToActionBridge.applyWorkoutPlan(plan, { user, userProfile, onNotification });
      if (res.success && onNotification) {
        onNotification(`"${plan.title}" saved to your Workout Plans!`);
      }
    } else if (plan.actionType === 'NUTRITION_INJECTION') {
      const res = await planToActionBridge.applyNutritionPlan(plan, { user, userProfile, updateUserProfile, onNotification });
      if (res.success && onNotification) {
        onNotification('Daily nutrition targets updated!');
      }
    }
    setPendingPlanAction(null);
  };

  const copyToClipboard = (id, text) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className={`flex flex-col h-full max-w-7xl mx-auto w-full bg-background text-foreground ${isModal ? '' : 'border-0 sm:border sm:border-card-border sm:rounded-3xl sm:shadow-2xl'} overflow-hidden relative`}>
      
      <div className="flex flex-1 h-full overflow-hidden relative">
        {/* ── Chat History Sidebar ────────────────────────────────────────── */}
        <aside className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 absolute lg:relative z-30 inset-y-0 left-0 w-80 bg-surface/95 backdrop-blur-xl border-r border-card-border flex flex-col transition-transform duration-300 ease-in-out
        `}>
          <div className="p-4 border-b border-card-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-accent/10 text-accent border border-accent/20">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground leading-tight">Calyxo AI</h2>
                <div className="flex items-center gap-1">
                  {isSubscribed ? (
                    <span className="text-[10px] text-accent font-mono font-bold">{subStatus.planName}</span>
                  ) : (
                    <span className="text-[10px] text-amber-500 font-mono font-bold flex items-center gap-0.5">
                      <Lock className="w-2.5 h-2.5" /> High Exclusive
                    </span>
                  )}
                </div>
              </div>
            </div>
            {!isSubscribed ? (
              <button
                type="button"
                onClick={() => setShowPremiumModal(true)}
                className="px-2.5 py-1 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-[10px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all shadow-md shadow-amber-400/20 shrink-0"
              >
                <Crown className="w-3 h-3 fill-black" />
                <span>Upgrade</span>
              </button>
            ) : (
              <button 
                onClick={() => {
                  const newSess = chatSessionManager.createSession({
                    title: 'New Conversation',
                    role: userProfile?.role || 'USER'
                  });
                  refreshSessions();
                  setSidebarOpen(false);
                }}
                className="p-1.5 rounded-xl bg-surface-subtle hover:bg-surface-interactive text-accent border border-accent/30 hover:border-accent transition-all cursor-pointer flex items-center gap-1 text-xs font-semibold px-2.5"
                title="Create New Chat"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New</span>
              </button>
            )}
          </div>

          {/* Search */}
          <div className="p-3 border-b border-card-border/50">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-surface-subtle border border-card-border text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
              />
            </div>
          </div>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {(searchQuery ? chatSessionManager.searchSessions(searchQuery) : sessionsList).map(sess => {
              const isActive = sess.id === activeSession?.id;
              return (
                <div 
                  key={sess.id}
                  onClick={() => {
                    chatSessionManager.setActiveSession(sess.id);
                    refreshSessions();
                    setSidebarOpen(false);
                  }}
                  className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs cursor-pointer transition-all ${
                    isActive 
                      ? 'bg-surface-subtle text-foreground font-bold border border-card-border shadow-xs' 
                      : 'text-secondary hover:text-foreground hover:bg-surface-subtle'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate flex-1">
                    {sess.isPinned && <Pin className="w-3 h-3 text-accent shrink-0 fill-accent/20" />}
                    {editingSessionId === sess.id ? (
                      <input 
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onBlur={() => {
                          chatSessionManager.renameSession(sess.id, editingTitle);
                          setEditingSessionId(null);
                          refreshSessions();
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            chatSessionManager.renameSession(sess.id, editingTitle);
                            setEditingSessionId(null);
                            refreshSessions();
                          }
                        }}
                        autoFocus
                        className="bg-neutral-900 border border-acid-green px-1.5 py-0.5 rounded text-white text-xs w-full focus:outline-none"
                      />
                    ) : (
                      <span className="truncate">{sess.title}</span>
                    )}
                  </div>

                  {/* Session Actions */}
                  <div className="hidden group-hover:flex items-center gap-1 shrink-0 ml-1">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingSessionId(sess.id);
                        setEditingTitle(sess.title);
                      }}
                      className="p-1 hover:text-white text-neutral-500 cursor-pointer"
                      title="Rename"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        chatSessionManager.togglePin(sess.id);
                        refreshSessions();
                      }}
                      className={`p-1 cursor-pointer ${sess.isPinned ? 'text-acid-green' : 'hover:text-white text-neutral-500'}`}
                      title={sess.isPinned ? 'Unpin' : 'Pin'}
                    >
                      <Pin className="w-3 h-3" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Delete this conversation?')) {
                          chatSessionManager.deleteSession(sess.id);
                          refreshSessions();
                        }
                      }}
                      className="p-1 hover:text-red-400 text-neutral-500 cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Clear Conversation Footer */}
          {activeSession && (
            <div className="p-3 border-t border-card-border/50">
              <button 
                onClick={() => {
                  const userName = userProfile?.name || userProfile?.fullName || user?.displayName || 'Athlete';
                  const cleared = chatSessionManager.clearConversation(activeSession.id, userName);
                  if (cleared) {
                    setActiveSession({ ...cleared });
                    refreshSessions();
                    if (onNotification) onNotification('Conversation cleared ✓');
                  }
                }}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-surface-subtle hover:bg-surface-interactive text-muted hover:text-foreground text-xs font-mono transition-colors cursor-pointer border border-card-border"
              >
                <RefreshCw className="w-3 h-3 text-amber-500" />
                <span>Clear History</span>
              </button>
            </div>
          )}
        </aside>

        {/* ── Main AI Workspace ───────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col h-full bg-background overflow-hidden relative">
          
          {/* Top Intelligence Header */}
          <header className="px-3 py-2 sm:px-4 sm:py-3 border-b border-card-border bg-surface/80 backdrop-blur-md flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-1.5 sm:p-2 rounded-xl bg-surface-subtle hover:bg-surface-interactive text-foreground cursor-pointer shrink-0"
                aria-label="Toggle Conversation Sidebar"
              >
                <Menu className="w-4 h-4" />
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h1 className="text-xs sm:text-base font-black text-foreground tracking-wide truncate">CALYXO INTELLIGENCE</h1>
                  <span className="px-1.5 py-0.5 rounded-full bg-accent/15 text-accent text-[8px] sm:text-[9px] font-black uppercase tracking-wider border border-accent/30 shrink-0">
                    REAL-DATA GROUNDED
                  </span>
                </div>
                <p className="hidden sm:block text-[11px] text-muted font-mono">Personalized Health & Performance Architecture</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={loadBriefing}
                className="p-1.5 rounded-xl bg-surface-subtle hover:bg-surface-interactive text-foreground text-xs flex items-center gap-1 border border-card-border cursor-pointer transition-colors"
                title="Refresh Briefing"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isBriefingLoading ? 'animate-spin text-accent' : ''}`} />
                <span className="hidden sm:inline text-[11px] font-mono">Sync</span>
              </button>

              {/* Actions Dropdown Menu */}
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="p-1.5 rounded-xl bg-surface-subtle hover:bg-surface-interactive text-foreground border border-card-border cursor-pointer transition-colors"
                  title="More Options"
                  aria-label="More AI options"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-surface border border-card-border rounded-2xl shadow-2xl z-50 p-1.5 space-y-1 backdrop-blur-xl">
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        handleCreateNewSession();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-foreground hover:bg-surface-subtle rounded-xl cursor-pointer text-left"
                    >
                      <Plus className="w-3.5 h-3.5 text-accent" />
                      <span>New Chat</span>
                    </button>
                    {activeSession && (
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          const userName = userProfile?.name || userProfile?.fullName || user?.displayName || 'Athlete';
                          const cleared = chatSessionManager.clearConversation(activeSession.id, userName);
                          if (cleared) {
                            setActiveSession({ ...cleared });
                            refreshSessions();
                            if (onNotification) onNotification('Chat messages cleared ✓');
                          }
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-amber-500 hover:bg-amber-500/10 rounded-xl cursor-pointer text-left"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Clear Current Chat</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        const userName = userProfile?.name || userProfile?.fullName || user?.displayName || 'Athlete';
                        const newSession = chatSessionManager.clearAllSessions(userName);
                        setActiveSession(newSession);
                        refreshSessions();
                        if (onNotification) onNotification('All conversation history cleared ✓');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 rounded-xl cursor-pointer text-left"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear All History</span>
                    </button>
                  </div>
                )}
              </div>

              {isModal && onClose && (
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-xl bg-surface-subtle hover:bg-surface-interactive text-muted hover:text-foreground border border-card-border transition-colors cursor-pointer"
                  title="Close"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </header>

          {/* Scrollable Conversation & Landing Hub Area */}
          <div className="flex-1 overflow-y-auto px-4 py-4 sm:p-6 space-y-5 custom-scrollbar">
            
            {/* 👑 Free Tier Paywall Banner */}
            {!isSubscribed && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-5 sm:p-6 rounded-3xl bg-surface border border-amber-500/40 shadow-card space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase tracking-widest font-mono">
                      <Crown className="w-3.5 h-3.5 fill-amber-400" />
                      <span>Calyxo High Subscription Required</span>
                    </div>
                    <h3 className="text-base font-black text-foreground">Unlock Full AI Coaching & Intelligence</h3>
                    <p className="text-xs text-secondary max-w-xl leading-relaxed">
                      Upgrade to Calyxo High to unlock personalized daily athletic briefings, unlimited AI workout programming, macro-targeted meal planning, and recovery explanations.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPremiumModal(true)}
                    className="px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-amber-400/20 shrink-0 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Unlock Calyxo AI (₹2/mo)</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Dynamic Real-Data Briefing Card (Landing State) */}
            {briefing && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 sm:p-5 rounded-3xl bg-surface border border-card-border shadow-card space-y-3.5"
              >
                <div className="flex items-center justify-between border-b border-card-border/60 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-foreground font-mono">Today's Health Intelligence</h3>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-secondary font-mono">
                    <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                    <span>{briefing.source}</span>
                  </div>
                </div>

                {/* 4-Pillar Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-2.5 sm:p-3 rounded-2xl bg-surface-subtle border border-card-border space-y-1 shadow-xs">
                    <div className="flex items-center justify-between text-muted text-[10px]">
                      <span>Recovery</span>
                      <Heart className="w-3.5 h-3.5 text-rose-500" />
                    </div>
                    <div className="text-base sm:text-lg font-black text-foreground font-mono">
                      {briefing.metricsSummary.recoveryScore ? `${briefing.metricsSummary.recoveryScore}%` : '—'}
                    </div>
                    <div className="text-[10px] text-accent font-mono truncate">
                      {briefing.metricsSummary.recoveryReadiness}
                    </div>
                  </div>

                  <div className="p-2.5 sm:p-3 rounded-2xl bg-surface-subtle border border-card-border space-y-1 shadow-xs">
                    <div className="flex items-center justify-between text-muted text-[10px]">
                      <span>Nutrition</span>
                      <Flame className="w-3.5 h-3.5 text-amber-500" />
                    </div>
                    <div className="text-base sm:text-lg font-black text-foreground font-mono">
                      {briefing.metricsSummary.nutritionStatus}
                    </div>
                    <div className="text-[10px] text-muted font-mono truncate">Daily Target</div>
                  </div>

                  <div className="p-2.5 sm:p-3 rounded-2xl bg-surface-subtle border border-card-border space-y-1 shadow-xs">
                    <div className="flex items-center justify-between text-muted text-[10px]">
                      <span>Training</span>
                      <Dumbbell className="w-3.5 h-3.5 text-cyan-500" />
                    </div>
                    <div className="text-base sm:text-lg font-black text-foreground font-mono">
                      {briefing.metricsSummary.workoutCount} <span className="text-xs font-normal text-muted">session(s)</span>
                    </div>
                    <div className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono truncate">Verified Sets</div>
                  </div>

                  <div className="p-2.5 sm:p-3 rounded-2xl bg-surface-subtle border border-card-border space-y-1 shadow-xs">
                    <div className="flex items-center justify-between text-muted text-[10px]">
                      <span>Hydration</span>
                      <Droplet className="w-3.5 h-3.5 text-blue-500" />
                    </div>
                    <div className="text-base sm:text-lg font-black text-foreground font-mono">
                      {briefing.metricsSummary.hydrationPercent}%
                    </div>
                    <div className="text-[10px] text-blue-600 dark:text-blue-400 font-mono truncate">Sentinel Log</div>
                  </div>
                </div>

                <p className="text-xs text-secondary leading-relaxed font-sans pt-1">
                  {briefing.insightSummary}
                </p>
              </motion.div>
            )}

            {/* Quick Action Prompt Chips */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted">Suggested Inquiries</div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {QUICK_ACTIONS.map((action, idx) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(action.query)}
                      className={`flex items-center gap-2 px-3 py-1.5 sm:py-2 rounded-2xl border text-xs transition-all shrink-0 cursor-pointer shadow-xs active:scale-95 ${
                        !isSubscribed 
                          ? 'bg-surface-subtle hover:bg-surface-interactive border-amber-500/20 text-secondary' 
                          : 'bg-surface hover:bg-surface-interactive border-card-border text-foreground'
                      }`}
                    >
                      {!isSubscribed ? (
                        <Lock className="w-3 h-3 text-amber-500 shrink-0" />
                      ) : (
                        <Icon className="w-3.5 h-3.5 text-accent shrink-0" />
                      )}
                      <span className="whitespace-nowrap font-medium">{action.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Messages Stream */}
            <div className="space-y-4 pt-1">
              {(activeSession?.messages || []).map((msg, idx) => {
                const isUser = msg.role === 'user';
                return (
                  <motion.div
                    key={msg.id || idx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
                  >
                    <div className={`
                      max-w-2xl rounded-3xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed shadow-card ${
                        isUser
                          ? 'bg-accent text-accent-foreground font-semibold rounded-br-sm'
                          : 'bg-surface border border-card-border text-foreground rounded-bl-sm'
                      }
                    `}>
                      {isUser ? (
                        <div className="whitespace-pre-wrap">{msg.text}</div>
                      ) : (
                        <div className="prose prose-invert max-w-none text-xs sm:text-sm space-y-2">
                          <ReactMarkdown
                            components={{
                              h3: ({ children }) => (
                                <h3 className="text-sm sm:text-base font-black text-acid-green mt-1 mb-2 tracking-wide flex items-center gap-1.5">
                                  {children}
                                </h3>
                              ),
                              h4: ({ children }) => (
                                <h4 className="text-xs sm:text-sm font-bold text-white mt-2 mb-1">
                                  {children}
                                </h4>
                              ),
                              p: ({ children }) => (
                                <p className="text-neutral-200 leading-relaxed my-1.5">
                                  {children}
                                </p>
                              ),
                              ul: ({ children }) => (
                                <ul className="list-disc pl-4 space-y-1 my-2 text-neutral-200">
                                  {children}
                                </ul>
                              ),
                              ol: ({ children }) => (
                                <ol className="list-decimal pl-4 space-y-1.5 my-2 text-neutral-200">
                                  {children}
                                </ol>
                              ),
                              li: ({ children }) => (
                                <li className="leading-relaxed">
                                  {children}
                                </li>
                              ),
                              strong: ({ children }) => (
                                <strong className="font-bold text-white">
                                  {children}
                                </strong>
                              ),
                              hr: () => (
                                <hr className="border-neutral-800 my-3" />
                              )
                            }}
                          >
                            {msg.text}
                          </ReactMarkdown>
                        </div>
                      )}

                      {/* Interactive Plan Action Card */}
                      {msg.plan && (
                        <div className="mt-4 p-4 rounded-2xl bg-black/50 border border-neutral-700/60 space-y-3">
                          <div className="flex items-center justify-between border-b border-neutral-700/40 pb-2">
                            <h4 className="font-bold text-white text-xs sm:text-sm">{msg.plan.title}</h4>
                            <span className="px-2 py-0.5 rounded-full bg-acid-green/20 text-acid-green text-[10px] font-mono uppercase font-bold">
                              {msg.plan.actionType === 'WORKOUT_INJECTION' ? 'Workout Routine' : 'Meal Blueprint'}
                            </span>
                          </div>

                          {/* Single Day Exercises List */}
                          {msg.plan.exercises && !msg.plan.days && (
                            <div className="space-y-1.5">
                              {msg.plan.exercises.map((ex, exIdx) => (
                                <div key={exIdx} className="flex items-center justify-between text-xs text-neutral-300 py-0.5">
                                  <span>• {ex.name}</span>
                                  <span className="font-mono text-[11px] text-neutral-400">{ex.sets} sets × {ex.reps}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* 7-Day Weekly Program Schedule */}
                          {msg.plan.days && (
                            <div className="space-y-2.5 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                              {msg.plan.days.map((d, dIdx) => (
                                <div key={dIdx} className="p-2.5 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-1">
                                  <div className="flex items-center justify-between">
                                    <div className="font-bold text-xs text-acid-green">{d.dayName}</div>
                                    <span className="text-[10px] font-mono text-neutral-400">{d.durationMinutes > 0 ? `${d.durationMinutes} min` : 'Rest Day'}</span>
                                  </div>
                                  <div className="text-[10.5px] text-neutral-400">{d.focus}</div>
                                  <div className="space-y-0.5 pt-1 border-t border-neutral-800/60">
                                    {d.exercises.slice(0, 3).map((ex, exIdx) => (
                                      <div key={exIdx} className="flex items-center justify-between text-[10.5px] text-neutral-300">
                                        <span className="truncate mr-2">• {ex.name}</span>
                                        <span className="font-mono text-neutral-400 shrink-0">{ex.sets} × {ex.reps}</span>
                                      </div>
                                    ))}
                                    {d.exercises.length > 3 && (
                                      <div className="text-[10px] text-neutral-500 font-mono">+ {d.exercises.length - 3} more exercises</div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Meals List */}
                          {msg.plan.meals && (
                            <div className="space-y-1.5">
                              {msg.plan.meals.map((m, mIdx) => (
                                <div key={mIdx} className="text-xs text-secondary py-0.5">
                                  <div className="font-bold text-foreground">{m.name}</div>
                                  <div className="text-[11px] text-muted font-mono">{m.calories} kcal · {m.protein}g protein</div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Confirmation Action Button */}
                          <div className="pt-2 flex justify-end">
                            <button
                              onClick={() => setPendingPlanAction(msg.plan)}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent text-accent-foreground font-bold text-xs hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer border-none"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>{msg.plan.actionType === 'WORKOUT_INJECTION' ? 'Add to My Plan' : 'Apply to Nutrition'}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Message Metadata & Feedback Footer */}
                    {!isUser && (
                      <div className="flex items-center justify-between w-full max-w-2xl px-2 text-[10px] text-muted font-mono">
                        <div>
                          {msg.sourceProvenance && (
                            <span className="text-muted">Based on: {msg.sourceProvenance}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => copyToClipboard(msg.id, msg.text)} 
                            className="hover:text-foreground transition-colors cursor-pointer p-1 border-none bg-transparent"
                            title="Copy response"
                          >
                            {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-accent" /> : <Copy className="w-3.5 h-3.5 text-muted" />}
                          </button>
                          <button 
                            onClick={() => {
                              chatSessionManager.setMessageFeedback(activeSession.id, msg.id, 'up');
                              refreshSessions();
                            }} 
                            className={`hover:text-accent transition-colors cursor-pointer p-1 border-none bg-transparent ${msg.feedback === 'up' ? 'text-accent' : 'text-muted'}`}
                            title="Helpful"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => {
                              chatSessionManager.setMessageFeedback(activeSession.id, msg.id, 'down');
                              refreshSessions();
                            }} 
                            className={`hover:text-rose-500 transition-colors cursor-pointer p-1 border-none bg-transparent ${msg.feedback === 'down' ? 'text-rose-500' : 'text-muted'}`}
                            title="Not helpful"
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}

              {/* Thinking / Streaming Indicator */}
              {isThinking && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="flex items-center gap-2 p-3 rounded-2xl bg-surface-subtle border border-card-border text-secondary text-xs w-fit"
                >
                  <Bot className="w-3.5 h-3.5 text-accent animate-pulse" />
                  <span className="font-mono">{thinkingStep}</span>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          <div 
            className="p-2.5 sm:p-4 border-t border-card-border bg-surface/95 backdrop-blur-xl shrink-0 transition-all duration-150"
            style={{ paddingBottom: keyboardHeight > 0 ? `${keyboardHeight + 8}px` : 'max(env(safe-area-inset-bottom, 0px), var(--keyboard-height, 0px))' }}
          >
            {isSubscribed ? (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2 max-w-4xl mx-auto"
              >
                <input 
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onFocus={() => {
                    setTimeout(() => {
                      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                      inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }, 250);
                  }}
                  placeholder="Ask Calyxo anything (e.g. 'Build a 30m dumbbell workout' or 'Explain my recovery')..."
                  disabled={isThinking}
                  className="flex-1 bg-surface-subtle border border-card-border focus:border-accent text-foreground placeholder:text-muted rounded-2xl px-3.5 py-2.5 sm:px-4 sm:py-3 text-base sm:text-sm focus:outline-none transition-colors"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isThinking}
                  className="p-2.5 sm:p-3 rounded-2xl bg-accent disabled:opacity-40 disabled:hover:scale-100 text-accent-foreground hover:scale-105 active:scale-95 transition-all cursor-pointer font-bold shrink-0 shadow-md shadow-accent/20 border-none"
                  aria-label="Send Query"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <div 
                onClick={() => setShowPremiumModal(true)}
                className="flex items-center justify-between gap-3 max-w-4xl mx-auto p-3.5 rounded-2xl bg-surface-subtle border border-amber-500/30 hover:border-amber-500/60 transition-all cursor-pointer group shadow-card"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-500 shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                  <span className="text-xs text-secondary group-hover:text-foreground transition-colors truncate">
                    AI Chat requires Calyxo High subscription. Tap to unlock...
                  </span>
                </div>
                <span className="px-3.5 py-1.5 rounded-xl bg-amber-400 text-black font-black text-[10px] uppercase tracking-wider shrink-0 shadow-md shadow-amber-400/20 flex items-center gap-1 group-hover:scale-105 transition-transform">
                  <Crown className="w-3 h-3 fill-black" />
                  <span>Upgrade</span>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Plan Confirmation Modal ──────────────────────────────────────── */}
      <AnimatePresence>
        {pendingPlanAction && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95 }} 
              animate={{ scale: 1 }} 
              exit={{ scale: 0.95 }} 
              className="w-full max-w-md bg-surface border border-card-border rounded-3xl p-6 space-y-4 shadow-card"
            >
              <div className="flex items-center justify-between border-b border-card-border pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent" />
                  <h3 className="text-sm font-bold text-foreground">Confirm Plan Injection</h3>
                </div>
                <button 
                  onClick={() => setPendingPlanAction(null)} 
                  className="p-1 text-muted hover:text-foreground cursor-pointer bg-transparent border-none"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-secondary leading-relaxed">
                Are you sure you want to apply <strong>"{pendingPlanAction.title}"</strong> to your active {pendingPlanAction.actionType === 'WORKOUT_INJECTION' ? 'Workout Routine Library' : 'Nutrition Targets'}?
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setPendingPlanAction(null)}
                  className="px-4 py-2 rounded-xl bg-surface-subtle text-secondary text-xs font-semibold hover:text-foreground border border-card-border cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => executePlanAction(pendingPlanAction)}
                  className="px-4 py-2 rounded-xl bg-accent text-accent-foreground text-xs font-bold hover:brightness-110 active:scale-95 transition-all cursor-pointer border-none shadow-md shadow-accent/20"
                >
                  Confirm & Apply
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Premium Feature Paywall Modal ─────────────────────────────────── */}
      <PremiumFeatureModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        featureName="Calyxo AI Coach & Intelligence Hub"
      />
    </div>
  );
}
