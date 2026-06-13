"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Heart, Moon, TrendingUp, Smartphone, Sparkles, CheckCircle, 
  Calendar, ChevronRight, Plus, Trash2, FileText, Award, Zap, ShieldCheck, 
  PlusCircle, RefreshCw, AlertCircle, Droplets, Info, Weight, Trophy
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { useHealthStore } from '../store/useHealthStore';

// ── SVG Chart Helpers ────────────────────────────────────────────────────────

function BarChart({ data, xKey, yKey, height = 180, color = 'var(--accent)' }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 border border-dashed border-card-border rounded-xl">
        <span className="text-xs text-muted">No historical data logs recorded yet.</span>
      </div>
    );
  }

  const padding = 30;
  const chartHeight = height - padding * 2;
  const maxVal = Math.max(...data.map(d => d[yKey] || 1)) * 1.15;
  const barWidth = 35;
  const gap = 15;
  const chartWidth = data.length * (barWidth + gap) + padding * 2;

  return (
    <div className="w-full overflow-x-auto select-none py-2 scrollbar-none">
      <svg width={Math.max(chartWidth, 400)} height={height} className="mx-auto overflow-visible">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((p, idx) => {
          const y = padding + chartHeight * (1 - p);
          return (
            <g key={idx}>
              <line x1={padding} y1={y} x2={Math.max(chartWidth, 400) - padding} y2={y} stroke="var(--card-border)" strokeDasharray="3 3" />
              <text x={padding - 5} y={y + 4} fill="var(--text-muted)" fontSize="8" fontWeight="bold" textAnchor="end">
                {Math.round(maxVal * p).toLocaleString()}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((item, idx) => {
          const x = padding + idx * (barWidth + gap) + 10;
          const val = item[yKey] || 0;
          const barHeight = (val / maxVal) * chartHeight;
          const y = padding + chartHeight - barHeight;

          return (
            <g key={idx} className="group">
              <motion.rect
                initial={{ height: 0, y: padding + chartHeight }}
                animate={{ height: barHeight, y }}
                transition={{ duration: 0.6, ease: 'easeOut', delay: idx * 0.05 }}
                x={x}
                width={barWidth}
                rx="4"
                fill={color}
                opacity="0.85"
                className="hover:opacity-100 transition-opacity cursor-pointer"
              />
              <text x={x + barWidth / 2} y={padding + chartHeight + 14} fill="var(--text-muted)" fontSize="9" fontWeight="bold" textAnchor="middle">
                {item[xKey]}
              </text>
              <text x={x + barWidth / 2} y={y - 6} fill="var(--foreground)" fontSize="8.5" fontWeight="black" textAnchor="middle" className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {val.toLocaleString()}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function LineChart({ data, xKey, yKey, height = 180, color = 'var(--accent)' }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 border border-dashed border-card-border rounded-xl">
        <span className="text-xs text-muted">No historical data logs recorded yet.</span>
      </div>
    );
  }

  const padding = 35;
  const chartHeight = height - padding * 2;
  const maxVal = Math.max(...data.map(d => d[yKey] || 1)) * 1.1;
  const minVal = Math.min(...data.map(d => d[yKey] || 0)) * 0.9;
  const valRange = maxVal - minVal || 1;
  const stepX = 55;
  const chartWidth = (data.length - 1) * stepX + padding * 2;

  // Compile points
  const points = data.map((item, idx) => {
    const x = padding + idx * stepX;
    const val = item[yKey] || 0;
    const y = padding + chartHeight - ((val - minVal) / valRange) * chartHeight;
    return { x, y, val, label: item[xKey] };
  });

  const pathD = points.reduce((acc, p, idx) => {
    return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${padding + chartHeight} L ${points[0].x} ${padding + chartHeight} Z`;

  return (
    <div className="w-full overflow-x-auto select-none py-2 scrollbar-none">
      <svg width={Math.max(chartWidth, 400)} height={height} className="mx-auto overflow-visible">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((p, idx) => {
          const y = padding + chartHeight * (1 - p);
          return (
            <g key={idx}>
              <line x1={padding} y1={y} x2={Math.max(chartWidth, 400) - padding} y2={y} stroke="var(--card-border)" strokeDasharray="3 3" />
              <text x={padding - 8} y={y + 3} fill="var(--text-muted)" fontSize="8.5" fontWeight="bold" textAnchor="end">
                {Math.round(minVal + valRange * p)}
              </text>
            </g>
          );
        })}

        {/* Shaded Area */}
        <motion.path
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          transition={{ duration: 0.8 }}
          d={areaD}
          fill={color}
        />

        {/* Path Line */}
        <motion.path
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Node Points */}
        {points.map((p, idx) => (
          <g key={idx} className="group">
            <circle cx={p.x} cy={p.y} r="5" fill="var(--card)" stroke={color} strokeWidth="2.5" />
            <circle cx={p.x} cy={p.y} r="10" fill={color} opacity="0" className="group-hover:opacity-20 cursor-pointer transition-opacity" />
            <text x={p.x} y={padding + chartHeight + 14} fill="var(--text-muted)" fontSize="9" fontWeight="bold" textAnchor="middle">
              {p.label}
            </text>
            <text x={p.x} y={p.y - 10} fill="var(--foreground)" fontSize="9" fontWeight="black" textAnchor="middle" className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {p.val}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function HealthHub({ onNotification }) {
  // Global auth / profile context
  const user = useStore(state => state.user);
  const userProfile = useStore(state => state.userProfile);
  const foodLogs = useStore(state => state.foodLogs);
  const workoutLogs = useStore(state => state.workoutLogs);
  const waterIntake = useStore(state => state.waterIntake);

  const userId = user?.uid;

  // New Zustand health store references
  const healthStore = useHealthStore();

  // Component Tab Routing State
  const [activeSubTab, setActiveSubTab] = useState('overview');

  // Goals Form State
  const [newGoalOpen, setNewGoalOpen] = useState(false);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalType, setNewGoalType] = useState('steps');
  const [newGoalTarget, setNewGoalTarget] = useState(10000);

  // Reports selection
  const [reportType, setReportType] = useState('weekly');
  const [reportRange, setReportRange] = useState('June 7 - June 13');

  // Load health data on mount
  useEffect(() => {
    if (userId) {
      healthStore.fetchHealthData(userId);
    }
  }, [userId]);

  const handleDeviceSync = async (provider) => {
    if (!userId) return;
    const metrics = await healthStore.syncDevice(
      userId, 
      provider, 
      userProfile, 
      foodLogs, 
      workoutLogs, 
      waterIntake
    );
    if (metrics && onNotification) {
      onNotification(`Successfully synced ${metrics.steps.toLocaleString()} steps from ${provider.charAt(0).toUpperCase() + provider.slice(1)}! 🏥`);
    }
  };

  const handleToggleConnection = async (provider, connectedState) => {
    if (!userId) return;
    await healthStore.toggleDevice(userId, provider, connectedState);
    const providerName = provider.charAt(0).toUpperCase() + provider.slice(1);
    if (onNotification) {
      onNotification(connectedState ? `${providerName} successfully linked.` : `${providerName} disconnected.`);
    }
  };

  const handleAddGoal = (e) => {
    e.preventDefault();
    if (!newGoalName.trim()) return;
    healthStore.addGoal(userId, {
      name: newGoalName,
      type: newGoalType,
      target: Number(newGoalTarget)
    });
    setNewGoalName('');
    setNewGoalOpen(false);
    if (onNotification) onNotification("Goal successfully created! 🎯");
  };

  const handleDeleteGoal = (goalId) => {
    if (window.confirm("Delete this health goal?")) {
      healthStore.deleteGoal(userId, goalId);
      if (onNotification) onNotification("Goal deleted.");
    }
  };

  const handleGenerateAIInsights = async () => {
    await healthStore.generateInsights(userId, userProfile, foodLogs, workoutLogs);
    if (onNotification) onNotification("AI analysis updated.");
  };

  const handleGenerateReport = async () => {
    await healthStore.generateReport(
      userId, 
      reportType, 
      reportRange, 
      userProfile, 
      foodLogs, 
      workoutLogs
    );
    if (onNotification) onNotification(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report generated!`);
  };

  const handleExportPDF = (report) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Please allow popups to export the PDF print layout.");
      return;
    }
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Calyxo Health Hub Report</title>
          <style>
            body { font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif; padding: 40px; color: #111827; background: #ffffff; line-height: 1.5; }
            .header-container { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #b5f23d; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; }
            .meta { font-size: 13px; color: #4b5563; }
            .score-grid { display: grid; grid-template-cols: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
            .score-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 18px; text-align: center; }
            .score-val { font-size: 38px; font-weight: 900; color: #4c7a00; margin-top: 5px; }
            .report-summary { background: #fbfdf7; border: 1px solid #e5f2cc; border-radius: 12px; padding: 24px; margin-bottom: 35px; }
            .report-summary h3 { margin-top: 0; font-size: 16px; color: #4c7a00; text-transform: uppercase; letter-spacing: 1px; }
            .report-summary p { font-size: 14px; color: #374151; white-space: pre-wrap; line-height: 1.6; }
            .data-table { width: 100%; border-collapse: collapse; margin-top: 20px; margin-bottom: 40px; }
            .data-table th, .data-table td { border: 1px solid #e5e7eb; padding: 12px; text-align: left; font-size: 13.5px; }
            .data-table th { background: #f3f4f6; font-weight: 700; color: #374151; }
            .footer-note { text-align: center; font-size: 11px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 40px; }
          </style>
        </head>
        <body>
          <div class="header-container">
            <div>
              <div class="logo">CALYXO HEALTH HUB</div>
              <div class="meta" style="margin-top: 5px;">Biometric Analysis System</div>
            </div>
            <div class="meta" style="text-align: right;">
              <strong>Type:</strong> ${report.reportType.toUpperCase()} REPORT <br/>
              <strong>Date:</strong> ${new Date(report.timestamp).toLocaleDateString()} <br/>
              <strong>Range:</strong> ${report.dateRange}
            </div>
          </div>
          
          <div class="score-grid">
            <div class="score-card">
              <span style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #6b7280;">Calyxo Health Score</span>
              <div class="score-val">${report.healthScore}/100</div>
            </div>
            <div class="score-card">
              <span style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #6b7280;">Average Recovery</span>
              <div class="score-val">${report.data.recoveryAvg}/100</div>
            </div>
            <div class="score-card">
              <span style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #6b7280;">Average Readiness</span>
              <div class="score-val">${report.data.readinessAvg}/100</div>
            </div>
          </div>

          <div class="report-summary">
            <h3>AI Biometric Analysis Executive Summary:</h3>
            <p>${report.summaryText.replace(/###\s/g, '').replace(/\*\*/g, '')}</p>
          </div>

          <h3>Wearable Metric Aggregates</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>Wearable Diagnostic Index</th>
                <th>Aggregated Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Daily Steps Avg</td>
                <td><strong>${report.data.stepsAvg.toLocaleString()} steps</strong></td>
              </tr>
              <tr>
                <td>Sleep Duration Avg</td>
                <td><strong>${report.data.sleepAvg} hours</strong></td>
              </tr>
              <tr>
                <td>Resting Heart Rate Avg</td>
                <td><strong>${report.data.restingHRAvg} bpm</strong></td>
              </tr>
              <tr>
                <td>Total Active Calories Burned</td>
                <td><strong>${report.data.caloriesBurnedSum.toLocaleString()} kcal</strong></td>
              </tr>
              <tr>
                <td>Nutrition Compliance Index</td>
                <td><strong>${report.data.components.nutrition}/100</strong></td>
              </tr>
              <tr>
                <td>Activity Score Component</td>
                <td><strong>${report.data.components.activity}/100</strong></td>
              </tr>
              <tr>
                <td>Consistency Logging Index</td>
                <td><strong>${report.data.components.consistency}/100</strong></td>
              </tr>
            </tbody>
          </table>

          <div class="footer-note">
            Calyxo Health Hub Report is powered by Gemini AI. Diagnostic indices are calculations based on aggregate metrics and wearable logs.
          </div>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Setup active data
  const latestMetrics = healthStore.healthMetrics[0] || {
    steps: 0, distance: 0, caloriesBurned: 0, activeMinutes: 0,
    sleepDuration: 0, sleepQuality: 0, restingHR: 62, 
    recoveryScore: 0, readinessScore: 0, healthScore: 0,
    nutritionScore: 0, activityScore: 0, consistencyScore: 0,
    readinessRecommendation: 'Moderate Workout', recoveryCategory: 'Good'
  };

  // Compile lists for step/sleep/heart metrics charts
  const stepsChartData = [...healthStore.stepsHistory].reverse().slice(-7).map(x => ({
    date: x.date.split('-').slice(1).join('/'),
    steps: x.steps
  }));
  const sleepChartData = [...healthStore.sleepHistory].reverse().slice(-7).map(x => ({
    date: x.date.split('-').slice(1).join('/'),
    duration: x.duration
  }));
  const hrChartData = [...healthStore.heartRateHistory].reverse().slice(-7).map(x => ({
    date: x.date.split('-').slice(1).join('/'),
    resting: x.resting
  }));

  const connections = healthStore.deviceConnections;

  return (
    <div className="space-y-6 w-full select-text pb-20">
      
      {/* ── Sub Header Tab Selectors ── */}
      <div className="flex overflow-x-auto gap-2 bg-surface/30 p-1.5 rounded-2xl border border-card-border scrollbar-none w-full shrink-0">
        {[
          { id: 'overview', label: 'Summary', icon: Activity },
          { id: 'steps', label: 'Steps Center', icon: TrendingUp },
          { id: 'sleep', label: 'Sleep Tracker', icon: Moon },
          { id: 'heartrate', label: 'Heart Rate', icon: Heart },
          { id: 'devices', label: 'Devices', icon: Smartphone },
          { id: 'goals', label: 'Goals', icon: Award },
          { id: 'reports', label: 'Reports', icon: FileText }
        ].map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSubTab(tab.id);
                if (tab.id === 'overview' && !healthStore.insights) {
                  handleGenerateAIInsights();
                }
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border whitespace-nowrap ${
                isActive
                  ? 'bg-acid-green text-accent-foreground border-acid-green shadow-md shadow-acid-green/10'
                  : 'text-muted border-transparent hover:bg-surface/60 hover:text-foreground'
              }`}
            >
              <TabIcon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Tab Layout Windows ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.15 }}
          className="w-full"
        >
          {/* =======================================================================
              OVERVIEW TAB
              ======================================================================= */}
          {activeSubTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Primary Scores Banner */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Score Panel 1: Proprietary Calyxo Health Score */}
                <div className="glass p-6 rounded-3xl border border-card-border bg-gradient-to-br from-acid-green/5 to-transparent flex flex-col justify-between min-h-[200px]">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] text-muted font-bold uppercase tracking-wider block">Proprietary Score</span>
                      <h4 className="text-sm font-black text-foreground uppercase tracking-widest mt-1">Calyxo Health</h4>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-acid-green/10 flex items-center justify-center border border-acid-green/20">
                      <Award className="w-4.5 h-4.5 text-acid-green" />
                    </div>
                  </div>

                  <div className="flex items-end justify-between mt-4">
                    <div>
                      <span className="value-xl text-acid-green">{latestMetrics.healthScore || 0}</span>
                      <span className="text-xs text-muted font-bold block mt-1">Overall Health Index</span>
                    </div>

                    <div className="text-right space-y-1">
                      <div className="text-[9px] text-muted font-bold">NUTRITION: <span className="text-foreground">{latestMetrics.nutritionScore || 0}</span></div>
                      <div className="text-[9px] text-muted font-bold">ACTIVITY: <span className="text-foreground">{latestMetrics.activityScore || 0}</span></div>
                      <div className="text-[9px] text-muted font-bold">RECOVERY: <span className="text-foreground">{latestMetrics.recoveryScore || 0}</span></div>
                      <div className="text-[9px] text-muted font-bold">CONSISTENCY: <span className="text-foreground">{latestMetrics.consistencyScore || 0}</span></div>
                    </div>
                  </div>
                </div>

                {/* Score Panel 2: Recovery Score */}
                <div className="glass p-6 rounded-3xl border border-card-border flex flex-col justify-between min-h-[200px]">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] text-muted font-bold uppercase tracking-wider block">Recovery capacity</span>
                      <h4 className="text-sm font-black text-foreground uppercase tracking-widest mt-1">Recovery Score</h4>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-orange/10 flex items-center justify-center border border-orange/20">
                      <Zap className="w-4.5 h-4.5 text-orange" />
                    </div>
                  </div>

                  <div className="flex items-end justify-between mt-4">
                    <div>
                      <span className="value-xl text-orange">{latestMetrics.recoveryScore || 0}</span>
                      <span className="text-xs text-muted font-bold block mt-1">Category: {latestMetrics.recoveryCategory || 'Good'}</span>
                    </div>
                    <div className="text-right space-y-0.5 text-xs text-muted font-bold">
                      <div>Resting HR: {latestMetrics.restingHR || 62} bpm</div>
                      <div>Sleep: {latestMetrics.sleepDuration || 0} hrs</div>
                    </div>
                  </div>
                </div>

                {/* Score Panel 3: Readiness Score */}
                <div className="glass p-6 rounded-3xl border border-card-border flex flex-col justify-between min-h-[200px]">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] text-muted font-bold uppercase tracking-wider block">Daily Strain Readiness</span>
                      <h4 className="text-sm font-black text-foreground uppercase tracking-widest mt-1">Readiness Score</h4>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-blue-400/10 flex items-center justify-center border border-blue-400/20">
                      <TrendingUp className="w-4.5 h-4.5 text-blue-400" />
                    </div>
                  </div>

                  <div className="flex items-end justify-between mt-4">
                    <div>
                      <span className="value-xl text-blue-400">{latestMetrics.readinessScore || 0}</span>
                      <span className="text-xs text-muted font-bold block mt-1">Recommendation:</span>
                    </div>
                    <span className="text-xs font-black uppercase tracking-wider px-2.5 py-1.5 rounded-lg bg-blue-400/10 border border-blue-400/20 text-blue-400">
                      {latestMetrics.readinessRecommendation}
                    </span>
                  </div>
                </div>

              </div>

              {/* Grid: Overview Details & Device Connection Status */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                
                {/* Wearable Quick Sync Widget */}
                <div className="glass p-6 rounded-3xl border border-card-border space-y-4 lg:col-span-1">
                  <div>
                    <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-acid-green animate-pulse" />
                      Wearable Link Panel
                    </h3>
                    <p className="text-[9px] text-muted font-bold uppercase tracking-widest mt-0.5">Control connected ecosystem streams</p>
                  </div>

                  <div className="space-y-3">
                    {['google', 'fitbit', 'garmin', 'samsung'].map((prov) => {
                      const connObj = connections.find(c => c.provider === prov);
                      const isConnected = connObj?.connected;
                      const lastSync = connObj?.lastSync || 'Never';

                      return (
                        <div key={prov} className="bg-surface/40 border border-card-border p-3.5 rounded-2xl flex flex-col gap-2.5">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-black uppercase tracking-wider text-foreground">
                              {prov === 'google' ? 'Google Health' : prov.charAt(0).toUpperCase() + prov.slice(1)}
                            </span>
                            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                              isConnected ? 'bg-acid-green/10 text-acid-green' : 'bg-surface text-muted'
                            }`}>
                              {isConnected ? 'Linked' : 'Not Connected'}
                            </span>
                          </div>

                          <div className="text-[10px] text-muted font-semibold flex justify-between items-center">
                            <span>Last Sync: {lastSync}</span>
                            {isConnected && (
                              <button
                                onClick={() => handleDeviceSync(prov)}
                                disabled={healthStore.syncing}
                                className="flex items-center gap-1 text-[9px] font-black text-acid-green uppercase hover:underline cursor-pointer border-none bg-transparent"
                              >
                                <RefreshCw className={`w-3 h-3 ${healthStore.syncing ? 'animate-spin' : ''}`} />
                                Sync
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setActiveSubTab('devices')}
                    className="w-full btn-ghost py-3 text-center text-xs font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Go to Device Settings
                  </button>
                </div>

                {/* Primary Aggregated Stats Grid */}
                <div className="glass p-6 rounded-3xl border border-card-border lg:col-span-2 space-y-6">
                  <div>
                    <h3 className="text-xs font-black text-foreground uppercase tracking-wider">Today's Aggregated Diagnostics</h3>
                    <p className="text-[9px] text-muted font-bold uppercase tracking-widest mt-0.5">Wearable metrics summary</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { label: "Today's Steps", value: (latestMetrics.steps || 0).toLocaleString(), sub: "steps", icon: "👣", color: "var(--accent)" },
                      { label: "Active Calories", value: latestMetrics.caloriesBurned || 0, sub: "kcal", icon: "🔥", color: "var(--orange-theme)" },
                      { label: "Walked Distance", value: latestMetrics.distance || 0, sub: "km", icon: "📍", color: "var(--accent)" },
                      { label: "Active Minutes", value: latestMetrics.activeMinutes || 0, sub: "mins", icon: "⏱️", color: "var(--accent)" },
                      { label: "Sleep Duration", value: latestMetrics.sleepDuration || 0, sub: "hours", icon: "🛌", color: "var(--blue-theme)" },
                      { label: "Avg Heart Rate", value: latestMetrics.heartRate || 72, sub: "bpm", icon: "💓", color: "var(--destructive)" },
                      { label: "Hydration Status", value: waterIntake || 0, sub: "ml", icon: "💧", color: "var(--blue-theme)" },
                      { label: "Weight Track", value: latestMetrics.weight || 70, sub: "kg", icon: "⚖️", color: "var(--accent)" }
                    ].map((m, idx) => (
                      <div key={idx} className="bg-surface/50 border border-card-border p-4 rounded-2xl flex flex-col justify-between h-28 hover:scale-102 transition-transform">
                        <span className="text-[9px] text-muted font-black uppercase tracking-wider block">{m.label}</span>
                        <div className="flex items-baseline gap-1 mt-2">
                          <span className="text-xl font-black text-foreground">{m.value}</span>
                          <span className="text-[10px] text-muted font-bold">{m.sub}</span>
                        </div>
                        <span className="text-sm block text-right mt-1">{m.icon}</span>
                      </div>
                    ))}
                  </div>

                  {/* AI Wellness Coach Widget */}
                  <div className="bg-acid-green/5 border border-acid-green/10 rounded-2xl p-5 space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-acid-green animate-pulse" />
                        <h4 className="text-xs font-black text-foreground uppercase tracking-wider">AI Health Insights</h4>
                      </div>
                      <button
                        onClick={handleGenerateAIInsights}
                        disabled={healthStore.loadingInsights}
                        className="text-[9px] font-black uppercase text-acid-green hover:underline cursor-pointer border-none bg-transparent"
                      >
                        {healthStore.loadingInsights ? 'Analyzing...' : 'Recalculate Insights'}
                      </button>
                    </div>

                    <div className="text-xs leading-relaxed text-foreground font-semibold">
                      {healthStore.loadingInsights ? (
                        <div className="flex items-center gap-2 text-muted py-4">
                          <RefreshCw className="w-4 h-4 animate-spin text-acid-green" />
                          <span>Gemini is analyzing wearable trends...</span>
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap">
                          {healthStore.insights ? healthStore.insights.split('\n').map((line, i) => {
                            if (line.startsWith('* ') || line.startsWith('- ')) {
                              return <li key={i} className="ml-4 list-disc mt-1">{line.replace(/^[\*\-]\s+/, '')}</li>;
                            }
                            if (line.startsWith('### ')) {
                              return <h5 key={i} className="text-xs font-black text-foreground mt-3 block uppercase tracking-wider">{line.replace('### ', '')}</h5>;
                            }
                            return <span key={i} className="block mt-1">{line}</span>;
                          }) : (
                            <span className="text-muted block py-2">Click Recalculate Insights to query Gemini for daily recommendations.</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* =======================================================================
              STEPS TAB
              ======================================================================= */}
          {activeSubTab === 'steps' && (
            <div className="glass p-6 rounded-3xl border border-card-border space-y-6">
              <div className="flex justify-between items-center border-b border-card-border pb-4 flex-wrap gap-4">
                <div>
                  <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Step Tracking Center</h3>
                  <p className="text-[10px] text-muted font-bold uppercase tracking-widest mt-0.5">Walk activity and calorie compilation</p>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-surface/50 border border-card-border p-1 rounded-xl text-center">
                  <div className="p-2">
                    <span className="text-[8px] text-muted font-black uppercase block">Today</span>
                    <span className="text-xs font-black text-foreground">{(latestMetrics.steps || 0).toLocaleString()}</span>
                  </div>
                  <div className="p-2 border-x border-card-border">
                    <span className="text-[8px] text-muted font-black uppercase block">Average</span>
                    <span className="text-xs font-black text-foreground">
                      {(healthStore.stepsHistory.length > 0
                        ? Math.round(healthStore.stepsHistory.reduce((s, x) => s + x.steps, 0) / healthStore.stepsHistory.length)
                        : 8400
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="p-2">
                    <span className="text-[8px] text-muted font-black uppercase block">Max</span>
                    <span className="text-xs font-black text-foreground">
                      {(healthStore.stepsHistory.length > 0
                        ? Math.max(...healthStore.stepsHistory.map(x => x.steps))
                        : 11200
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Steps Chart */}
              <div>
                <span className="text-xs font-black text-foreground uppercase block mb-4">Historical Steps - Last 7 Days</span>
                <BarChart data={stepsChartData} xKey="date" yKey="steps" color="var(--accent)" />
              </div>

              {/* Steps Aggregates Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-card-border pt-6">
                <div className="bg-surface/50 border border-card-border p-4 rounded-2xl">
                  <span className="text-[9px] text-muted font-black uppercase tracking-wider block">Total Steps Distance</span>
                  <div className="text-lg font-black text-foreground mt-2">
                    {healthStore.stepsHistory.reduce((s, x) => s + (x.distance || 0), 0).toFixed(1)} <span className="text-xs text-muted font-bold">km</span>
                  </div>
                </div>
                <div className="bg-surface/50 border border-card-border p-4 rounded-2xl">
                  <span className="text-[9px] text-muted font-black uppercase tracking-wider block">Total Calories Burned</span>
                  <div className="text-lg font-black text-foreground mt-2">
                    {healthStore.stepsHistory.reduce((s, x) => s + (x.caloriesBurned || 0), 0).toLocaleString()} <span className="text-xs text-muted font-bold">kcal</span>
                  </div>
                </div>
                <div className="bg-surface/50 border border-card-border p-4 rounded-2xl">
                  <span className="text-[9px] text-muted font-black uppercase tracking-wider block">Goal Compliance %</span>
                  <div className="text-lg font-black text-acid-green mt-2">
                    {Math.min(100, Math.round(
                      (healthStore.stepsHistory.filter(x => x.steps >= 10000).length / Math.max(1, healthStore.stepsHistory.length)) * 100
                    ))}%
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* =======================================================================
              SLEEP TAB
              ======================================================================= */}
          {activeSubTab === 'sleep' && (
            <div className="glass p-6 rounded-3xl border border-card-border space-y-6">
              
              <div className="flex justify-between items-center border-b border-card-border pb-4 flex-wrap gap-4">
                <div>
                  <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Sleep Tracking Center</h3>
                  <p className="text-[10px] text-muted font-bold uppercase tracking-widest mt-0.5">Sleep durations and consistency indices</p>
                </div>

                <div className="flex gap-4">
                  <div className="text-center">
                    <span className="text-[8px] text-muted font-black uppercase block">Average Duration</span>
                    <span className="text-xs font-black text-foreground">
                      {sleepChartData.length > 0
                        ? (sleepChartData.reduce((s, x) => s + x.duration, 0) / sleepChartData.length).toFixed(1)
                        : '7.2'
                      } hrs
                    </span>
                  </div>
                  <div className="text-center border-l border-card-border pl-4">
                    <span className="text-[8px] text-muted font-black uppercase block">Average Quality</span>
                    <span className="text-xs font-black text-foreground">
                      {healthStore.sleepHistory.length > 0
                        ? Math.round(healthStore.sleepHistory.reduce((s, x) => s + x.quality, 0) / healthStore.sleepHistory.length)
                        : 82
                      }%
                    </span>
                  </div>
                </div>
              </div>

              {/* Sleep Duration Line Chart */}
              <div>
                <span className="text-xs font-black text-foreground uppercase block mb-4">Sleep Duration Trends - Last 7 Days</span>
                <LineChart data={sleepChartData} xKey="date" yKey="duration" color="var(--color-blue)" />
              </div>

              {/* Sleep Phases breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-t border-card-border pt-6">
                <div className="bg-surface/50 border border-card-border p-4 rounded-2xl text-center">
                  <span className="text-[9px] text-muted font-black uppercase tracking-wider block">Deep Sleep</span>
                  <span className="text-md font-black text-foreground block mt-1.5">22% <span className="text-xs font-normal text-muted">(~1.6 hrs)</span></span>
                  <span className="text-[8px] text-muted font-bold block mt-1">Core physical restoration</span>
                </div>
                <div className="bg-surface/50 border border-card-border p-4 rounded-2xl text-center">
                  <span className="text-[9px] text-muted font-black uppercase tracking-wider block">REM Sleep</span>
                  <span className="text-md font-black text-foreground block mt-1.5">20% <span className="text-xs font-normal text-muted">(~1.4 hrs)</span></span>
                  <span className="text-[8px] text-muted font-bold block mt-1">Mental & memory recovery</span>
                </div>
                <div className="bg-surface/50 border border-card-border p-4 rounded-2xl text-center">
                  <span className="text-[9px] text-muted font-black uppercase tracking-wider block">Light Sleep</span>
                  <span className="text-md font-black text-foreground block mt-1.5">53% <span className="text-xs font-normal text-muted">(~3.8 hrs)</span></span>
                  <span className="text-[8px] text-muted font-bold block mt-1">Standard sleep cycles</span>
                </div>
                <div className="bg-surface/50 border border-card-border p-4 rounded-2xl text-center">
                  <span className="text-[9px] text-muted font-black uppercase tracking-wider block">Time Awake</span>
                  <span className="text-md font-black text-foreground block mt-1.5">5% <span className="text-xs font-normal text-muted">(~25 mins)</span></span>
                  <span className="text-[8px] text-muted font-bold block mt-1">Bedtime interruptions</span>
                </div>
              </div>

            </div>
          )}

          {/* =======================================================================
              HEART RATE TAB
              ======================================================================= */}
          {activeSubTab === 'heartrate' && (
            <div className="glass p-6 rounded-3xl border border-card-border space-y-6">
              
              <div className="flex justify-between items-center border-b border-card-border pb-4 flex-wrap gap-4">
                <div>
                  <h3 className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                    <Heart className="w-4 h-4 text-destructive animate-pulse" />
                    Heart Rate Diagnostics
                  </h3>
                  <p className="text-[10px] text-muted font-bold uppercase tracking-widest mt-0.5">Cardiovascular indexes and resting beats</p>
                </div>

                <div className="flex gap-4">
                  <div className="text-center">
                    <span className="text-[8px] text-muted font-black uppercase block">Resting HR Avg</span>
                    <span className="text-xs font-black text-foreground">{latestMetrics.restingHR || 62} bpm</span>
                  </div>
                  <div className="text-center border-l border-card-border pl-4">
                    <span className="text-[8px] text-muted font-black uppercase block">Current HR</span>
                    <span className="text-xs font-black text-destructive animate-pulse">74 bpm</span>
                  </div>
                </div>
              </div>

              {/* Heart Rate Line Chart */}
              <div>
                <span className="text-xs font-black text-foreground uppercase block mb-4">Resting Heart Rate Trends - Last 7 Days</span>
                <LineChart data={hrChartData} xKey="date" yKey="resting" color="var(--destructive)" />
              </div>

              {/* Real-time ticker stream look */}
              <div className="bg-surface/50 border border-card-border p-4 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-muted font-black uppercase tracking-wider block">Live Stream Ticker</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-destructive animate-ping"></span>
                </div>

                <div className="h-10 flex gap-2 items-end justify-around py-1">
                  {[68, 71, 74, 73, 70, 72, 75, 74, 76, 73, 71, 74].map((v, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: `${(v - 60) * 3}px` }}
                      transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse', delay: i * 0.1 }}
                      className="w-1.5 bg-destructive/60 rounded-full"
                    />
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* =======================================================================
              DEVICES TAB (CONNECTION MANAGEMENT)
              ======================================================================= */}
          {activeSubTab === 'devices' && (
            <div className="glass p-6 rounded-3xl border border-card-border space-y-6">
              <div>
                <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Device Connection Center</h3>
                <p className="text-[10px] text-muted font-bold uppercase tracking-widest mt-0.5">Integrate and manage third-party wearables</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    id: 'google',
                    name: 'Google Health Connect',
                    description: 'Direct system integration for Steps, Active Calories Burned, Distance, Heart Rate, Weight, Sleep, and exercise sessions.',
                    icon: '🏥'
                  },
                  {
                    id: 'fitbit',
                    name: 'Fitbit Integration',
                    description: 'Import Steps, Sleep analysis, active zone heart rate streams, active minutes, and calories burned aggregate indicators.',
                    icon: '⌚'
                  },
                  {
                    id: 'garmin',
                    name: 'Garmin Connect',
                    description: 'Synchronize high-performance running/cycling data, Resting Heart Rate, VO2 Max, recovery times, and Sleep scoring.',
                    icon: '🛰️'
                  },
                  {
                    id: 'samsung',
                    name: 'Samsung Health',
                    description: 'Link Samsung Health data for steps tracking, heart rate monitors, and active exercise categories.',
                    icon: '📱'
                  },
                  {
                    id: 'apple',
                    name: 'Apple HealthKit Ready',
                    description: 'Prepared hooks for Apple Watch syncing. Connection details will be deployed on native container integration.',
                    icon: '🍏',
                    disabled: true
                  }
                ].map((device) => {
                  const conn = connections.find(c => c.provider === device.id);
                  const isConnected = conn?.connected;

                  return (
                    <div key={device.id} className="bg-surface/50 border border-card-border p-5 rounded-2xl flex flex-col justify-between space-y-4">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-black/20 border border-card-border flex items-center justify-center text-2xl shrink-0">
                          {device.icon}
                        </div>

                        <div className="space-y-1">
                          <h4 className="text-xs font-black text-foreground uppercase tracking-wider">{device.name}</h4>
                          <p className="text-[10px] text-muted font-semibold leading-relaxed">{device.description}</p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center border-t border-card-border pt-4">
                        <span className="text-[9px] text-muted font-bold uppercase">
                          {device.disabled ? 'Native Shell Only' : isConnected ? `Last Sync: ${conn.lastSync}` : 'Offline'}
                        </span>

                        <div className="flex gap-2">
                          {isConnected && !device.disabled && (
                            <button
                              onClick={() => handleDeviceSync(device.id)}
                              disabled={healthStore.syncing}
                              className="px-3 py-1.5 rounded-lg bg-surface border border-card-border hover:border-acid-green text-[9px] font-black uppercase tracking-wider text-foreground cursor-pointer transition-all disabled:opacity-50"
                            >
                              Sync Now
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleToggleConnection(device.id, !isConnected)}
                            disabled={device.disabled}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer border transition-all ${
                              device.disabled 
                                ? 'bg-surface text-muted border-transparent opacity-50'
                                : isConnected
                                ? 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive hover:text-white'
                                : 'bg-acid-green text-accent-foreground border-acid-green hover:shadow-md'
                            }`}
                          >
                            {isConnected ? 'Disconnect' : 'Connect'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* =======================================================================
              GOALS & CHALLENGES TAB
              ======================================================================= */}
          {activeSubTab === 'goals' && (
            <div className="space-y-6">
              
              {/* Active Goals Panel */}
              <div className="glass p-6 rounded-3xl border border-card-border space-y-6">
                <div className="flex justify-between items-center border-b border-card-border pb-4">
                  <div>
                    <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Personalized Health Targets</h3>
                    <p className="text-[10px] text-muted font-bold uppercase tracking-widest mt-0.5">Track daily biometric goals automatically</p>
                  </div>

                  <button
                    onClick={() => setNewGoalOpen(!newGoalOpen)}
                    className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-acid-green text-accent-foreground text-xs font-black uppercase tracking-wider hover:shadow-md transition-all cursor-pointer border-none"
                  >
                    <PlusCircle className="w-4 h-4 text-accent-foreground" />
                    Add Goal
                  </button>
                </div>

                {/* New Goal Form Overlay */}
                <AnimatePresence>
                  {newGoalOpen && (
                    <motion.form
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      onSubmit={handleAddGoal}
                      className="bg-surface/50 border border-card-border p-5 rounded-2xl space-y-4 overflow-hidden"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] text-muted font-bold uppercase tracking-wider">Goal Name</label>
                          <input
                            type="text"
                            placeholder="e.g. 10,000 Steps"
                            value={newGoalName}
                            onChange={(e) => setNewGoalName(e.target.value)}
                            className="bg-background border border-card-border rounded-xl px-3 py-2 text-xs focus:border-acid-green"
                            required
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] text-muted font-bold uppercase tracking-wider">Target Metric Type</label>
                          <select
                            value={newGoalType}
                            onChange={(e) => setNewGoalType(e.target.value)}
                            className="bg-background border border-card-border rounded-xl px-3 py-2 text-xs focus:border-acid-green cursor-pointer"
                          >
                            <option value="steps">Steps Count</option>
                            <option value="sleep">Sleep (Hours)</option>
                            <option value="calories">Active Calories (kcal)</option>
                            <option value="distance">Distance (km)</option>
                            <option value="recovery">Recovery Score</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] text-muted font-bold uppercase tracking-wider">Target Value</label>
                          <input
                            type="number"
                            value={newGoalTarget}
                            onChange={(e) => setNewGoalTarget(e.target.value)}
                            className="bg-background border border-card-border rounded-xl px-3 py-2 text-xs focus:border-acid-green"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setNewGoalOpen(false)}
                          className="px-4 py-2 border border-card-border rounded-xl text-xs font-bold uppercase tracking-wider text-muted cursor-pointer bg-transparent"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-acid-green text-accent-foreground rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer border-none"
                        >
                          Create Goal
                        </button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>

                {/* Goals List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {healthStore.goals.map((g) => {
                    const pct = Math.min(100, Math.round((g.progress / g.target) * 100));
                    
                    return (
                      <div key={g.id} className="bg-surface/50 border border-card-border p-4 rounded-2xl flex flex-col justify-between space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[9px] text-muted font-bold uppercase tracking-widest">{g.type} Target</span>
                            <h4 className="text-xs font-black text-foreground mt-0.5">{g.name}</h4>
                          </div>

                          <button
                            onClick={() => handleDeleteGoal(g.id)}
                            className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 hover:text-destructive transition-all cursor-pointer border-none bg-transparent"
                          >
                            <Trash2 className="w-4 h-4 text-muted hover:text-destructive" />
                          </button>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span className="text-muted">Progress: {g.progress} / {g.target}</span>
                            <span className={g.completed ? "text-acid-green" : "text-muted"}>{pct}%</span>
                          </div>

                          <div className="h-2 bg-background border border-card-border rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.8, ease: 'easeOut' }}
                              className={`h-full rounded-full ${g.completed ? 'bg-acid-green' : 'bg-muted-foreground/60'}`}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>

              {/* Health Challenges Panel */}
              <div className="glass p-6 rounded-3xl border border-card-border space-y-6">
                <div>
                  <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Active Gamified Challenges</h3>
                  <p className="text-[10px] text-muted font-bold uppercase tracking-widest mt-0.5">Complete milestone achievements and unlock prizes</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {healthStore.challenges.map((c) => {
                    const pct = Math.min(100, Math.round((c.progress / c.target) * 100));

                    return (
                      <div key={c.id} className="bg-surface/40 border border-card-border p-5 rounded-2xl flex gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-acid-green/10 border border-acid-green/20 flex items-center justify-center text-xl shrink-0">
                          🏆
                        </div>

                        <div className="flex-1 space-y-3">
                          <div>
                            <div className="flex justify-between items-center">
                              <h4 className="text-xs font-black text-foreground uppercase tracking-wider">{c.name}</h4>
                              <span className="text-[8.5px] font-black uppercase text-acid-green px-2 py-0.5 rounded-md bg-acid-green/10">
                                {c.duration}
                              </span>
                            </div>
                            <p className="text-[9px] text-muted font-semibold mt-1 leading-relaxed">{c.description}</p>
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-[9px] font-bold">
                              <span className="text-muted">Progress: {c.progress.toLocaleString()} / {c.target.toLocaleString()} {c.unit}</span>
                              <span className={c.completed ? "text-acid-green font-black" : "text-muted"}>{pct}%</span>
                            </div>

                            <div className="h-1.5 bg-background border border-card-border rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                className={`h-full rounded-full ${c.completed ? 'bg-acid-green' : 'bg-muted-foreground/60'}`}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>

            </div>
          )}

          {/* =======================================================================
              REPORTS TAB
              ======================================================================= */}
          {activeSubTab === 'reports' && (
            <div className="glass p-6 rounded-3xl border border-card-border space-y-6">
              
              <div className="flex justify-between items-center border-b border-card-border pb-4 flex-wrap gap-4">
                <div>
                  <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Biometric Diagnostics Report Generator</h3>
                  <p className="text-[10px] text-muted font-bold uppercase tracking-widest mt-0.5">Export structured PDF health summaries</p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="bg-surface border border-card-border rounded-xl px-3 py-2 text-xs font-bold text-foreground focus:outline-none cursor-pointer"
                  >
                    <option value="weekly">Weekly Report</option>
                    <option value="monthly">Monthly Report</option>
                  </select>

                  <input
                    type="text"
                    value={reportRange}
                    onChange={(e) => setReportRange(e.target.value)}
                    className="bg-surface border border-card-border rounded-xl px-3 py-2 text-xs font-bold text-foreground focus:outline-none w-36"
                  />

                  <button
                    onClick={handleGenerateReport}
                    disabled={healthStore.generatingReport}
                    className="py-2 px-4 rounded-xl bg-acid-green text-accent-foreground text-xs font-black uppercase tracking-wider hover:shadow-md transition-all cursor-pointer border-none disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {healthStore.generatingReport ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin"></span>
                        Compiling...
                      </>
                    ) : 'Compile Report'}
                  </button>
                </div>
              </div>

              {/* Reports List */}
              <div className="space-y-4">
                {healthStore.healthReports.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-card-border rounded-2xl bg-surface/20">
                    <FileText className="w-10 h-10 text-muted mx-auto mb-2 opacity-50" />
                    <p className="text-xs text-muted font-black uppercase tracking-wider">No generated reports found</p>
                    <p className="text-[10px] text-muted font-semibold mt-1">Select report details above and click Compile Report.</p>
                  </div>
                ) : (
                  healthStore.healthReports.map((report) => (
                    <div key={report.id || report.timestamp} className="bg-surface/50 border border-card-border p-5 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                      
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-acid-green"></span>
                          <span className="text-xs font-black uppercase tracking-wider text-foreground">
                            {report.reportType.toUpperCase()} HEALTH REPORT
                          </span>
                          <span className="text-[9px] text-muted font-bold">({report.dateRange})</span>
                        </div>

                        <div className="text-[10px] text-muted font-semibold max-h-[90px] overflow-y-auto pr-2">
                          <p className="line-clamp-2 leading-relaxed">{report.summaryText.replace(/###\s/g, '').replace(/\*\*/g, '')}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-center bg-black/20 border border-card-border p-2 rounded-xl w-20">
                          <span className="text-[8px] text-muted font-black uppercase block">Health Score</span>
                          <span className="text-sm font-black text-acid-green">{report.healthScore}</span>
                        </div>

                        <button
                          onClick={() => handleExportPDF(report)}
                          className="py-2.5 px-4 rounded-xl bg-surface border border-card-border hover:border-acid-green text-xs font-black uppercase tracking-wider text-foreground hover:text-acid-green cursor-pointer transition-all flex items-center gap-1.5"
                        >
                          <FileText className="w-4 h-4" />
                          Export PDF
                        </button>
                      </div>

                    </div>
                  ))
                )}
              </div>

            </div>
          )}
        </motion.div>
      </AnimatePresence>

    </div>
  );
}
