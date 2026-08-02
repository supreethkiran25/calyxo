import React, { useState } from 'react';
import { Bot, Sparkles, Cpu, Clock, DollarSign, CheckCircle, AlertTriangle } from 'lucide-react';

const AdminAIView = () => {
  const [model, setModel] = useState('Gemini 3.6 Flash (High)');
  const [systemPrompt, setSystemPrompt] = useState(
    'You are Calyxo AI Coach, an elite, motivational, evidence-based fitness and nutrition assistant.'
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Bot className="w-6 h-6 text-purple-400" /> AI System & Models Center
        </h1>
        <p className="text-xs text-neutral-400 font-mono mt-0.5">
          Monitor Gemini API request volume, token usage, estimated costs & system prompt templates
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
          <span className="text-xs text-neutral-400 font-medium block">Daily AI Requests</span>
          <span className="text-2xl font-bold text-purple-400 block mt-1">6,420</span>
          <span className="text-[10px] text-neutral-500 font-mono mt-1 block">+14% vs yesterday</span>
        </div>
        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
          <span className="text-xs text-neutral-400 font-medium block">Average Response Latency</span>
          <span className="text-2xl font-bold text-emerald-400 block mt-1">1.24s</span>
          <span className="text-[10px] text-neutral-500 font-mono mt-1 block">99.8% SLA success</span>
        </div>
        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
          <span className="text-xs text-neutral-400 font-medium block">Token Consumption (Today)</span>
          <span className="text-2xl font-bold text-indigo-400 block mt-1">4.82 M</span>
          <span className="text-[10px] text-neutral-500 font-mono mt-1 block">Input: 3.2M | Output: 1.6M</span>
        </div>
        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
          <span className="text-xs text-neutral-400 font-medium block">Estimated API Cost (Month)</span>
          <span className="text-2xl font-bold text-amber-400 block mt-1">$142.50</span>
          <span className="text-[10px] text-neutral-500 font-mono mt-1 block">Google Gemini API</span>
        </div>
      </div>

      {/* Model Settings & System Prompt */}
      <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Cpu className="w-4 h-4 text-purple-400" /> Active AI Model & Prompt Template
        </h3>

        <div className="space-y-3 text-xs">
          <div>
            <label className="text-neutral-400 font-medium block mb-1">Default AI Engine Model</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
            >
              <option value="Gemini 3.6 Flash (High)">Gemini 3.6 Flash (High) — Recommended for Speed & Reasoning</option>
              <option value="Gemini 1.5 Pro">Gemini 1.5 Pro — Deep Complex Analysis</option>
            </select>
          </div>

          <div>
            <label className="text-neutral-400 font-medium block mb-1">Global System Prompt Instruction</label>
            <textarea
              rows="4"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
            />
          </div>

          <button
            onClick={() => alert('AI Model configuration updated!')}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold"
          >
            Save AI Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminAIView;
