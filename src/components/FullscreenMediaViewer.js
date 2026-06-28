"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function FullscreenMediaViewer({ mediaUrls, initialIndex, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex || 0);

  const handleNext = (e) => {
    e.stopPropagation();
    if (currentIndex < mediaUrls.length - 1) setCurrentIndex(prev => prev + 1);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  // Prevent drag-to-close on mobile, instead we rely on the close button
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl">
      
      {/* Header Controls */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/50 to-transparent">
        <span className="text-white text-xs font-bold tracking-widest uppercase">
          {currentIndex + 1} / {mediaUrls.length}
        </span>
        <button 
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-md"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden" onClick={onClose}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full h-full flex items-center justify-center max-w-5xl mx-auto p-4 md:p-12"
            onClick={(e) => e.stopPropagation()} // Prevent close on clicking media
          >
            {mediaUrls[currentIndex]?.includes('video') || mediaUrls[currentIndex]?.endsWith('mp4') || mediaUrls[currentIndex]?.endsWith('webm') || mediaUrls[currentIndex]?.startsWith('data:video') ? (
              <video 
                src={mediaUrls[currentIndex]} 
                controls 
                autoPlay 
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" 
              />
            ) : (
              <img 
                src={mediaUrls[currentIndex]} 
                alt="fullscreen media" 
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl cursor-zoom-in" 
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows (Desktop) */}
      {currentIndex > 0 && (
        <button 
          onClick={handlePrev}
          className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-md z-10"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
      )}
      {currentIndex < mediaUrls.length - 1 && (
        <button 
          onClick={handleNext}
          className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-md z-10"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      )}

    </div>
  );
}
