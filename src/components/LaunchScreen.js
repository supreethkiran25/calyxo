import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LaunchScreen({ isLoading }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setVisible(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden select-none bg-black"
        >
          {/* Full-bleed Edge-to-Edge Cinematic Splash Artwork */}
          <img 
            src="/splash.png" 
            alt="Calyxo Splash" 
            className="w-full h-full object-cover object-center pointer-events-none"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export { LaunchScreen };
