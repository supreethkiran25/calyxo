import React from 'react';
import { motion } from 'framer-motion';
import { X, ArrowRight, Smartphone } from 'lucide-react';
import Logo from '../Logo';
import { AppStoreBadge, GooglePlayBadge } from './StoreBadges';

export default function BetaAccessModal({ isOpen, onClose, onOpenAuth }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-[#0c0c10] border border-white/15 shadow-2xl relative space-y-6"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer border-none"
          aria-label="Close Modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with Real Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center">
            <Logo className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="brand-name text-base text-white tracking-wider">CALYXO</span>
            <span className="text-[11px] block text-[#8E8E93] font-mono">Mobile App Download</span>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl sm:text-2xl font-bold text-white font-outfit">
            Get Calyxo for your device
          </h3>
          <p className="text-xs text-[#8E8E93] leading-relaxed">
            Experience the complete health operating system on iOS and Android with Live Activities, Apple Watch integration, and biometric telemetry.
          </p>
        </div>

        {/* Official Store Badges Stack */}
        <div className="space-y-3 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <AppStoreBadge className="w-full justify-center" />
            <GooglePlayBadge className="w-full justify-center" />
          </div>

          {/* Web App Instant Launch */}
          <button
            onClick={() => {
              onClose();
              if (onOpenAuth) onOpenAuth('signup');
            }}
            className="w-full py-3.5 px-5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white text-xs font-semibold tracking-wider flex items-center justify-between transition-all active:scale-98 cursor-pointer mt-3"
          >
            <span>Launch Web Companion in Browser</span>
            <ArrowRight className="w-4 h-4 text-[#CCFF00]" />
          </button>
        </div>

        <div className="pt-2 text-center text-[10px] font-mono text-[#8E8E93]">
          Automatic store redirection for iOS & Android devices.
        </div>
      </motion.div>
    </div>
  );
}
