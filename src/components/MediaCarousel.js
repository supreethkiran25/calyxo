"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Maximize2, PlayCircle } from 'lucide-react';
import FullscreenMediaViewer from './FullscreenMediaViewer';

export default function MediaCarousel({ mediaUrls = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const scrollContainerRef = useRef(null);

  // Sync scroll position with current index on mobile native scrolling
  const handleScroll = (e) => {
    if (!scrollContainerRef.current) return;
    const scrollLeft = e.target.scrollLeft;
    const width = e.target.clientWidth;
    const newIndex = Math.round(scrollLeft / width);
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < mediaUrls.length) {
      setCurrentIndex(newIndex);
    }
  };

  const scrollTo = (index) => {
    if (!scrollContainerRef.current) return;
    const width = scrollContainerRef.current.clientWidth;
    scrollContainerRef.current.scrollTo({ left: width * index, behavior: 'smooth' });
    setCurrentIndex(index);
  };

  const isVideo = (url) => {
    if (!url) return false;
    return url.includes('video') || url.endsWith('.mp4') || url.endsWith('.webm') || url.startsWith('data:video');
  };

  if (!mediaUrls || mediaUrls.length === 0) return null;

  // Single media item doesn't need carousel controls
  if (mediaUrls.length === 1) {
    const url = mediaUrls[0];
    return (
      <div className="relative w-full aspect-[4/5] sm:aspect-square bg-surface border border-card-border overflow-hidden group rounded-xl">
        {isVideo(url) ? (
          <video 
            src={url} 
            controls 
            className="w-full h-full object-cover"
            preload="metadata"
          />
        ) : (
          <img 
            src={url} 
            alt="Post media" 
            className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-500" 
            onClick={() => setIsFullscreen(true)}
          />
        )}
        {!isVideo(url) && (
          <button 
            onClick={() => setIsFullscreen(true)}
            className="absolute top-3 right-3 p-2 rounded-full bg-black/40 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Maximize2 className="w-4 h-4 text-white" />
          </button>
        )}
        
        {isFullscreen && (
          <FullscreenMediaViewer 
            mediaUrls={mediaUrls} 
            initialIndex={0} 
            onClose={() => setIsFullscreen(false)} 
          />
        )}
      </div>
    );
  }

  // Multi-media carousel
  return (
    <div className="relative w-full aspect-[4/5] sm:aspect-square bg-surface border border-card-border overflow-hidden group rounded-xl">
      
      {/* Scrollable Container (Mobile native swipe, hidden scrollbar) */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="w-full h-full flex overflow-x-auto snap-x snap-mandatory scrollbar-none"
      >
        {mediaUrls.map((url, i) => (
          <div key={i} className="w-full h-full shrink-0 snap-center relative">
            {isVideo(url) ? (
              <video 
                src={url} 
                controls 
                className="w-full h-full object-cover"
                preload={Math.abs(currentIndex - i) <= 1 ? "metadata" : "none"} // Lazy load off-screen videos
              />
            ) : (
              <img 
                src={url} 
                alt={`Media ${i + 1}`} 
                className="w-full h-full object-cover cursor-pointer" 
                onClick={() => setIsFullscreen(true)}
                loading={i === 0 ? "eager" : "lazy"} // Lazy load non-initial images
              />
            )}
          </div>
        ))}
      </div>

      {/* Desktop Navigation Arrows */}
      {currentIndex > 0 && (
        <button 
          onClick={(e) => { e.stopPropagation(); scrollTo(currentIndex - 1); }}
          className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors backdrop-blur-md opacity-0 group-hover:opacity-100"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
      )}
      {currentIndex < mediaUrls.length - 1 && (
        <button 
          onClick={(e) => { e.stopPropagation(); scrollTo(currentIndex + 1); }}
          className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors backdrop-blur-md opacity-0 group-hover:opacity-100"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
      )}

      {/* Expand Icon (Top Right) */}
      <button 
        onClick={() => setIsFullscreen(true)}
        className="absolute top-3 right-3 p-2 rounded-full bg-black/40 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
      >
        <Maximize2 className="w-4 h-4 text-white" />
      </button>

      {/* Pagination Dots (Bottom) */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none">
        {mediaUrls.map((_, i) => (
          <div 
            key={i} 
            className={`transition-all duration-300 rounded-full shadow-sm ${
              i === currentIndex ? 'w-4 h-1.5 bg-acid-green' : 'w-1.5 h-1.5 bg-white/50 backdrop-blur-md'
            }`} 
          />
        ))}
      </div>

      {/* Fullscreen Overlay */}
      {isFullscreen && (
        <FullscreenMediaViewer 
          mediaUrls={mediaUrls} 
          initialIndex={currentIndex} 
          onClose={() => setIsFullscreen(false)} 
        />
      )}
    </div>
  );
}
