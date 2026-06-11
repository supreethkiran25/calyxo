import React from 'react';

function LaunchScreen({ isLoading }) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 transition-opacity duration-500 ease-in-out">
      <div className="relative flex items-center justify-center w-24 h-24 mb-6">
        {/* Pulsing ring */}
        <div className="absolute w-20 h-20 border-3 border-neon-green rounded-full shadow-[0_0_20px_#39ff14,inset_0_0_10px_#39ff14] animate-ping opacity-75"></div>
        <div className="absolute w-20 h-20 border-3 border-neon-green rounded-full shadow-[0_0_20px_#39ff14,inset_0_0_10px_#39ff14] pulse-neon"></div>
        {/* Center dot */}
        <div className="w-3.5 h-3.5 bg-neon-green rounded-full shadow-[0_0_12px_#39ff14]"></div>
      </div>
      <h1 className="font-display text-3xl font-extrabold tracking-widest text-white mb-2 uppercase select-none">
        Calyxo
      </h1>
      <p className="text-gray-400 text-xs tracking-widest mb-8 uppercase select-none font-medium">
        AI Diet & Workout Concierge
      </p>
      <div className="w-36 h-[3px] bg-gray-900 rounded-full overflow-hidden relative">
        <div className="absolute h-full w-1/2 bg-neon-green rounded-full shadow-[0_0_8px_#39ff14] animate-[shimmer_2s_infinite_linear]"></div>
      </div>
      
      <style>{`
        @keyframes shimmer {
          0% { left: -50%; }
          100% { left: 100%; }
        }
      `}</style>
    </div>
  );
}

export default LaunchScreen;
