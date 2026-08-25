import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          whileHover={{ scale: 1.08, y: -2 }}
          whileTap={{ scale: 0.92 }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 p-3.5 rounded-full bg-[#131317]/90 hover:bg-[#1f1f23] text-white border border-white/20 hover:border-[#CCFF00]/60 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] cursor-pointer flex items-center justify-center group transition-colors"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5 text-gray-300 group-hover:text-[#CCFF00] transition-colors" />
          <span className="sr-only">Go to top</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
