"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, ChevronRight, CheckCircle, RefreshCw, MessageSquare, Coffee, Dumbbell, Activity, TrendingUp, PenTool } from 'lucide-react';

const INTENTS = [
  { id: 'caption', label: 'Generate Caption', icon: MessageSquare },
  { id: 'workout_analysis', label: 'Analyze Workout', icon: Dumbbell },
  { id: 'meal_analysis', label: 'Analyze Meal', icon: Coffee },
  { id: 'calories', label: 'Estimate Calories', icon: Activity },
  { id: 'progress', label: 'Analyze Progress', icon: TrendingUp },
  { id: 'tips', label: 'Generate Health Tips', icon: Sparkles },
  { id: 'story', label: 'Write a Story', icon: PenTool }
];

const STYLES = [
  'Minimal', 'Professional', 'Friendly', 'Motivational', 'Scientific', 'Educational', 'Funny'
];

export default function AIMagicModal({ isOpen, onClose, onApply, mediaFiles = [], context = {} }) {
  const [step, setStep] = useState(1);
  const [selectedIntent, setSelectedIntent] = useState('caption');
  const [selectedStyle, setSelectedStyle] = useState('Minimal');
  const [customText, setCustomText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleGenerate = async (regenerateParams = {}) => {
    setLoading(true);
    setStep(2);
    try {
      const currentMedia = mediaFiles.map(m => m.url || m.data).filter(Boolean);
      
      const payload = {
        media: currentMedia,
        intent: regenerateParams.intent || selectedIntent,
        style: regenerateParams.style || selectedStyle,
        context,
        customText: regenerateParams.customText || customText
      };

      const res = await fetch('/api/gemini/post-magic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error("Generation failed");
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setResult({ text: "An error occurred while generating content. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateAction = (action) => {
    let newCustom = customText;
    if (action === 'shorter') newCustom = "Make it shorter. " + customText;
    if (action === 'longer') newCustom = "Make it more detailed and longer. " + customText;
    if (action === 'emoji') newCustom = "Add more relevant emojis. " + customText;
    handleGenerate({ customText: newCustom });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        className="absolute inset-0 bg-background/80 backdrop-blur-md"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg glass bg-surface/90 border border-card-border rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
      >
        <div className="flex justify-between items-center p-5 border-b border-card-border">
          <div className="flex items-center gap-2 text-acid-green">
            <Sparkles className="w-5 h-5" />
            <h2 className="text-base font-black uppercase tracking-wider text-foreground">AI Magic V2</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5 text-muted hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {step === 1 ? (
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-bold text-muted uppercase tracking-wider mb-2 block">What would you like AI Magic to do?</label>
                <div className="grid grid-cols-2 gap-2">
                  {INTENTS.map(intent => (
                    <button
                      key={intent.id}
                      onClick={() => setSelectedIntent(intent.id)}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all ${
                        selectedIntent === intent.id 
                          ? 'bg-acid-green/10 border-acid-green text-acid-green' 
                          : 'bg-surface/50 border-card-border text-muted hover:text-foreground hover:bg-surface'
                      }`}
                    >
                      <intent.icon className="w-5 h-5 mb-2" />
                      <span className="text-[10px] font-bold uppercase">{intent.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-muted uppercase tracking-wider mb-2 block">Writing Style</label>
                <div className="flex flex-wrap gap-2">
                  {STYLES.map(style => (
                    <button
                      key={style}
                      onClick={() => setSelectedStyle(style)}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all border ${
                        selectedStyle === style 
                          ? 'bg-acid-green text-accent-foreground border-acid-green' 
                          : 'bg-surface border-card-border text-muted hover:text-foreground'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-muted uppercase tracking-wider mb-2 block">Custom Instructions (Optional)</label>
                <textarea
                  value={customText}
                  onChange={e => setCustomText(e.target.value)}
                  placeholder="e.g., Focus on my new PR, mention I was tired but pushed through..."
                  className="w-full bg-surface border border-card-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-acid-green resize-none"
                  rows={2}
                />
              </div>

              <button 
                onClick={() => handleGenerate()}
                className="w-full btn-primary py-3 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Generate Magic
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <RefreshCw className="w-8 h-8 text-acid-green animate-spin mb-4" />
                  <p className="text-xs text-muted font-bold uppercase tracking-wider animate-pulse">Analyzing context & media...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-surface/50 border border-card-border rounded-xl p-4 relative">
                    <div className="absolute -top-3 left-4 bg-acid-green text-accent-foreground px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider">Result</div>
                    <textarea 
                      value={result?.text || ''}
                      onChange={(e) => setResult({ ...result, text: e.target.value })}
                      className="w-full bg-transparent text-sm text-foreground focus:outline-none resize-none mt-2 min-h-[150px]"
                    />
                  </div>

                  {/* Smart Actions based on AI detection */}
                  {result?.suggestedActions && result.suggestedActions.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <label className="text-[10px] font-bold text-acid-green uppercase tracking-wider block flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Smart Actions Detected
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {result.suggestedActions.map((action, i) => (
                          <button key={i} className="px-3 py-1.5 rounded-full bg-acid-green/10 border border-acid-green/20 text-acid-green text-[10px] font-bold uppercase hover:bg-acid-green/20 transition-colors">
                            {action}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Refinement Actions */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 border-t border-card-border/50">
                    <button onClick={() => handleGenerate()} className="py-2 text-[9px] font-bold uppercase text-muted hover:text-foreground border border-card-border rounded-lg flex items-center justify-center gap-1">
                      <RefreshCw className="w-3 h-3" /> Retry
                    </button>
                    <button onClick={() => handleRegenerateAction('shorter')} className="py-2 text-[9px] font-bold uppercase text-muted hover:text-foreground border border-card-border rounded-lg">Make Shorter</button>
                    <button onClick={() => handleRegenerateAction('longer')} className="py-2 text-[9px] font-bold uppercase text-muted hover:text-foreground border border-card-border rounded-lg">Make Longer</button>
                    <button onClick={() => handleRegenerateAction('emoji')} className="py-2 text-[9px] font-bold uppercase text-muted hover:text-foreground border border-card-border rounded-lg">Add Emojis</button>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button onClick={() => setStep(1)} className="flex-1 py-3 text-[10px] font-bold uppercase text-muted hover:text-foreground rounded-xl border border-card-border">Back</button>
                    <button onClick={() => { onApply(result?.text); onClose(); }} className="flex-2 btn-primary py-3 rounded-xl font-bold uppercase text-[10px] flex items-center justify-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Apply to Post
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
