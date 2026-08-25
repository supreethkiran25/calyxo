/**
 * Calyxo Unified Semantic Design Tokens
 * 
 * Defines CSS-variable driven color, typography, spacing, and radius primitives
 * that automatically reflect the active theme (Obsidian Dark, Light, Solarized, Emerald).
 */

export const CalyxoTokens = {
  colors: {
    background: 'var(--background)',
    surface: 'var(--surface)',
    surfaceElevated: 'var(--surface-elevated)',
    surfaceSubtle: 'var(--surface-subtle)',
    surfaceInteractive: 'var(--surface-interactive)',
    border: 'var(--border)',
    borderSubtle: 'var(--border-subtle)',
    borderStrong: 'var(--border-strong)',
    
    // Brand Accents
    accent: 'var(--accent)',
    accentDim: 'var(--accent-dim)',
    accentSoft: 'var(--accent-soft)',
    accentForeground: 'var(--accent-foreground)',
    emerald: 'var(--success)',
    amber: 'var(--warning)',
    rose: 'var(--destructive)',
    
    // Typography
    textPrimary: 'var(--text-primary)',
    textSecondary: 'var(--text-secondary)',
    textMuted: 'var(--text-muted)',
    textDisabled: 'var(--text-disabled)'
  },
  
  radii: {
    sm: '8px',
    md: '14px',
    lg: '20px',
    xl: '28px',
    full: '9999px'
  },
  
  shadows: {
    card: 'var(--card-shadow)',
    elevated: '0 10px 30px -5px rgba(0, 0, 0, 0.1), 0 4px 10px -2px rgba(0, 0, 0, 0.05)'
  }
};
