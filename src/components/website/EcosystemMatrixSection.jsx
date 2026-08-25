import React from 'react';
import { motion } from 'framer-motion';
import { 
  Smartphone, Watch, Activity, LayoutGrid, 
  Bluetooth, Sparkles, CheckCircle2, Zap 
} from 'lucide-react';

export default function EcosystemMatrixSection() {
  const hardwareIntegrations = [
    {
      icon: Smartphone,
      color: '#00F0FF',
      name: 'Dynamic Island & Live Activities',
      tag: 'iOS 16.0+ ActivityKit',
      desc: 'Glanceable live telemetry directly inside the iPhone Dynamic Island and Lock Screen. Rest timer countdowns and active exercise names update without opening the app.',
      badge: 'Swift ActivityKit Native',
      details: ['Dynamic Island snug bounds', 'Rest countdown & meditation mode', 'Live exercise set telemetry']
    },
    {
      icon: Watch,
      color: '#10B981',
      name: 'Apple Watch & Wearables',
      tag: 'watchOS Companion',
      desc: 'Standalone wearable connectivity streaming heart rate pulse telemetry and triggering haptic wrist alerts as your workout rest timer concludes.',
      badge: 'WatchConnectivity Native',
      details: ['Background HR pulse sync', 'Haptic rest vibrations', 'Calorie burn telemetry']
    },
    {
      icon: LayoutGrid,
      color: '#F59E0B',
      name: 'Home Screen Widgets',
      tag: 'WidgetKit & Android Widgets',
      desc: 'Live 4-ring health widgets displaying your daily calories, step target, hydration fluid level, and streak directly on your home screen.',
      badge: 'Real-time Widget Data',
      details: ['4-Pillar health rings', '14-Day streak counter', 'Quick log launcher shortcuts']
    },
    {
      icon: Bluetooth,
      color: '#8B5CF6',
      name: 'Bluetooth BLE Pulse Sensors',
      tag: 'Direct BLE Bridge',
      desc: 'Direct pairing with external chest straps and heart rate armbands for real-time aerobic zone calculations and precision recovery scoring.',
      badge: 'BLE GATT Standard',
      details: ['Real-time BPM pulse', 'Cardiac zone distribution', 'Zero-latency live stream']
    }
  ];

  return (
    <section id="ecosystem" className="relative py-28 sm:py-36 px-4 sm:px-6 bg-[#030305] overflow-hidden border-t border-white/5">
      
      {/* Background Radiance */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-cyan-500/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-16 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-[10px] font-mono uppercase tracking-widest">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>04 · Connected Hardware</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.08]">
            The Connected <br />
            <span className="bg-gradient-to-r from-cyan-400 via-emerald-400 to-purple-400 bg-clip-text text-transparent">
              Health Ecosystem.
            </span>
          </h2>

          <p className="text-sm sm:text-lg text-gray-300 font-medium leading-relaxed max-w-2xl mx-auto">
            From your wrist to your Dynamic Island to your home screen — Calyxo operates seamlessly across all your devices.
          </p>
        </div>

        {/* 4-Card Hardware Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {hardwareIntegrations.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx}
                className="p-2 rounded-3xl bg-white/[0.03] border border-white/10 shadow-2xl flex flex-col justify-between group hover:border-white/20 transition-all duration-300"
              >
                <div className="p-6 sm:p-8 rounded-[1.25rem] bg-[#0a0a0e] border border-white/5 flex-1 flex flex-col justify-between space-y-6">
                  
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div 
                        className="w-12 h-12 rounded-2xl flex items-center justify-center border shadow-lg group-hover:scale-105 transition-transform"
                        style={{
                          backgroundColor: `${item.color}15`,
                          borderColor: `${item.color}35`,
                          color: item.color
                        }}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase font-bold text-gray-400 tracking-wider block">
                          {item.tag}
                        </span>
                        <h3 className="text-lg sm:text-xl font-black text-white">
                          {item.name}
                        </h3>
                      </div>
                    </div>

                    <span 
                      className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border shrink-0 hidden sm:inline-block"
                      style={{
                        backgroundColor: `${item.color}10`,
                        borderColor: `${item.color}30`,
                        color: item.color
                      }}
                    >
                      {item.badge}
                    </span>
                  </div>

                  <p className="text-sm text-gray-300 leading-relaxed">
                    {item.desc}
                  </p>

                  <div className="grid grid-cols-1 gap-2 pt-2 border-t border-white/5">
                    {item.details.map((detail, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs font-mono text-gray-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>

                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
