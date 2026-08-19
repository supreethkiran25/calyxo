import React, { useState } from 'react';
import { Layers, CheckCircle2, ChevronDown, ChevronUp, Database } from 'lucide-react';

export default function DatabaseStatsBanner({ stats }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!stats) return null;

  return (
    <div className="bg-surface border border-card-border rounded-2xl p-4 shadow-sm space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-acid-green/10 flex items-center justify-center text-acid-green shrink-0">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground">Normalized Food Database</span>
              <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 bg-emerald-500/15 text-emerald-400 rounded font-bold flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5" /> 100% Data Preserved
              </span>
            </div>
            <p className="text-[10px] text-muted font-mono">
              Clustered {stats.originalFoodsCount.toLocaleString()} raw records into {stats.finalVisibleCategories.toLocaleString()} clean core dishes
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[10px] font-mono uppercase font-bold text-acid-green hover:underline cursor-pointer border-none bg-transparent self-start sm:self-auto flex items-center gap-1"
        >
          {isExpanded ? 'Hide Architecture' : 'View Architecture'}
          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Grid of Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-card-border/60">
        <div className="p-2 rounded-xl bg-[var(--input)] border border-card-border/50">
          <span className="text-[9px] font-mono uppercase text-muted block">Original Records</span>
          <span className="text-sm font-extrabold text-foreground">{stats.originalFoodsCount.toLocaleString()}</span>
        </div>

        <div className="p-2 rounded-xl bg-[var(--input)] border border-card-border/50">
          <span className="text-[9px] font-mono uppercase text-muted block">Variants Merged</span>
          <span className="text-sm font-extrabold text-acid-green">{stats.foodsMergedIntoGroups.toLocaleString()}</span>
        </div>

        <div className="p-2 rounded-xl bg-[var(--input)] border border-card-border/50">
          <span className="text-[9px] font-mono uppercase text-muted block">Core Visible Dishes</span>
          <span className="text-sm font-extrabold text-cyan-400">{stats.finalVisibleCategories.toLocaleString()}</span>
        </div>

        <div className="p-2 rounded-xl bg-[var(--input)] border border-card-border/50">
          <span className="text-[9px] font-mono uppercase text-muted block">Taxonomy Structure</span>
          <span className="text-sm font-extrabold text-foreground">4-Level Matrix</span>
        </div>
      </div>

      {/* Expanded Technical Note */}
      {isExpanded && (
        <div className="pt-2 text-[11px] text-muted space-y-1.5 border-t border-card-border/60 font-mono leading-relaxed">
          <p>
            • <strong>Normalization Layer:</strong> Raw database records with varying cooking styles (steamed, boiled, fried), regional labels (Kerala, Chettinad, Lucknowi), and serving artifacts (100g, 1 cup) are automatically parsed and structured as selectable variations under their canonical parent dish.
          </p>
          <p>
            • <strong>Nutritional Accuracy:</strong> Every variation retains its exact original calories, protein, carbohydrates, and fat profile without approximation.
          </p>
        </div>
      )}
    </div>
  );
}
