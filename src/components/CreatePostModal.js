"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Dumbbell, BookOpen, Activity, Sparkles, Trophy, 
  Image as ImageIcon, Video, AlignLeft, Target, Calendar, 
  Users, BarChart2, ChevronLeft, MapPin, Tag, Globe, Lock, Shield
} from 'lucide-react';
import { publishActivity } from '../lib/socialService';
import { generateWorkoutPostData, generateMealPostData, generateAIStoryCaption, enhanceCaptionWithAI } from '../lib/postGeneratorService';

// The 12 post types requested
const postTypes = [
  { id: 'workout', label: 'Workout', icon: Dumbbell, color: 'text-acid-green', bg: 'bg-acid-green/10', border: 'border-acid-green/20' },
  { id: 'meal', label: 'Meal', icon: BookOpen, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  { id: 'progress', label: 'Progress', icon: Activity, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
  { id: 'health', label: 'Health Post', icon: AlignLeft, color: 'text-foreground', bg: 'bg-surface', border: 'border-card-border' },
  { id: 'photo', label: 'Photo', icon: ImageIcon, color: 'text-pink-400', bg: 'bg-pink-400/10', border: 'border-pink-400/20' },
  { id: 'video', label: 'Video', icon: Video, color: 'text-indigo-400', bg: 'bg-indigo-400/10', border: 'border-indigo-400/20' },
  { id: 'ai_story', label: 'AI Story', icon: Sparkles, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
  { id: 'achievement', label: 'Achievement', icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' },
  { id: 'challenge', label: 'Challenge', icon: Target, color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20' },
  { id: 'event', label: 'Event', icon: Calendar, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
  { id: 'club_post', label: 'Club Post', icon: Users, color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/20' },
  { id: 'weekly_report', label: 'Weekly Report', icon: BarChart2, color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20' }
];

const visibilityOptions = [
  { id: 'public', label: 'Public', icon: Globe },
  { id: 'friends', label: 'Friends Only', icon: Users },
  { id: 'club', label: 'Club Only', icon: Shield },
  { id: 'private', label: 'Only Me', icon: Lock }
];

export default function CreatePostModal({ currentUserId, onClose, onNotification }) {
  const [step, setStep] = useState(1); // 1: Select Type, 2: Edit Content
  const [selectedType, setSelectedType] = useState(null);
  const [caption, setCaption] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [isPublishing, setIsPublishing] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // Mock pre-filled data for the specific post type (In Phase 2, this will come from postGeneratorService)
  const [postData, setPostData] = useState(null);

  const handleSelectType = async (type) => {
    setSelectedType(type);
    
    // Auto-generate data based on type
    if (type.id === 'workout') {
      const data = await generateWorkoutPostData(currentUserId);
      if (data) setPostData(data);
      else setPostData({ weight: 0, sets: 0, reps: 0, duration: 0, mood: 'Neutral', exercises: [] }); // Fallback
    } else if (type.id === 'meal') {
      const data = await generateMealPostData(currentUserId);
      if (data) setPostData(data);
      else setPostData({ name: 'Meal', calories: 0, protein: 0, carbs: 0, fat: 0 }); // Fallback
    } else if (type.id === 'ai_story') {
      const story = await generateAIStoryCaption(currentUserId);
      setCaption(story);
    }

    setStep(2);
  };

  const handleAIRewrite = async () => {
    setAiLoading(true);
    const newCaption = await enhanceCaptionWithAI(caption, postData);
    setCaption(newCaption);
    setAiLoading(false);
  };

  const handlePublish = async () => {
    if (!caption.trim() && !postData) return;
    setIsPublishing(true);
    try {
      await publishActivity({
        userId: currentUserId,
        type: selectedType.id,
        title: `${selectedType.label} Update`,
        content: caption,
        data: postData,
        visibility: visibility,
        timestamp: Date.now()
      });
      if (onNotification) onNotification('Post published successfully! 🎉');
      onClose();
    } catch (err) {
      console.error(err);
      if (onNotification) onNotification('Failed to publish post.');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-background/80 backdrop-blur-sm">
      
      {/* Mobile drag handle area & click outside to close */}
      <div className="absolute inset-0 z-0" onClick={onClose} />

      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full md:max-w-2xl bg-surface md:bg-surface/90 md:backdrop-blur-xl border-t md:border border-card-border rounded-t-3xl md:rounded-3xl shadow-2xl relative z-10 flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-card-border/50 bg-background/50 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            {step === 2 && (
              <button onClick={() => setStep(1)} className="p-1.5 rounded-full hover:bg-surface transition-colors">
                <ChevronLeft className="w-5 h-5 text-foreground" />
              </button>
            )}
            <h2 className="text-sm font-black uppercase tracking-widest text-foreground">
              {step === 1 ? 'Create Post' : `New ${selectedType?.label}`}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full bg-surface hover:bg-card-border transition-colors">
            <X className="w-4 h-4 text-muted" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-none">
          
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 pb-8"
              >
                {postTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => handleSelectType(type)}
                    className="flex flex-col items-center justify-center p-6 rounded-2xl glass border border-card-border hover:border-acid-green/40 hover:bg-surface/50 transition-all group"
                  >
                    <div className={`w-12 h-12 rounded-full ${type.bg} ${type.border} border flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <type.icon className={`w-6 h-6 ${type.color}`} />
                    </div>
                    <span className="text-xs font-black text-foreground">{type.label}</span>
                  </button>
                ))}
              </motion.div>
            )}

            {step === 2 && selectedType && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6 pb-20 md:pb-0"
              >
                {/* Auto-generated Card Preview (Mock) */}
                {postData && (
                  <div className={`p-4 rounded-2xl border ${selectedType.border} ${selectedType.bg} glass`}>
                    <div className="flex items-center gap-2 mb-3">
                      <selectedType.icon className={`w-4 h-4 ${selectedType.color}`} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-foreground">{selectedType.label} Data Attached</span>
                    </div>
                    {selectedType.id === 'workout' && (
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 rounded bg-surface/80 text-[10px] font-bold text-foreground">{postData.duration} mins</span>
                        <span className="px-2 py-1 rounded bg-surface/80 text-[10px] font-bold text-foreground">{postData.exercises.length} Exercises</span>
                        <span className="px-2 py-1 rounded bg-surface/80 text-[10px] font-bold text-foreground">Feeling {postData.mood}</span>
                      </div>
                    )}
                    {selectedType.id === 'meal' && (
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 rounded bg-surface/80 text-[10px] font-bold text-foreground">{postData.name}</span>
                        <span className="px-2 py-1 rounded bg-surface/80 text-[10px] font-bold text-foreground">{postData.calories} kcal</span>
                        <span className="px-2 py-1 rounded bg-surface/80 text-[10px] font-bold text-foreground">{postData.protein}g P</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Caption Input */}
                <div className="relative">
                  <textarea
                    placeholder={`What's on your mind? Share your ${selectedType.label.toLowerCase()}...`}
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    rows={4}
                    className="w-full bg-transparent text-sm md:text-base font-medium text-foreground placeholder-muted resize-none focus:outline-none"
                    autoFocus
                  />
                  <div className="absolute -bottom-2 right-0 flex gap-2">
                    <button 
                      onClick={handleAIRewrite}
                      disabled={aiLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold uppercase tracking-widest hover:bg-purple-500/20 transition-colors disabled:opacity-50"
                    >
                      {aiLoading ? (
                        <div className="w-3 h-3 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Sparkles className="w-3.5 h-3.5" />
                      )}
                      AI Magic
                    </button>
                  </div>
                </div>

                {/* Toolbar */}
                <div className="border-t border-card-border/50 pt-4 flex flex-wrap items-center gap-4">
                  <button className="flex flex-col items-center gap-1 text-muted hover:text-acid-green transition-colors">
                    <div className="p-2 rounded-full bg-surface border border-card-border"><ImageIcon className="w-4 h-4" /></div>
                    <span className="text-[8px] font-bold uppercase">Media</span>
                  </button>
                  <button className="flex flex-col items-center gap-1 text-muted hover:text-blue-400 transition-colors">
                    <div className="p-2 rounded-full bg-surface border border-card-border"><Tag className="w-4 h-4" /></div>
                    <span className="text-[8px] font-bold uppercase">Tag</span>
                  </button>
                  <button className="flex flex-col items-center gap-1 text-muted hover:text-emerald-400 transition-colors">
                    <div className="p-2 rounded-full bg-surface border border-card-border"><MapPin className="w-4 h-4" /></div>
                    <span className="text-[8px] font-bold uppercase">Location</span>
                  </button>

                  <div className="flex-1" />

                  {/* Visibility Dropdown */}
                  <div className="relative group">
                    <select
                      value={visibility}
                      onChange={(e) => setVisibility(e.target.value)}
                      className="appearance-none bg-surface border border-card-border rounded-xl pl-8 pr-8 py-2 text-[10px] font-bold uppercase tracking-widest text-foreground focus:outline-none focus:border-acid-green cursor-pointer"
                    >
                      {visibilityOptions.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.label}</option>
                      ))}
                    </select>
                    <Globe className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted pointer-events-none" />
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Footer Actions (Step 2) */}
        {step === 2 && (
          <div className="p-4 border-t border-card-border/50 bg-background/50 backdrop-blur-md flex justify-between items-center shrink-0">
            <button className="text-[10px] font-bold uppercase tracking-widest text-muted hover:text-foreground px-4 py-2">
              Save Draft
            </button>
            <button
              onClick={handlePublish}
              disabled={isPublishing || (!caption.trim() && !postData)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-acid-green text-accent-foreground text-[11px] font-black uppercase tracking-widest disabled:opacity-50 hover:bg-acid-green/90 transition-colors"
            >
              {isPublishing ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        )}

      </motion.div>
    </div>
  );
}
