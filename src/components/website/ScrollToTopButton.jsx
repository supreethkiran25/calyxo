import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
      setIsVisible(scrollY > 200);
    };

    window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    document.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    return () => {
      window.removeEventListener('scroll', handleScroll, { capture: true });
      document.removeEventListener('scroll', handleScroll, { capture: true });
    };
  }, []);

  const scrollToTop = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    // Multi-target universal scroll to top
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    } catch {
      window.scrollTo(0, 0);
    }
    
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
      try {
        document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      } catch {}
    }
    
    if (document.body) {
      document.body.scrollTop = 0;
      try {
        document.body.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      } catch {}
    }

    const root = document.getElementById('root');
    if (root) {
      root.scrollTop = 0;
    }
  };

  if (!mounted || typeof document === 'undefined') {
    return null;
  }

  const buttonContent = (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 16 }}
          whileHover={{ scale: 1.12, y: -2 }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-[9999] p-3.5 sm:p-4 rounded-full bg-[#121214]/95 hover:bg-black text-white border border-white/20 hover:border-[#CCFF00] backdrop-blur-2xl shadow-[0_10px_35px_rgba(0,0,0,0.9)] cursor-pointer flex items-center justify-center group transition-all select-none pointer-events-auto"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5 text-gray-200 group-hover:text-[#CCFF00] transition-colors" />
        </motion.button>
      )}
    </AnimatePresence>
  );

  return createPortal(buttonContent, document.body);
}
