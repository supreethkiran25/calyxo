/**
 * Calyxo Unified Design System Tokens
 * Strictly adherence to Section 48-53 of Calyxo Master Specification:
 * - Premium, Athletic, Modern, Minimal, Dark-first
 * - Semantic tokens for backgrounds, text, borders, macros, accents
 * - Thumb-friendly 44px+ tap targets
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
    
    // Status
    success: 'var(--success, #10B981)',
    warning: 'var(--warning, #F59E0B)',
    danger: 'var(--destructive, #EF4444)',
    info: '#3B82F6',

    // Nutrition & Hydration Semantic Tokens
    protein: '#3B82F6', // Blue
    carbs: '#F59E0B',   // Amber
    fat: '#EC4899',     // Rose / Pink
    hydration: '#06B6D4', // Cyan
    calories: 'var(--accent, #059669)',

    // Typography
    textPrimary: 'var(--text-primary)',
    textSecondary: 'var(--text-secondary)',
    textMuted: 'var(--text-muted)',
    textDisabled: 'var(--text-disabled)'
  },

  typography: {
    display: 'font-black tracking-tight text-3xl sm:text-4xl font-display',
    heading: 'font-extrabold tracking-tight text-xl sm:text-2xl',
    subheading: 'font-bold tracking-normal text-base sm:text-lg',
    body: 'font-normal text-sm sm:text-base leading-relaxed',
    caption: 'font-medium text-xs text-muted-foreground',
    metric: 'font-black font-mono tracking-tight text-2xl sm:text-3xl',
    monoSmall: 'font-mono text-xs font-semibold'
  },

  spacing: {
    screenPadding: 'px-4 sm:px-6 lg:px-8',
    cardPadding: 'p-4 sm:p-5',
    sectionGap: 'space-y-6',
    itemGap: 'gap-3 sm:gap-4'
  },
  
  radii: {
    sm: '8px',
    md: '14px',
    lg: '20px',
    xl: '28px',
    full: '9999px'
  },

  tapTargets: {
    minHeight: 'min-h-[44px]',
    minWidth: 'min-w-[44px]',
    button: 'h-12 px-5 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-97'
  },
  
  shadows: {
    card: 'var(--card-shadow)',
    elevated: '0 10px 30px -5px rgba(0, 0, 0, 0.25), 0 4px 10px -2px rgba(0, 0, 0, 0.1)',
    accentGlow: '0 0 20px -3px rgba(204, 255, 0, 0.25)'
  }
};

export default CalyxoTokens;
