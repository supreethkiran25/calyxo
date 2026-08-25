import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Menu, X, Sparkles, Smartphone, Download } from 'lucide-react';
import Logo from '../Logo';
import { useStore } from '../../store/useStore';

export default function WebNavbar({ onOpenAuth, onOpenBetaModal, onNavigateDashboard }) {
  const user = useStore(state => state.user);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Overview', href: '#overview' },
    { label: 'Pillars', href: '#capabilities' },
    { label: 'Experience', href: '#showcase' },
    { label: 'Ecosystem', href: '#ecosystem' },
    { label: 'Compare', href: '#compare' },
    { label: 'Craft', href: '#architecture' },
  ];

  const handleLinkClick = (href) => {
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      const yOffset = -90;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* ── Desktop & Tablet Floating Fluid Island Header ── */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 pt-4 pointer-events-none transition-all duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between pointer-events-auto">
          
          {/* Brand Logo & Identifier */}
          <div 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-2 rounded-2xl bg-black/60 backdrop-blur-2xl border border-white/10 shadow-2xl hover:border-emerald-500/40 transition-all cursor-pointer group"
          >
            <Logo className="w-6 h-6 sm:w-7 sm:h-7 text-[#00F0FF] group-hover:scale-105 transition-transform" glow={true} />
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-black text-white tracking-widest leading-none">
                CALYXO
              </span>
              <span className="text-[8px] font-mono font-bold text-emerald-400 tracking-wider hidden sm:block">
                HEALTH OS
              </span>
            </div>
          </div>

          {/* Center Navigation Links (Floating Glass Pill) */}
          <nav className="hidden md:flex items-center gap-1 p-1.5 rounded-full bg-black/60 backdrop-blur-2xl border border-white/10 shadow-2xl">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleLinkClick(link.href)}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer border-none bg-transparent"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right Action Trigger Buttons */}
          <div className="flex items-center gap-2">
            {user ? (
              <button
                onClick={onNavigateDashboard}
                className="px-4 py-2 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/10 active:scale-95"
              >
                <span>Dashboard</span>
                <div className="w-5 h-5 rounded-full bg-emerald-500/30 flex items-center justify-center">
                  <ArrowRight className="w-3 h-3 text-emerald-300" />
                </div>
              </button>
            ) : (
              <>
                <button
                  onClick={() => onOpenAuth('login')}
                  className="hidden sm:inline-flex px-3.5 py-2 rounded-full text-xs font-bold uppercase tracking-wider text-gray-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer border-none bg-transparent"
                >
                  Login
                </button>
                <button
                  onClick={() => onOpenBetaModal()}
                  className="px-4 py-2 rounded-full bg-white text-black hover:bg-emerald-400 hover:text-black transition-all duration-300 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xl shadow-white/10 active:scale-95 border-none group"
                >
                  <span>Get App</span>
                  <div className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                    <Download className="w-3 h-3 text-current" />
                  </div>
                </button>
              </>
            )}

            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-2xl bg-black/60 backdrop-blur-2xl border border-white/10 text-white cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Full-Screen Morphing Overlay Menu ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-0 z-40 bg-black/95 backdrop-blur-3xl p-6 pt-24 flex flex-col justify-between md:hidden"
          >
            <div className="space-y-4">
              <div className="text-[10px] font-mono uppercase font-bold text-emerald-400 tracking-widest pb-2 border-b border-white/10">
                Navigation
              </div>
              <div className="flex flex-col space-y-2">
                {navLinks.map((link, idx) => (
                  <motion.button
                    key={link.label}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 + 0.1 }}
                    onClick={() => handleLinkClick(link.href)}
                    className="text-left text-xl font-bold text-gray-200 hover:text-emerald-400 py-2 border-none bg-transparent cursor-pointer transition-colors"
                  >
                    {link.label}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-6 border-t border-white/10">
              {user ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigateDashboard();
                  }}
                  className="w-full py-3.5 rounded-2xl bg-emerald-500 text-black font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer border-none shadow-lg shadow-emerald-500/20"
                >
                  <span>Open Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuth('login');
                    }}
                    className="py-3 rounded-xl bg-white/10 border border-white/15 text-white font-bold text-xs uppercase tracking-wider cursor-pointer"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenBetaModal();
                    }}
                    className="py-3 rounded-xl bg-emerald-500 text-black font-black text-xs uppercase tracking-wider cursor-pointer border-none shadow-md shadow-emerald-500/20"
                  >
                    Get App
                  </button>
                </div>
              )}

              <p className="text-[10px] text-center text-gray-500 font-mono pt-2">
                CALYXO HEALTH OS · V1.0.0
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
