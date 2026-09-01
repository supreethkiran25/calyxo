import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowUp, ShieldCheck, FileText, Eye } from 'lucide-react';
import Logo from '../Logo';
import { CALYXO_APP_STORE_URL, CALYXO_PLAY_STORE_URL } from './StoreBadges';
import LegalModal from '../modals/LegalModal';

export default function WebFooter({ onOpenBetaModal }) {
  const navigate = useNavigate();
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalType, setLegalType] = useState('terms');

  const handleNav = (path) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openAppStore = () => {
    window.open(CALYXO_APP_STORE_URL, '_blank', 'noopener,noreferrer');
  };

  const openPlayStore = () => {
    window.open(CALYXO_PLAY_STORE_URL, '_blank', 'noopener,noreferrer');
  };

  const openLegal = (type) => {
    setLegalType(type);
    setLegalModalOpen(true);
  };

  return (
    <>
      <footer className="relative bg-[#020203] text-gray-400 font-sans border-t border-white/[0.06] pt-16 pb-12 px-6 sm:px-12">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* Top Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Brand Col */}
            <div className="md:col-span-5 space-y-4">
              <div 
                onClick={() => handleNav('/')}
                className="flex items-center gap-2.5 cursor-pointer group"
              >
                <Logo className="w-7 h-7 text-white" />
                <span className="brand-name text-base font-black text-white tracking-[0.16em] leading-none">
                  CALYXO
                </span>
              </div>
              <p className="text-xs text-[#8E8E93] leading-relaxed max-w-sm">
                The immersive health operating system merging automated biometrics, real-time nutrition calculations, structured workouts, and proactive AI coaching.
              </p>
              <div className="text-[10px] font-mono text-[#8E8E93] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00] opacity-80" />
                <span>Calyxo Health Core v1.0.0 · Local-First Architecture</span>
              </div>
            </div>

            {/* Links Col 1: Pages */}
            <div className="md:col-span-2 space-y-3">
              <span className="text-[10px] font-mono uppercase font-bold text-white tracking-wider block">
                Pages
              </span>
              <ul className="space-y-2 text-xs">
                <li><button onClick={() => handleNav('/experience')} className="text-[#8E8E93] hover:text-white transition-colors cursor-pointer bg-none border-none p-0 text-left">Experience</button></li>
                <li><button onClick={() => handleNav('/ecosystem')} className="text-[#8E8E93] hover:text-white transition-colors cursor-pointer bg-none border-none p-0 text-left">Ecosystem</button></li>
                <li><button onClick={() => handleNav('/philosophy')} className="text-[#8E8E93] hover:text-white transition-colors cursor-pointer bg-none border-none p-0 text-left">Philosophy</button></li>
                <li><button onClick={() => handleNav('/vision')} className="text-[#8E8E93] hover:text-white transition-colors cursor-pointer bg-none border-none p-0 text-left">Vision Roadmap</button></li>
              </ul>
            </div>

            {/* Links Col 2: Platform */}
            <div className="md:col-span-2 space-y-3">
              <span className="text-[10px] font-mono uppercase font-bold text-white tracking-wider block">
                Platforms
              </span>
              <ul className="space-y-2 text-xs">
                <li><button onClick={openAppStore} className="text-[#8E8E93] hover:text-white transition-colors cursor-pointer bg-none border-none p-0 text-left">iOS App Store</button></li>
                <li><button onClick={openPlayStore} className="text-[#8E8E93] hover:text-white transition-colors cursor-pointer bg-none border-none p-0 text-left">Google Play Store</button></li>
                <li><button onClick={openAppStore} className="text-[#8E8E93] hover:text-white transition-colors cursor-pointer bg-none border-none p-0 text-left">watchOS App</button></li>
                <li><button onClick={openAppStore} className="text-[#8E8E93] hover:text-white transition-colors cursor-pointer bg-none border-none p-0 text-left">Dynamic Island</button></li>
              </ul>
            </div>

            {/* Links Col 3: User Info & Legal Charter */}
            <div className="md:col-span-3 space-y-3">
              <span className="text-[10px] font-mono uppercase font-bold text-white tracking-wider block">
                User Info & Legal
              </span>
              <ul className="space-y-2 text-xs">
                <li>
                  <button 
                    onClick={() => handleNav('/privacy')} 
                    className="text-[#8E8E93] hover:text-cyan-300 transition-colors cursor-pointer bg-none border-none p-0 text-left flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Privacy Policy & Data Charter</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleNav('/terms')} 
                    className="text-[#8E8E93] hover:text-[#CCFF00] transition-colors cursor-pointer bg-none border-none p-0 text-left flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#CCFF00]" />
                    <span>Terms & Conditions</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleNav('/accessibility')} 
                    className="text-[#8E8E93] hover:text-emerald-300 transition-colors cursor-pointer bg-none border-none p-0 text-left flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Accessibility Statement</span>
                  </button>
                </li>
                <li><Link to="/user/about" className="text-[#8E8E93] hover:text-white transition-colors">About Calyxo</Link></li>
                <li><Link to="/user/support" className="text-[#8E8E93] hover:text-white transition-colors">Support & Help Center</Link></li>
              </ul>
            </div>

          </div>

          {/* Bottom Bar with Back to Top */}
          <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] font-mono text-[#8E8E93]">
            <span>© {new Date().getFullYear()} Calyxo Health OS. All rights reserved.</span>
            
            <div className="flex items-center gap-6">
              <button 
                onClick={() => handleNav('/privacy')} 
                className="text-[#8E8E93] hover:text-white transition-colors cursor-pointer bg-none border-none p-0"
              >
                Encrypted Biometrics
              </button>
              <span>•</span>
              <button 
                onClick={() => handleNav('/privacy')} 
                className="text-[#8E8E93] hover:text-white transition-colors cursor-pointer bg-none border-none p-0"
              >
                Zero Third-Party Ad Tracking
              </button>
              <span>•</span>
              <button
                onClick={scrollToTop}
                className="inline-flex items-center gap-1.5 text-white hover:text-[#CCFF00] transition-colors cursor-pointer bg-transparent border-none p-0"
              >
                <span>Back to top</span>
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </footer>

      {/* Interactive In-Place Legal Modal */}
      <LegalModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        type={legalType}
      />
    </>
  );
}
