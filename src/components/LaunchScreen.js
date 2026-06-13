"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';

export default function LaunchScreen({ isLoading }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setVisible(false), 400);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          style={{ background: '#0d0d0d' }}
        >
          {/* Subtle background glow */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 60% 50% at 50% 60%, rgba(181,242,61,0.06) 0%, transparent 70%)'
            }}
          />

          <div className="flex flex-col items-center relative z-10">
            {/* Animated Logo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="mb-6"
            >
              <motion.div
                animate={{
                  filter: [
                    "drop-shadow(0 0 12px rgba(181,242,61,0.3))",
                    "drop-shadow(0 0 28px rgba(181,242,61,0.6))",
                    "drop-shadow(0 0 12px rgba(181,242,61,0.3))"
                  ]
                }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <Logo className="w-20 h-20" />
              </motion.div>
            </motion.div>

            {/* Brand name */}
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '28px',
                fontWeight: 900,
                letterSpacing: '0.25em',
                color: '#f5f5f5',
                textTransform: 'uppercase',
                margin: 0,
                marginBottom: '8px'
              }}
            >
              calyxo
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.45 }}
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '11px',
                letterSpacing: '0.18em',
                color: '#888888',
                textTransform: 'uppercase',
                fontWeight: 500,
                marginBottom: '40px'
              }}
            >
              Track Today. Transform Tomorrow.
            </motion.p>

            {/* Loading bar */}
            <div style={{ width: '120px', height: '2px', background: '#2a2a2a', borderRadius: '1px', overflow: 'hidden' }}>
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '200%' }}
                transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
                style={{
                  height: '100%',
                  width: '50%',
                  background: 'linear-gradient(90deg, transparent, #b5f23d, transparent)',
                  borderRadius: '1px'
                }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
export { LaunchScreen };
