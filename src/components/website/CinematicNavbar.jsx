import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight, Download } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import Logo from '../Logo';

export default function CinematicNavbar({ onOpenAuth, onOpenBetaModal, onNavigateDashboard }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useStore(state => state.user);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Overview', path: '/' },
    { label: 'Ecosystem', path: '/ecosystem' },
    { label: 'Experience', path: '/experience' },
    { label: 'Philosophy', path: '/philosophy' },
    { label: 'Vision', path: '/vision' },
  ];

  const handleNavClick = (path) => {
    setMobileOpen(false);
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navContent = (
    <>
      {/* Permanent Fixed Header - Outside Transformed DOM via Portal */}
      <header className="fixed top-0 left-0 right-0 z-[100] transition-all duration-300 px-4 sm:px-8 py-3.5 bg-[#020203]/95 backdrop-blur-2xl border-b border-white/[0.12] shadow-2xl">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          
          {/* Brand Mark with Official Logo */}
          <div 
            onClick={() => handleNavClick('/')}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Logo className="w-5 h-5 text-white" />
            </div>
            <span className="brand-name text-base sm:text-lg text-white font-black tracking-[0.16em]">
              CALYXO
            </span>
          </div>

          {/* Center Sliding Nav Links */}
          <nav className="hidden md:flex items-center space-x-1 font-sans relative p-1 rounded-full bg-white/[0.04] border border-white/10">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.label}
                  onClick={() => handleNavClick(item.path)}
                  className={`relative px-4 py-1.5 rounded-full text-xs font-medium tracking-tight transition-colors cursor-pointer bg-transparent border-none ${
                    isActive ? 'text-black font-bold' : 'text-[#8E8E93] hover:text-white'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-pill"
                      className="absolute inset-0 bg-[#CCFF00] rounded-full z-0 shadow-[0_0_20px_rgba(204,255,0,0.35)]"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Actions: Clean & Balanced */}
          <div className="flex items-center space-x-3">
            {user ? (
              <button
                onClick={onNavigateDashboard}
                className="px-5 py-2 rounded-full bg-white text-black text-xs font-bold tracking-tight hover:bg-gray-200 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-md border-none"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => onOpenAuth('signup')}
                  className="hidden sm:block px-4 py-2 text-xs font-mono text-gray-300 hover:text-white transition-colors cursor-pointer bg-transparent border-none"
                >
                  Launch Web
                </button>

                <button
                  onClick={onOpenBetaModal}
                  className="px-4 py-2 rounded-full bg-white text-black text-xs font-bold font-sans tracking-tight hover:bg-gray-100 transition-all cursor-pointer flex items-center gap-2 active:scale-95 shadow-md border-none"
                >
                  <Download className="w-3.5 h-3.5 text-black" />
                  <span>Get App</span>
                </button>
              </>
            )}

            {/* Mobile Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-[#8E8E93] hover:text-white cursor-pointer bg-transparent border-none ml-1"
              aria-label="Toggle Menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Glass Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="fixed inset-0 z-[110] bg-black/95 px-8 pt-28 pb-12 flex flex-col justify-between md:hidden"
          >
            <div className="space-y-8">
              <div 
                onClick={() => handleNavClick('/')}
                className="flex items-center gap-3 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center">
                  <Logo className="w-5 h-5 text-white" />
                </div>
                <span className="brand-name text-base text-white tracking-widest">CALYXO</span>
              </div>

              <div className="flex flex-col space-y-4">
                {navItems.map((item, idx) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <motion.button
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * idx, duration: 0.3 }}
                      key={item.label}
                      onClick={() => handleNavClick(item.path)}
                      className={`text-left text-2xl font-outfit tracking-tight transition-colors bg-transparent border-none p-0 cursor-pointer flex items-center justify-between ${
                        isActive ? 'text-[#CCFF00] font-bold' : 'text-[#8E8E93] hover:text-white font-light'
                      }`}
                    >
                      <span>{item.label}</span>
                      {isActive && <span className="w-2 h-2 rounded-full bg-[#CCFF00]" />}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="space-y-3 pt-6 border-t border-white/10 flex flex-col items-center">
              <button
                onClick={() => {
                  setMobileOpen(false);
                  onOpenBetaModal();
                }}
                className="w-full py-4 rounded-2xl bg-white text-black font-semibold text-sm flex items-center justify-center gap-2 shadow-xl cursor-pointer border-none"
              >
                <Download className="w-4 h-4" />
                <span>Get App for iOS & Android</span>
              </button>

              <button
                onClick={() => {
                  setMobileOpen(false);
                  onOpenAuth('signup');
                }}
                className="w-full py-4 rounded-2xl bg-white/[0.06] text-white font-medium text-sm flex items-center justify-center border border-white/10 cursor-pointer"
              >
                Launch Web App
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  if (!mounted || typeof document === 'undefined') {
    return null;
  }

  return createPortal(navContent, document.body);
}
